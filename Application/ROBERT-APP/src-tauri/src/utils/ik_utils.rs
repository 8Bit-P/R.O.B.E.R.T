use crate::structs::transform::Transform;
use nalgebra::{ Matrix4, Rotation3, Vector3};
use crate::constants;

/// Compute the homogeneous transformation matrix from DH parameters
fn dh_matrix(a: f32, alpha: f32, d: f32, theta: f32) -> Matrix4<f32> {
    let ct = theta.cos();
    let st = theta.sin();
    let ca = alpha.cos();
    let sa = alpha.sin();

    Matrix4::new(
        ct, -st * ca, st * sa, a * ct,
        st, ct * ca, -ct * sa, a * st,
        0.0, sa, ca, d,
        0.0, 0.0, 0.0, 1.0,
    )
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
    let position = Vector3::new(
        t_total[(0, 3)],
        t_total[(1, 3)],
        t_total[(2, 3)],
    );

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