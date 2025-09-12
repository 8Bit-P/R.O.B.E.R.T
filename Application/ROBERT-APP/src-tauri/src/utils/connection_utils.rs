use crate::state::SharedAppState;
use crate::utils::command_utils::send_and_receive_from_shared_state;
use serialport::available_ports;
use std::sync::Arc;
use tauri::State;
use tokio::sync::Mutex;
use tokio::time::{sleep, Duration};
use tokio_serial::{DataBits, Parity, SerialPortBuilderExt, StopBits};

pub async fn connect_to_port<'a>(port: String, state: State<'a, SharedAppState>) -> Result<String, String> {
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

        println!("###DEBUG### - Attempt {}/{}: Connecting to port: {}", attempt, max_retries, port);

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

                match send_and_receive_from_shared_state(crate::constants::CommandCodes::CHECK, state.inner().clone(), None).await {
                    Ok(response) => {
                        if response.trim() == crate::constants::ResponseCodes::CONNECTED_RESPONSE {
                            return Ok(format!("Successfully connected to port: {}.", port));
                        } else {
                            println!("###DEBUG### - Attempt {}/{}: Unexpected response: {}", attempt, max_retries, response);
                        }
                    }
                    Err(e) => {
                        println!("###DEBUG### - Attempt {}/{}: Failed to verify connection: {}", attempt, max_retries, e);
                    }
                }
            }
            Err(e) => {
                println!("###DEBUG### - Attempt {}/{}: Failed to open serial port: {}", attempt, max_retries, e);
            }
        }

        // Wait before retrying
        tokio::time::sleep(Duration::from_millis(500)).await;
    }

    Err(format!("Failed to connect to port: {} after {} attempts.", port, max_retries))
}

/// Get a list of available serial port names.
pub fn get_ports_list() -> Vec<String> {
    let mut ports_list = Vec::new();

    if let Ok(ports) = available_ports() {
        for port in ports {
            ports_list.push(port.port_name);
        }
    } else {
        println!("Failed to list ports.");
    }

    ports_list
}


/// Disconnects from the currently active serial connection, if any.
pub async fn disconnect(state: &SharedAppState) -> Result<String, String> {
    let mut app_state = state.write().await;

    if app_state.serial_connection.is_some() {
        println!("###DEBUG### - Disconnecting from serial port.");

        // Drop the connection
        app_state.serial_connection = None;

        // Allow OS to release the port
        sleep(Duration::from_millis(200)).await;

        println!("###DEBUG### - Serial port disconnected.");
        Ok("Successfully disconnected from the port.".to_string())
    } else {
        Err("No active serial connection.".to_string())
    }
}