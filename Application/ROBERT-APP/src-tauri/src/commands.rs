use serialport::available_ports;
use tokio_serial::{DataBits, Parity, SerialPortBuilderExt, StopBits};
use tokio::time::Duration;
use tokio::sync::Mutex;
use std::sync::Arc;
use tauri::State;
use crate::state::SharedAppState;
use crate::utils::send_and_receive_from_shared_state;
use crate::constants::{self, get_degrees_per_step, get_reduction_ratio};

#[tauri::command]
pub async fn connect_to_port<'a>(
    port: String, 
    state: State<'a, SharedAppState>, // State from Tauri
) -> Result<String, String> {
    let baud_rate = 115200;
    let timeout_duration = Duration::from_secs(3);

    let port_cloned = port.clone(); // Clone the port to use it later

    println!("###DEBUG### - Connecting to port: {}", port_cloned);

    // Create and configure the serial connection
    let serial_connection = tokio_serial::new(port, baud_rate)
        .timeout(timeout_duration)
        .data_bits(DataBits::Eight)
        .parity(Parity::None)
        .stop_bits(StopBits::One)
        .open_native_async()
        .map_err(|e| format!("Failed to open serial port: {}", e))?;

    // Wrap the connection in a Mutex and Arc (tokio::sync::Mutex now)
    let shared_connection = Arc::new(Mutex::new(serial_connection));

    // Store the connection in the shared state
    {
        let mut app_state = state.write().await;
        app_state.set_connection(shared_connection.clone());
    }

    // Extract the shared state (Arc<RwLock<AppState>>) and call the function
    match send_and_receive_from_shared_state(crate::constants::CommandCodes::CHECK, state.inner().clone()).await {
        Ok(response) => {
            
            if response.trim() == crate::constants::ResponseCodes::CONNECTED_RESPONSE {
                Ok(format!("Successfully connected to port: {}.", port_cloned))
            } else {
                Err(format!(
                    "Failed to connect to port: {}. Unexpected response: {}",
                    port_cloned, response
                ))
            }
        }
        Err(e) => Err(format!("Failed to verify connection: {}", e)),
    }
}


#[tauri::command]
pub async fn disconnect_from_active_connection<'a>(
    state: State<'a, SharedAppState>, // State from Tauri
) -> Result<String, String> {
    // Lock the shared app state
    let mut app_state = state.write().await;

    // Clear the connection using the clear_connection method
    app_state.clear_connection();

    Ok("Successfully disconnected from the port.".to_string())
}



#[tauri::command]
pub async fn set_acceleration<'a>(
    acceleration: i8,
    state: State<'a, SharedAppState>,
) -> Result<String, String> {
    // Convert to i16 to prevent overflow
    let scaled_acceleration = (acceleration as i16) * 10;

    let set_acc_command = format!(
        "{}{}",
        constants::CommandCodes::SETACC,
        scaled_acceleration
    );

    match send_and_receive_from_shared_state(&set_acc_command, state.inner().clone()).await {
        Ok(response) => Ok(format!("Successfully sent set_acc command. Response: {}", response)),
        Err(e) => Err(format!("Error: {}", e)),
    }
}

#[tauri::command]
pub async fn set_velocity<'a>(
    velocity: i8,
    state: State<'a, SharedAppState>,
) -> Result<String, String> {
    // Convert to i16 to prevent overflow
    let scaled_velocity = (velocity as i16) * 10;

    let set_vel_command = format!(
        "{}{}",
        constants::CommandCodes::SETVEL,
        scaled_velocity
    );

    match send_and_receive_from_shared_state(&set_vel_command, state.inner().clone()).await {
        Ok(response) => Ok(format!("Successfully sent set_vel command. Response: {}", response)),
        Err(e) => Err(format!("Error: {}", e)),
    }
}


#[tauri::command]
pub async fn move_step<'a>(
    joint_index: i8,
    n_steps: i16,
    state: State<'a, SharedAppState>,  // Use shared state for connection
) -> Result<String, String> {

    // Arduino command format: MOVE>JOINT_NSTEPS;
    let move_step_command = format!(
        "{}J{}_{};",
        constants::CommandCodes::MOVE,
        joint_index,
        n_steps
    );

    // Send the command using the shared connection
    match send_and_receive_from_shared_state(&move_step_command, state.inner().clone()).await {
        Ok(response) => Ok(format!("Successfully sent move_step command. Response: {}", response)),
        Err(e) => Err(format!("Error: {}", e)),
    }
}


