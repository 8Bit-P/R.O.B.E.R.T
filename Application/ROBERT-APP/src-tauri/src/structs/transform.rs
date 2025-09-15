use nalgebra::{Matrix4, UnitQuaternion, Vector3};
use serde::Serialize;

#[derive(Debug, Clone)]
pub struct Transform {
    pub position: Vector3<f32>,        // x, y, z
    pub rotation: UnitQuaternion<f32>, // quaternion for rotation
    pub scale: Vector3<f32>,           // optional scale
}

impl Transform {
    /// Create a new identity transform
    pub fn identity() -> Self {
        Self {
            position: Vector3::zeros(),
            rotation: UnitQuaternion::identity(),
            scale: Vector3::new(1.0, 1.0, 1.0),
        }
    }

    /// Convert the transform into a 4x4 homogeneous matrix
    pub fn to_matrix(&self) -> Matrix4<f32> {
        Matrix4::new_translation(&self.position) * self.rotation.to_homogeneous() * Matrix4::new_nonuniform_scaling(&self.scale)
    }

    /// Compute the inverse transform matrix
    pub fn inverse(&self) -> Matrix4<f32> {
        self.to_matrix().try_inverse().unwrap_or_else(Matrix4::identity)
    }

    /// Compute the inverse-transpose (useful for transforming normals)
    pub fn inverse_transpose(&self) -> Matrix4<f32> {
        self.inverse().transpose()
    }
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
