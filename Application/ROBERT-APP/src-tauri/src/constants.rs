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
    m
});

// Optional helper function to get error messages by code
pub fn get_error_message(code: &str) -> Option<&'static str> {
    ERROR_CODES.get(code).copied()
}