#[tauri::command]
pub async fn toggle_stepper<'a>(
    joint_index: i8,
    enabled: &str,
    state: State<'a, SharedAppState>,  // Use shared state for connection
) -> Result<String, String> {
    // Arduino command format: TOGGLE>JOINT_STATE;
    let toggle_command = format!(
        "{}J{}_{};",
        constants::CommandCodes::TOGGLE,
        joint_index,
        enabled
    );

    // Send the command using the shared connection
    match send_and_receive_from_shared_state(&toggle_command, state.inner().clone()).await {
        Ok(response) => Ok(format!("Successfully sent toggle_step command. Response: {}", response)),
        Err(e) => Err(format!("Error: {}", e)),
    }
}

#[tauri::command]
pub async fn calibrate_steppers<'a>(
    joints_indexes: Vec<i8>,
    state: State<'a, SharedAppState>,  // Use shared state for connection
) -> Result<String, String> {
    // Create a string for each joint in the joints_indexes array, formatted as J{index};
    let joint_commands: Vec<String> = joints_indexes
        .iter()
        .map(|&index| format!("J{};", index))
        .collect();
    
    // Join all joint commands with no separator, and prepend the CALIBRATE> part
    let calibrate_command = format!("{}{}", constants::CommandCodes::CALIBRATE, joint_commands.join(""));

    // Send the command using the shared connection
    match send_and_receive_from_shared_state(&calibrate_command, state.inner().clone()).await {
        Ok(response) => Ok(format!("Successfully sent calibrate command. Response: {}", response)),
        Err(e) => Err(format!("Error: {}", e)),
    }
}

#[tauri::command]
pub async fn drive_steppers_to_angles<'a>(
    joints_angles: Vec<(i8, f32)>,
    state: State<'a, SharedAppState>,
) -> Result<String, String> {
    let mut move_command = String::from(constants::CommandCodes::MOVE);
    
    for (joint_id, target_angle) in joints_angles {
        if let (Some(reduction_ratio), Some(degrees_per_step)) = (get_reduction_ratio(joint_id as u8), get_degrees_per_step(joint_id as u8)) {
            // Calculate steps using the formula
            let steps = (target_angle * (1.0 / degrees_per_step) * reduction_ratio).round() as i32;
            move_command.push_str(&format!("J{}_{};", joint_id, steps));
        } else {
            return Err(format!("Invalid joint ID: {}", joint_id));
        }
    }

    println!("{}", move_command);

    //TODO: 
    // 1. Get current angle of the motors (or number of steps from home position most likely)
    // 1.0 Implement getPosition command in arduino
    // 1.1 Convert steps into angles for each motor
    // 2. Get difference between desired angle and current angle for each motor that provided in joints_angles
    // 3. Compute amount of steps for each motor to reach desired angle knowing its reductions
    
    //Send the command using the shared connection
    match send_and_receive_from_shared_state(&move_command, state.inner().clone()).await {
        Ok(response) => Ok(format!("Successfully sent move command. Response: {}", response)),
        Err(e) => Err(format!("Error: {}", e)),
    }
}

//TODO: CHECK AND IMPLEMENT CORRECTLY
#[tauri::command]
pub async fn check_steppers<'a>(
    state: State<'a, SharedAppState>
) -> Result<String, String> {
    // Send the command using the shared connection
    match send_and_receive_from_shared_state(constants::CommandCodes::STATE, state.inner().clone()).await {
        Ok(response) => {
            // Parse the response and convert steps to angles
            let response_parts: Vec<&str> = response.split(';').collect();
            let mut result = String::from("[STATE];");

            for part in response_parts {
                // Example response: J1_ENABLED, J2_ENABLED, J1_UNKNOWN, etc.
                if part.starts_with("J") {
                    let parts: Vec<&str> = part.split('_').collect();
                    if parts.len() == 2 {
                        let joint_id = parts[0].trim_start_matches('J').parse::<u8>().unwrap();
                        let status = parts[1];

                        // Check if the status is a stepper, for example: "J1_ENABLED"
                        if status == "ENABLED" {
                            // Get the current number of steps (from home or initial position)
                            if let Some(degrees_per_step) = get_degrees_per_step(joint_id) {
                                // Calculate the current angle from the stepper's step count
                                let steps = get_steps_for_joint(joint_id); // Placeholder function to get the current steps
                                let angle = (steps as f32) * degrees_per_step;
                                
                                result.push_str(&format!("J{}_{};", joint_id, angle));
                            } else {
                                result.push_str(&format!("J{}_UNKNOWN;", joint_id));
                            }
                        } else {
                            result.push_str(&format!("J{}_UNKNOWN;", joint_id));
                        }
                    }
                }
            }

            Ok(result)
        },
        Err(e) => Err(format!("Error: {}", e)),
    }
}

// Placeholder function to get current steps for each joint (you will need to implement this based on your system)
fn get_steps_for_joint(joint_id: u8) -> i32 {
    // This would interact with your system to get the current step count.
    // For now, returning a dummy value (e.g., 100 steps).
    100
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