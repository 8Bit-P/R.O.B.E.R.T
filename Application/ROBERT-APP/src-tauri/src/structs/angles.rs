use serde::Serialize;

#[derive(Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SteppersAngles {
    pub j1: Option<f32>,
    pub j2: Option<f32>,
    pub j3: Option<f32>,
    pub j4: Option<f32>,
    pub j5: Option<f32>,
    pub j6: Option<f32>,
}

#[derive(Debug, Clone, Copy)]
pub struct AngleLimits {
    pub min: f32,
    pub max: f32,
}