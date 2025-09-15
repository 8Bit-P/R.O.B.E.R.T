use crate::structs::transform::{RobotTransformPayload, Transform};
use crate::utils::stepper_utils::get_steppers_angles;
use crate::{constants, state::SharedAppState};
use colored::Colorize;
use nalgebra::{Matrix4, Rotation3, Vector3};
use tauri::{AppHandle, Emitter};

/// Compute the homogeneous transformation matrix from DH parameters
fn dh_matrix(a: f32, alpha: f32, d: f32, theta: f32) -> Matrix4<f32> {
    let ct = theta.cos();
    let st = theta.sin();
    let ca = alpha.cos();
    let sa = alpha.sin();

    Matrix4::new(ct, -st * ca, st * sa, a * ct, st, ct * ca, -ct * sa, a * st, 0.0, sa, ca, d, 0.0, 0.0, 0.0, 1.0)
}

/// Forward kinematics using DH_TABLE and joint angles
pub fn forward_kinematics(joint_angles: [f32; 6]) -> Transform {
    // Cumulative transformation
    let mut t_total = Matrix4::<f32>::identity();

    for (i, dh) in constants::DH_TABLE.iter().enumerate() {
        // Add the current joint angle to the base theta
        let theta = dh.theta + joint_angles[i];
        t_total *= dh_matrix(dh.a, dh.alpha, dh.d, theta);
    }

    // Extract position
    let position = Vector3::new(t_total[(0, 3)], t_total[(1, 3)], t_total[(2, 3)]);

    // Extract roll, pitch, yaw from rotation matrix
    let rot = t_total.fixed_view::<3, 3>(0, 0);
    let pitch = (-rot[(2, 0)]).asin();
    let yaw = rot[(1, 0)].atan2(rot[(0, 0)]);
    let roll = rot[(2, 1)].atan2(rot[(2, 2)]);

    Transform {
        position,
        rotation: Rotation3::from_euler_angles(roll, pitch, yaw).into(),
        scale: nalgebra::Vector3::new(1.0, 1.0, 1.0),
    }
}

//Fetches the stepper angles from the arduino and calculates the transform of the end effector
//It returns it as an array [x,y,z,yaw,pitch,roll]

pub async fn get_robot_transform_from_angles(app: &AppHandle, state: SharedAppState) -> Result<[f32; 6], String> {
    let stepper_angles = get_steppers_angles(app, state.clone()).await?;

    println!("{}", format!("###DEBUG### - Calculating FK").purple());

    // Convert Option<f32> to f32 with 0.0 fallback
    let joint_angles: [f32; 6] = stepper_angles.map(|angle_opt| angle_opt.unwrap_or(0.0));

    // Compute forward kinematics
    let transform = forward_kinematics(joint_angles);

    // Extract roll, pitch, yaw from rotation (UnitQuaternion)
    let euler: Rotation3<f32> = transform.rotation.into();
    let (roll, pitch, yaw) = euler.euler_angles();

    // Convert to degrees
    let payload = RobotTransformPayload {
        x: transform.position[0],
        y: transform.position[1],
        z: transform.position[2],
        yaw: yaw.to_degrees(),
        pitch: pitch.to_degrees(),
        roll: roll.to_degrees(),
    };

    // Emit the event safely
    if let Err(e) = app.emit("report-robot-transform", payload) {
        println!("Failed to emit robot transform event: {:?}", e);
    }

    Ok([payload.x, payload.y, payload.z, payload.yaw, payload.pitch, payload.roll])
}
