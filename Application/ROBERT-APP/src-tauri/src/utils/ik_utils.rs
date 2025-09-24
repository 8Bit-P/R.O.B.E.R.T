use crate::structs::transform::{RobotTransformPayload, Transform};
use crate::utils::stepper_utils::get_steppers_angles;
use crate::{constants, state::SharedAppState};
use colored::Colorize;
use nalgebra::{Matrix4, Matrix6, Rotation3, UnitQuaternion, Vector3, Vector6};
use tauri::{AppHandle, Emitter};

/// Compute the homogeneous transformation matrix from DH parameters
fn dh_matrix(a: f32, alpha: f32, d: f32, theta: f32) -> Matrix4<f32> {
    let ct = theta.cos();
    let st = theta.sin();
    let ca = alpha.cos();
    let sa = alpha.sin();

    Matrix4::new(ct, -st * ca, st * sa, a * ct, st, ct * ca, -ct * sa, a * st, 0.0, sa, ca, d, 0.0, 0.0, 0.0, 1.0)
}

/// Forward kinematics returning transform for each joint (including end effector).
pub fn forward_kinematics_all(joint_angles: [f32; 6]) -> Vec<Transform> {
    let mut t_total = Matrix4::<f32>::identity();
    let mut transforms: Vec<Transform> = Vec::new();

    // Push the base origin (J1)
    transforms.push(Transform { position: Vector3::new(0.0, 0.0, 0.0), rotation: Rotation3::identity().into() });

    for (i, dh) in constants::DH_TABLE.iter().enumerate() {
        // Add the current joint angle to the base theta
        let theta = dh.theta + joint_angles[i];
        t_total *= dh_matrix(dh.a, dh.alpha, dh.d, theta);

        // Extract position
        let position = Vector3::new(t_total[(0, 3)], t_total[(1, 3)], t_total[(2, 3)]);

        // Extract roll, pitch, yaw
        let rot = t_total.fixed_view::<3, 3>(0, 0);
        let pitch = (-rot[(2, 0)]).asin();
        let yaw = rot[(1, 0)].atan2(rot[(0, 0)]);
        let roll = rot[(2, 1)].atan2(rot[(2, 2)]);

        transforms.push(Transform { position, rotation: Rotation3::from_euler_angles(roll, pitch, yaw).into() });
    }

    transforms
}

//Fetches the stepper angles from the arduino and calculates the transform of the end effector
//It returns it as an array [x,y,z,yaw,pitch,roll]
pub async fn get_robot_transform_from_angles(app: &AppHandle, state: SharedAppState) -> Result<[f32; 6], String> {
    let stepper_angles = get_steppers_angles(app, state.clone()).await?;

    println!("{}", format!("###DEBUG### - Calculating FK").purple());

    // Convert Option<f32> to f32 with 0.0 fallback
    let joint_angles: [f32; 6] = stepper_angles.map(|angle_opt| angle_opt.unwrap_or(0.0));
    // let joint_angles: [f32; 6] = [30.0, 0.0, 0.0, 0.0, 0.0, 0.0];

    // Convert to radians
    let joint_angles_radians: [f32; 6] = joint_angles.map(|a| a.to_radians());

    // Compute forward kinematics for all joints
    let transforms = forward_kinematics_all(joint_angles_radians);

    // Build payloads for each joint
    let mut joint_payloads = Vec::new();

    for (_i, transform) in transforms.iter().enumerate() {
        let euler: Rotation3<f32> = transform.rotation.into();
        let (roll, pitch, yaw) = euler.euler_angles();

        joint_payloads.push(RobotTransformPayload {
            x: transform.position[0],
            y: transform.position[1],
            z: transform.position[2],
            yaw: yaw.to_degrees(),
            pitch: pitch.to_degrees(),
            roll: roll.to_degrees(),
        });
    }

    // Emit the event with all joint transforms
    if let Err(e) = app.emit("report-robot-transforms", joint_payloads.clone()) {
        println!("Failed to emit robot transforms event: {:?}", e);
    }

    // End effector is the last transform
    if let Some(end_effector) = joint_payloads.last() {
        Ok([
            end_effector.x,
            end_effector.y,
            end_effector.z,
            end_effector.yaw,
            end_effector.pitch,
            end_effector.roll,
        ])
    } else {
        Err("No transforms computed".to_string())
    }
}

