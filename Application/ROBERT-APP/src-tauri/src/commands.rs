use crate::constants;
use crate::state::SharedAppState;
use crate::utils::command_utils::send_and_receive_from_shared_state;
use crate::utils::{connection_utils, parameter_utils, stepper_utils};
use tauri::{AppHandle, State};
use tokio::time::Duration;

#[tauri::command]
pub async fn connect_to_port<'a>(port: String, state: State<'a, SharedAppState>) -> Result<String, String> {
    connection_utils::connect_to_port(port, state).await
}

#[tauri::command]
pub fn get_ports() -> Vec<String> {
    connection_utils::get_ports_list()
}

#[tauri::command]
pub async fn disconnect_from_active_connection<'a>(state: State<'a, SharedAppState>) -> Result<String, String> {
    connection_utils::disconnect(state.inner()).await
}

#[tauri::command]
pub async fn set_acceleration<'a>(acceleration: i8, state: State<'a, SharedAppState>) -> Result<String, String> {
    parameter_utils::set_acceleration(acceleration, state).await
}

#[tauri::command]
pub async fn set_velocity<'a>(velocity: i8, state: State<'a, SharedAppState>) -> Result<String, String> {
    parameter_utils::set_velocity(velocity, state).await
}

#[tauri::command]
pub async fn get_parameters<'a>(state: State<'a, SharedAppState>) -> Result<[u8; 2], String> {
    parameter_utils::get_parameters(state.inner().clone()).await
}

#[tauri::command]
pub async fn move_step<'a>(app: AppHandle, joint_index: i8, mut n_steps: i16, state: State<'a, SharedAppState>) -> Result<String, String> {
    if joint_index <= 0 || joint_index as usize >= constants::STEPPER_POSITIVE_TO_LIMIT.len() {
        return Err("Invalid joint index".to_string());
    }

    // Convert `joint_index` to `usize` for array indexing
    let joint_index_usize = joint_index as u8;

    if constants::STEPPER_POSITIVE_TO_LIMIT[&joint_index_usize] {
        n_steps = -n_steps;
    }

    let move_step_command = format!("{}J{}_{};", constants::CommandCodes::MOVE, joint_index, n_steps);

    // Send movement command
    let response = send_and_receive_from_shared_state(&move_step_command, state.inner().clone(), None).await;

    // If the command is successful, get updated stepper angles
    match response {
        Ok(resp) => {
            // Call `get_steppers_angles` to retrieve updated angles
            if let Err(e) = stepper_utils::get_steppers_angles(&app, state.inner().clone()).await {
                return Err(format!("Error retrieving stepper angles: {}", e));
            }

            Ok(format!("Successfully sent move_step command. Response: {}", resp))
        }
        Err(e) => Err(format!("Error: {}", e)),
    }
}

#[tauri::command]
pub async fn toggle_stepper<'a>(joint_index: i8, enabled: &str, state: State<'a, SharedAppState>) -> Result<String, String> {
    stepper_utils::toggle_stepper(joint_index, enabled, state).await
}

#[tauri::command]
pub async fn calibrate_steppers<'a>(joints_indexes: Vec<i8>, state: State<'a, SharedAppState>) -> Result<String, String> {
    let joint_commands: Vec<String> = joints_indexes.iter().map(|&index| format!("J{};", index)).collect();

    // Join all joint commands with no separator, and prepend the CALIBRATE> part
    let calibrate_command = format!("{}{}", constants::CommandCodes::CALIBRATE, joint_commands.join(""));

    // Send the command using the shared connection with a high timeout duration
    match send_and_receive_from_shared_state(&calibrate_command, state.inner().clone(), Some(Duration::from_secs(35))).await {
        Ok(response) => {
            // Now that we have the response, trim it properly
            let trimmed_response = response
                .trim_start_matches(constants::ResponseCodes::CALIBRATION_RESPONSE)
                .trim_end_matches('~')
                .trim()
                .to_string();

            Ok(trimmed_response) //Return just the response to act in the front
        }
        Err(e) => Err(format!("Error: {}", e)),
    }
}

//Command assumes all joint angles are provided as positive numbers
#[tauri::command]
pub async fn drive_steppers_to_angles<'a>(app: AppHandle, joints_angles: Vec<(i8, f32)>, state: State<'a, SharedAppState>) -> Result<String, String> {
    // Adjust angles based on the joint's positive limit switch
    let adjusted_angles: Vec<(i8, f32)> = joints_angles
        .into_iter()
        .map(|(joint_index, angle)| {
            let joint_index_u8 = joint_index as u8; // Convert to u8 for HashMap lookup

            if constants::STEPPER_POSITIVE_TO_LIMIT.get(&joint_index_u8).copied().unwrap_or(false) {
                (joint_index, -angle) // Negate if true
            } else {
                (joint_index, angle) // Keep as is
            }
        })
        .collect();

    stepper_utils::drive_steppers_to_angles(&app, adjusted_angles, state.inner().clone()).await
}

#[tauri::command]
pub async fn check_steppers_state<'a>(state: State<'a, SharedAppState>) -> Result<[bool; 6], String> {
    return stepper_utils::get_steppers_state(state.inner().clone()).await;
}

#[tauri::command]
pub async fn get_steppers_angles<'a>(app: AppHandle, state: State<'a, SharedAppState>) -> Result<[Option<f32>; 6], String> {
    return stepper_utils::get_steppers_angles(&app, state.inner().clone()).await;
}
