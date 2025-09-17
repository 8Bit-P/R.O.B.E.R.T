use once_cell::sync::Lazy;
use std::{collections::HashMap, f32::consts::PI};

use crate::structs::{angles::AngleLimits, dh_parameters::DHParameters};

// Command Codes
pub struct CommandCodes;

impl CommandCodes {
    pub const MOVE: &'static str = "MOVE>";
    pub const CHECK: &'static str = "CHECK>";
    pub const SETVEL: &'static str = "SETVEL>";
    pub const SETACC: &'static str = "SETACC>";
    pub const TOGGLE: &'static str = "TOGGLE>";
    pub const CALIBRATE: &'static str = "CALIBRATE>";
    pub const STATE: &'static str = "STATE>";
    pub const STEPS: &'static str = "STEPS>";
    pub const PARAMS: &'static str = "PARAMS>";
}

// Response Codes
pub struct ResponseCodes;

impl ResponseCodes {
    pub const CONNECTED_RESPONSE: &'static str = "CONNECTED";
    pub const CALIBRATION_RESPONSE: &'static str = "[CALIBRATION];";
    pub const STATE_RESPONSE: &'static str = "[STATE];";
    pub const STEPS_RESPONSE: &'static str = "[STEPS];";
    pub const PARAMS_RESPONSE: &'static str = "[PARAMS];";
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

// Joint Reduction Ratios (as a HashMap where key = Joint ID, value = reduction ratio as a float)
pub static JOINT_REDUCTIONS: Lazy<HashMap<u8, f32>> = Lazy::new(|| {
    let mut m = HashMap::new();
    m.insert(1, 100.0 / 16.0);
    m.insert(2, 80.0 / 16.0);
    m.insert(3, 100.0 / 16.0);
    m.insert(4, 60.0 / 16.0);
    m.insert(5, 32.0 / 16.0);
    m.insert(6, 1.0 / 1.0); //No reduction on gripper rotatation
    m
});

pub fn get_reduction_ratio(joint_id: u8) -> Option<f32> {
    JOINT_REDUCTIONS.get(&joint_id).copied()
}

// Joint angle limits: min and max per joint
pub static ANGLE_LIMITS: Lazy<HashMap<u8, AngleLimits>> = Lazy::new(|| {
    let mut m = HashMap::new();
    m.insert(1, AngleLimits { min: 0.0, max: 270.0 });
    m.insert(2, AngleLimits { min: -15.0, max: 75.0 });
    m.insert(3, AngleLimits { min: -70.0, max: 50.0 });
    m.insert(4, AngleLimits { min: 0.0, max: 270.0 });
    m.insert(5, AngleLimits { min: 0.0, max: 45.0 });
    // J6 has no limits, so it's not added
    m
});

pub fn get_max_angles(joint_id: u8) -> Option<AngleLimits> {
    ANGLE_LIMITS.get(&joint_id).copied()
}

pub static DEGREES_PER_STEP: Lazy<HashMap<u8, f32>> = Lazy::new(|| {
    let mut m = HashMap::new();
    m.insert(1, 1.8);
    m.insert(2, 0.35);
    m.insert(3, 1.8);
    m.insert(4, 1.8);
    m.insert(5, 0.9);
    m.insert(6, 1.8);
    m
});

pub fn get_degrees_per_step(joint_id: u8) -> Option<f32> {
    DEGREES_PER_STEP.get(&joint_id).copied()
}

lazy_static::lazy_static! {
    pub static ref STEPPER_POSITIVE_TO_LIMIT: HashMap<u8, bool> = {
        let mut map = HashMap::new();
        map.insert(1, false); //E.g this means stepper 1 when given positive steps it drives away from the limit switch
        map.insert(2, false);
        map.insert(3, true);
        map.insert(4, true);
        map.insert(5, false); // TODO: Set when joints build
        map.insert(6, false);
        map
    };
}

//Velocity and acceleration "sensitivity"
pub const PARAMETERS_MULTIPLIER: u8 = 10;

// DH Parameters for the 6-DOF robotic arm
pub static DH_TABLE: Lazy<[DHParameters; 6]> = Lazy::new(|| {
    [
        DHParameters { theta: 0.0, d: 43.66, a: 37.866, alpha: 90.0 * (PI / 180.0) }, // Joint 1
        DHParameters { theta: -90.0 * (PI / 180.0), d: 0.0, a: 16.0848, alpha: 180.0 * (PI / 180.0) }, // Joint 2
        DHParameters { theta: 180.0 * (PI / 180.0), d: 0.0, a: 0.0, alpha: -90.0 * (PI / 180.0) }, // Joint 3
        DHParameters { theta: 0.0, d: 14.0, a: 35.151, alpha: 90.0 * (PI / 180.0) },  // Joint 4
        DHParameters { theta: 0.0, d: 0.0, a: 0.0, alpha: -90.0 * (PI / 180.0) },     // Joint 5
        DHParameters {
            theta: 0.0,
            d: 0.0, /* TODO: we still need to know the gripper length */
            a: 0.0,
            alpha: 180.0 * (PI / 180.0),
        }, // Joint 6
    ]
});
