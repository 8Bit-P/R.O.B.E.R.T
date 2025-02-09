use once_cell::sync::Lazy;
use std::collections::HashMap;

// Command Codes
pub struct CommandCodes;

impl CommandCodes {
    pub const MOVE: &'static str = "MOVE>";
    pub const CHECK: &'static str = "CHECK>";
    pub const SETVEL: &'static str = "SETVEL>";
    pub const SETACC: &'static str = "SETACC>";
    pub const TOGGLE: &'static str = "TOGGLE>";
    pub const CALIBRATE: &'static str = "CALIBRATE>";
}

// Response Codes
pub struct ResponseCodes;

impl ResponseCodes {
    pub const CONNECTED_RESPONSE: &'static str = "CONNECTED";
    pub const CALIBRATION_RESPONSE: &'static str = "[CALIBRATION];";
}

// Error Codes (as a HashMap for easy lookup by code)
pub static ERROR_CODES: Lazy<HashMap<&'static str, &'static str>> = Lazy::new(|| {
    let mut m = HashMap::new();
    m.insert("C001", "Command was not properly formatted");
    m.insert("C002", "Command not defined");
    m.insert("I001", "Invalid stepper");
    m.insert("I002", "Invalid stepper state");
    m.insert("I003", "Invalid limit switch conversion");
    m
});

// Optional helper function to get error messages by code
pub fn get_error_message(code: &str) -> Option<&'static str> {
    ERROR_CODES.get(code).copied()
}

//TODO: register actual reductions
// Joint Reduction Ratios (as a HashMap where key = Joint ID, value = reduction ratio as a float)
pub static JOINT_REDUCTIONS: Lazy<HashMap<u8, f32>> = Lazy::new(|| {
    let mut m = HashMap::new();
    m.insert(1, 1.0 / 20.0); // J1 -> 1:20
    m.insert(2, 12.0 / 35.0); // J2 -> 12:35
    m.insert(3, 1.0 / 15.0); // Example for J3
    m.insert(4, 10.0 / 30.0); // Example for J4
    m.insert(5, 1.0 / 25.0); // Example for J5
    m.insert(6, 14.0 / 40.0); // Example for J6
    m
});

pub fn get_reduction_ratio(joint_id: u8) -> Option<f32> {
    JOINT_REDUCTIONS.get(&joint_id).copied()
}

//TODO: register actual angles
// Maximum angle data: A separate HashMap for storing max angle per joint
pub static MAX_ANGLES: Lazy<HashMap<u8, f32>> = Lazy::new(|| {
    let mut m = HashMap::new();
    m.insert(1, 180.0); // J1 max angle 180°
    m.insert(2, 150.0); // J2 max angle 150°
    m.insert(3, 270.0); // J3 max angle 270°
    m.insert(4, 160.0); // J4 max angle 160°
    m.insert(5, 360.0); // J5 max angle 360°
    m.insert(6, 120.0); // J6 max angle 120°
    m
});

pub fn get_max_angle(joint_id: u8) -> Option<f32> {
    MAX_ANGLES.get(&joint_id).copied()
}