use crate::state::SharedAppState;
use crate::constants;
use colored::*;
use tokio::{
    io::{AsyncReadExt, AsyncWriteExt},
    time::{timeout, Duration},
};

pub async fn send_and_receive_from_shared_state(
    data: &str,
    state: SharedAppState,
    opt_timeout: Option<Duration>, // Optional timeout
) -> Result<String, String> {
    let timeout_duration = opt_timeout.unwrap_or(Duration::from_secs(3)); // Default to 3 seconds if None

    // Acquire the lock on the shared state
    let app_state = state.write().await;

    // Check if a serial connection exists
    let connection = match app_state.serial_connection.as_ref() {
        Some(conn) => conn.clone(),
        None => return Err("No serial connection available".to_string()),
    };

    // Concatenate '~' to the data
    let data_to_send = format!("{}~", data);

    println!("{}", format!("###DEBUG### - Sending data: {}", data_to_send).blue());

    // Correctly handle the lock on the serial connection
    let mut port = connection.lock().await;

    // Write the data to the port
    port.write_all(data_to_send.as_bytes())
        .await
        .map_err(|e| format!("Failed to write to serial port: {}", e))?;
    port.flush().await.map_err(|e| format!("Failed to flush serial port: {}", e))?;

    println!("{} {}", "###DEBUG###".yellow().bold(), "Waiting for response...".blue());

    let mut response = Vec::new();
    let mut buffer = [0; 1024]; // Buffer to read data in chunks

    let read_result = timeout(timeout_duration, async {
        loop {
            match port.read(&mut buffer).await {
                Ok(bytes_read) => {
                    response.extend_from_slice(&buffer[..bytes_read]);

                    // Check if we have received a complete response
                    if response.ends_with(b"\n") || response.ends_with(b"~") {
                        break Ok(());
                    }
                }
                Err(e) => {
                    break Err(format!("Error reading from serial port: {}", e));
                }
            }
        }
    })
    .await;

    match read_result {
        Ok(Ok(())) => {
            let response_string = String::from_utf8_lossy(&response).to_string();
            println!("{} {}", "###DEBUG###".yellow().bold(), format!("Response obtained: {}", response_string).cyan());

            // Check for known error codes
            for (code, message) in constants::ERROR_CODES.iter() {
                if response_string.contains(code) {
                    return Err(format!("{} ({})", message, code));
                }
            }

            Ok(response_string)
        }
        Ok(Err(e)) => Err(e),
        Err(_) => Err("Timeout while waiting for response".to_string()),
    }
}

pub async fn send_command(command: &str, state: SharedAppState, timeout: Option<Duration>, success_msg: &str) -> Result<String, String> {
    match send_and_receive_from_shared_state(command, state, timeout).await {
        Ok(resp) => Ok(format!("{}: {}", success_msg, resp)),
        Err(e) => Err(format!("Error: {}", e)),
    }
}
