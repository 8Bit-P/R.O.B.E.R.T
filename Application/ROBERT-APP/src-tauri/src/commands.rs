use crate::constants;
use crate::state::SharedAppState;
use crate::utils::{self, send_and_receive_from_shared_state};
use serialport::available_ports;
use tauri::State;
use tokio::time::Duration;
use tauri::{AppHandle, Emitter};

#[tauri::command]
pub async fn connect_to_port<'a>(
    port: String,
    state: State<'a, SharedAppState>,
) -> Result<String, String> {
   utils::connect_to_port(port, state).await
}

#[tauri::command]
pub async fn disconnect_from_active_connection<'a>(
    state: State<'a, SharedAppState>, 
) -> Result<String, String> {
    // Lock the shared app state
    let mut app_state = state.write().await;

    if app_state.serial_connection.is_some() {
        println!("###DEBUG### - Disconnecting from serial port.");

        // Explicitly drop the connection
        app_state.serial_connection = None;
        
        // Give the OS time to release the port
        tokio::time::sleep(Duration::from_millis(200)).await;
        
        println!("###DEBUG### - Serial port disconnected.");
        Ok("Successfully disconnected from the port.".to_string())
    } else {
        Err("No active serial connection.".to_string())
    }
}


#[tauri::command]
pub async fn set_acceleration<'a>(
    acceleration: i8,
    state: State<'a, SharedAppState>,
) -> Result<String, String> {
    // Convert to i16 to prevent overflow
    let scaled_acceleration = (acceleration as i16) * constants::PARAMETERS_MULTIPLIER as i16
    ;

    let set_acc_command = format!("{}{}", constants::CommandCodes::SETACC, scaled_acceleration);

    match send_and_receive_from_shared_state(&set_acc_command, state.inner().clone(), None).await {
        Ok(response) => Ok(format!(
            "Successfully sent set_acc command. Response: {}",
            response
        )),
        Err(e) => Err(format!("Error: {}", e)),
    }
}

#[tauri::command]
pub async fn set_velocity<'a>(
    velocity: i8,
    state: State<'a, SharedAppState>,
) -> Result<String, String> {
    // Convert to i16 to prevent overflow
    let scaled_velocity = (velocity as i16) * constants::PARAMETERS_MULTIPLIER as i16;

    let set_vel_command = format!("{}{}", constants::CommandCodes::SETVEL, scaled_velocity);

    match send_and_receive_from_shared_state(&set_vel_command, state.inner().clone(), None).await {
        Ok(response) => Ok(format!(
            "Successfully sent set_vel command. Response: {}",
            response
        )),
        Err(e) => Err(format!("Error: {}", e)),
    }
}

#[tauri::command]
pub async fn move_step<'a>(
    joint_index: i8, 
    mut n_steps: i16, 
    state: State<'a, SharedAppState>,
) -> Result<String, String> {
    if joint_index <= 0 || joint_index as usize >= constants::STEPPER_POSITIVE_TO_LIMIT.len() {
        return Err("Invalid joint index".to_string());
    }

    // Convert `joint_index` to `usize` for array indexing
    let joint_index_usize = joint_index as u8;

    if constants::STEPPER_POSITIVE_TO_LIMIT[&joint_index_usize] {
        n_steps = -n_steps;
    }

    let move_step_command = format!(
        "{}J{}_{};",
        constants::CommandCodes::MOVE,
        joint_index,
        n_steps
    );

    match send_and_receive_from_shared_state(&move_step_command, state.inner().clone(), None).await {
        Ok(response) => Ok(format!(
            "Successfully sent move_step command. Response: {}",
            response
        )),
        Err(e) => Err(format!("Error: {}", e)),
    }
}



#[tauri::command]
pub async fn toggle_stepper<'a>(
    joint_index: i8,
    enabled: &str,
    state: State<'a, SharedAppState>,
) -> Result<String, String> {

    // Arduino command format: TOGGLE>JOINT_STATE;
    let toggle_command = format!(
        "{}J{}_{};",
        constants::CommandCodes::TOGGLE,
        joint_index,
        enabled
    );

    // Send the command using the shared connection
    match send_and_receive_from_shared_state(&toggle_command, state.inner().clone(), None).await {
        Ok(response) => Ok(format!(
            "Successfully sent toggle_step command. Response: {}",
            response
        )),
        Err(e) => Err(format!("Error: {}", e)),
    }
}

#[tauri::command]
pub async fn calibrate_steppers<'a>(
    joints_indexes: Vec<i8>,
    state: State<'a, SharedAppState>,
) -> Result<String, String> {
    let joint_commands: Vec<String> = joints_indexes
        .iter()
        .map(|&index| format!("J{};", index))
        .collect();

    // Join all joint commands with no separator, and prepend the CALIBRATE> part
    let calibrate_command = format!(
        "{}{}",
        constants::CommandCodes::CALIBRATE,
        joint_commands.join("")
    );

    // Send the command using the shared connection
    match send_and_receive_from_shared_state(&calibrate_command, state.inner().clone(), Some(Duration::from_secs(35))).await {
        Ok(response) => Ok(format!(
            "Successfully sent calibrate command. Response: {}",
            response
        )),
        Err(e) => Err(format!("Error: {}", e)),
    }
}

#[tauri::command]
pub async fn drive_steppers_to_angles<'a>(
    joints_angles: Vec<(i8, f32)>, 
    state: State<'a, SharedAppState>,
) -> Result<String, String> {

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

    utils::drive_steppers_to_angles(adjusted_angles, state.inner().clone()).await
}

#[tauri::command]
pub async fn get_parameters<'a>(
    state: State<'a, SharedAppState>,
) -> Result<[u8; 2], String> {
    // Send the command using the shared connection
    match send_and_receive_from_shared_state(constants::CommandCodes::PARAMS, state.inner().clone(), None).await {
        Ok(response) => {
            // Expected response format: "[PARAMS];VEL_20;ACC_40;"
            if response.starts_with(constants::ResponseCodes::PARAMS_RESPONSE) {
                let parts: Vec<&str> = response.split(';').collect();
                let mut vel: u8 = 0;
                let mut acc: u8 = 0;
                
                for part in parts {
                    if part.starts_with("VEL_") {
                        vel = (part[4..].parse::<f32>().unwrap_or(0.0) / constants::PARAMETERS_MULTIPLIER as f32) as u8;
                    } else if part.starts_with("ACC_") {
                        acc = (part[4..].parse::<f32>().unwrap_or(0.0) / constants::PARAMETERS_MULTIPLIER as f32) as u8;
                    }
                }

                Ok([vel, acc])
            } else {
                Err("Invalid response format".to_string())
            }
        }
        Err(e) => Err(format!("Error: {}", e)),
    }
}




#[tauri::command]
pub async fn check_steppers_state<'a>(
    state: State<'a, SharedAppState>,
) -> Result<[bool; 6], String> {
    return utils::get_steppers_state(state.inner().clone()).await;
}

#[tauri::command]
pub async fn get_steppers_angles<'a>(
    state: State<'a, SharedAppState>,
) -> Result<[Option<f32>; 6], String> {
    return utils::get_steppers_angles(state.inner().clone()).await;
}

#[tauri::command]
pub fn get_ports() -> Vec<String> {
    let mut ports_list = Vec::new();

    // Attempt to get the list of available serial ports
    if let Ok(ports) = available_ports() {
        for port in ports {
            // Add all detected port names, regardless of type
            ports_list.push(port.port_name);
        }
    } else {
        println!("Failed to list ports.");
    }

    ports_list
}