/// Compute orientation error as a 3D rotation vector
fn rotation_error(current: &Rotation3<f32>, target: &Rotation3<f32>) -> Vector3<f32> {
    let r_err = target * current.transpose();
    let angle = r_err.angle();
    if angle.abs() < 1e-6 {
        return Vector3::zeros();
    }
    let axis = r_err.axis().unwrap_or(Vector3::x_axis());
    axis.into_inner() * angle
}

/// Compute 6x1 error vector [position_error; orientation_error]
fn compute_error(current_transform: &Transform, target_transform: &Transform) -> Vector6<f32> {
    let pos_err = target_transform.position - current_transform.position;

    let current_rot: Rotation3<f32> = current_transform.rotation.into();
    let target_rot: Rotation3<f32> = target_transform.rotation.into();
    let orient_err = rotation_error(&current_rot, &target_rot);

    Vector6::from_iterator(pos_err.iter().chain(orient_err.iter()).cloned())
}

/// Compute the 6x6 Jacobian for a given joint configuration
fn compute_jacobian(joint_angles: [f32; 6]) -> Matrix6<f32> {
    let transforms = forward_kinematics_all(joint_angles);
    let mut j = Matrix6::<f32>::zeros();
    let ee_pos = transforms.last().unwrap().position;

    for i in 0..6 {
        let rot_i: Rotation3<f32> = transforms[i].rotation.into();
        let rot_matrix = rot_i.matrix(); // get &Matrix3<f32>
        let z_i = rot_matrix.column(2).into_owned(); // 3x1 column vector

        let o_i = transforms[i].position;
        let linear = z_i.cross(&(ee_pos - o_i));
        let angular = z_i;

        j[(0, i)] = linear[0];
        j[(1, i)] = linear[1];
        j[(2, i)] = linear[2];
        j[(3, i)] = angular[0];
        j[(4, i)] = angular[1];
        j[(5, i)] = angular[2];
    }

    j
}


/// Numerical IK solver using Jacobian pseudo-inverse
pub async fn get_angles_from_end_effector_transform(
    end_effector_transform_vector: [f32; 6],
    app: &AppHandle,
    state: SharedAppState,
) -> Result<[f32; 6], String> {
    
    let end_effector_transform: Transform = {
        // Extract values
        let x = end_effector_transform_vector[0];
        let y = end_effector_transform_vector[1];
        let z = end_effector_transform_vector[2];

        let yaw_deg = end_effector_transform_vector[3];
        let pitch_deg = end_effector_transform_vector[4];
        let roll_deg = end_effector_transform_vector[5];

        // Convert degrees to radians
        let yaw = yaw_deg.to_radians();
        let pitch = pitch_deg.to_radians();
        let roll = roll_deg.to_radians();

        // Build rotation and convert to Unit<Quaternion<f32>>
        let rotation: UnitQuaternion<f32> = Rotation3::from_euler_angles(roll, pitch, yaw).into();

        Transform { position: Vector3::new(x, y, z), rotation }
    };

    // Initial guess (current robot angles)
    let mut q = {
        let stepper_angles = crate::utils::stepper_utils::get_steppers_angles(app, state.clone()).await?;
        stepper_angles.map(|a| a.unwrap_or(0.0).to_radians())
    };

    let max_iterations = 500;
    let tolerance = 1e-3;
    let alpha = 0.5; // step size

    for _ in 0..max_iterations {
        let fk_transforms = forward_kinematics_all(q);
        let ee_transform = fk_transforms.last().unwrap();
        let error_vec = compute_error(ee_transform, &end_effector_transform);

        if error_vec.norm() < tolerance {
            // Converged
            return Ok(q.map(|a| a.to_degrees()));
        }

        // Compute Jacobian
        let j = compute_jacobian(q);

        // Damped pseudo-inverse for stability
        let lambda = 0.01;
        let j_t = j.transpose();
        let j_pseudo = j_t
            * (j * j_t + Matrix6::<f32>::identity() * lambda * lambda)
                .try_inverse()
                .unwrap_or(Matrix6::<f32>::identity());

        // Joint update
        let delta_q = j_pseudo * error_vec * alpha;
        for i in 0..6 {
            q[i] += delta_q[i];
        }
    }

    Err("IK did not converge".to_string())
}
