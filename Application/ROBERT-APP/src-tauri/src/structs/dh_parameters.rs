//Denavit–Hartenberg (DH) parameters
#[derive(Debug, Clone, Copy)]
pub struct DHParameters {
    pub theta: f32,
    pub d: f32,
    pub a: f32,
    pub alpha: f32,
}