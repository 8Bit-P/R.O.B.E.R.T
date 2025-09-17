use nalgebra::{ UnitQuaternion, Vector3};
use serde::Serialize;

#[derive(Debug, Clone)]
pub struct Transform {
    pub position: Vector3<f32>,        // x, y, z
    pub rotation: UnitQuaternion<f32>, // quaternion for rotation
}

#[derive(Serialize, Clone, Copy)]
pub struct RobotTransformPayload {
    pub(crate) x: f32,
    pub(crate) y: f32,
    pub(crate) z: f32,
    pub(crate) yaw: f32,
    pub(crate) pitch: f32,
    pub(crate) roll: f32,
}
