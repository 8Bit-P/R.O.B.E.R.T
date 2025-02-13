use crate::constants;
use crate::state::SharedAppState;
use crate::utils::{self, send_and_receive_from_shared_state};
use serialport::available_ports;
use std::sync::Arc;
use tauri::State;
use tokio::sync::Mutex;
use tokio::time::Duration;
use tokio_serial::{DataBits, Parity, SerialPortBuilderExt, StopBits};

#[tauri::command]
pub async fn connect_to_port<'a>(
    port: String,
    state: State<'a, SharedAppState>,
) -> Result<String, String> {
    let baud_rate = 115200;
    let timeout_duration = Duration::from_secs(3);
    let max_retries = 3;

    for attempt in 1..=max_retries {
        {
            // Lock the state and clear any existing connection before trying again
            let mut app_state = state.write().await;
            if app_state.serial_connection.is_some() {
                println!(
                    "###DEBUG### - Attempt {}/{}: Closing existing connection before reconnecting.",
                    attempt, max_retries
                );
                app_state.serial_connection = None;
            }
        }

        println!(
            "###DEBUG### - Attempt {}/{}: Connecting to port: {}",
            attempt, max_retries, port
        );

        match tokio_serial::new(port.clone(), baud_rate)
            .timeout(timeout_duration)
            .data_bits(DataBits::Eight)
            .parity(Parity::None)
            .stop_bits(StopBits::One)
            .open_native_async()
        {
            Ok(serial_connection) => {
                let shared_connection = Arc::new(Mutex::new(serial_connection));

                {
                    let mut app_state = state.write().await;
                    app_state.set_connection(shared_connection.clone());
                }

                match send_and_receive_from_shared_state(
                    crate::constants::CommandCodes::CHECK,
                    state.inner().clone(),
                )
                .await
                {
                    Ok(response) => {
                        if response.trim() == crate::constants::ResponseCodes::CONNECTED_RESPONSE {
                            return Ok(format!("Successfully connected to port: {}.", port));
                        } else {
                            println!(
                                "###DEBUG### - Attempt {}/{}: Unexpected response: {}",
                                attempt, max_retries, response
                            );
                        }
                    }
                    Err(e) => {
                        println!(
                            "###DEBUG### - Attempt {}/{}: Failed to verify connection: {}",
                            attempt, max_retries, e
                        );
                    }
                }
            }
            Err(e) => {
                println!(
                    "###DEBUG### - Attempt {}/{}: Failed to open serial port: {}",
                    attempt, max_retries, e
                );
            }
        }

        // Wait before retrying
        tokio::time::sleep(Duration::from_millis(500)).await;
    }

    Err(format!("Failed to connect to port: {} after {} attempts.", port, max_retries))
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
    let scaled_acceleration = (acceleration as i16) * 10;

    let set_acc_command = format!("{}{}", constants::CommandCodes::SETACC, scaled_acceleration);

    match send_and_receive_from_shared_state(&set_acc_command, state.inner().clone()).await {
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
    let scaled_velocity = (velocity as i16) * 10;

    let set_vel_command = format!("{}{}", constants::CommandCodes::SETVEL, scaled_velocity);

    match send_and_receive_from_shared_state(&set_vel_command, state.inner().clone()).await {
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
    n_steps: i16,
    state: State<'a, SharedAppState>,
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
    match send_and_receive_from_shared_state(&toggle_command, state.inner().clone()).await {
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
    match send_and_receive_from_shared_state(&calibrate_command, state.inner().clone()).await {
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
    utils::drive_steppers_to_angles(joints_angles, state.inner().clone()).await
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
