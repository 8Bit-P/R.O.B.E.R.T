use crate::constants;
use crate::state::SharedAppState;
use crate::utils::command_utils::{self, send_and_receive_from_shared_state};


pub async fn set_acceleration<'a>(acceleration: i8, state: SharedAppState) -> Result<String, String> {
    let scaled_acceleration = (acceleration as i16) * constants::PARAMETERS_MULTIPLIER as i16;
    let set_acc_command = format!("{}{}", constants::CommandCodes::SETACC, scaled_acceleration);

    command_utils::send_command(&set_acc_command, state, None, "Successfully sent set_acc command").await
}

pub async fn set_velocity<'a>(velocity: i8, state: SharedAppState) -> Result<String, String> {
    let scaled_velocity = (velocity as i16) * constants::PARAMETERS_MULTIPLIER as i16;
    let set_vel_command = format!("{}{}", constants::CommandCodes::SETVEL, scaled_velocity);

    command_utils::send_command(&set_vel_command, state, None, "Successfully sent set_vel command").await
}

/// Retrieve stepper parameters (velocity and acceleration) from the device.
pub async fn get_parameters(state: SharedAppState) -> Result<[u8; 2], String> {
    let response = send_and_receive_from_shared_state(constants::CommandCodes::PARAMS, state, None).await?;

    if !response.starts_with(constants::ResponseCodes::PARAMS_RESPONSE) {
        return Err("Invalid response format".to_string());
    }

    let mut vel: u8 = 0;
    let mut acc: u8 = 0;

    for part in response.split(';') {
        if let Some(stripped) = part.strip_prefix("VEL_") {
            vel = (stripped.parse::<f32>().unwrap_or(0.0) / constants::PARAMETERS_MULTIPLIER as f32) as u8;
        } else if let Some(stripped) = part.strip_prefix("ACC_") {
            acc = (stripped.parse::<f32>().unwrap_or(0.0) / constants::PARAMETERS_MULTIPLIER as f32) as u8;
        }
    }

    Ok([vel, acc])
}
