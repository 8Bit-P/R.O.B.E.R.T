use crate::state::SharedAppState;
use tokio::{ time::{timeout, Duration}, io::{AsyncWriteExt,AsyncReadExt}};

pub async fn send_and_receive_from_shared_state(
    data: &str,
    state: SharedAppState,
) -> Result<String, String> {
    let timeout_duration = Duration::from_secs(3); // Adjust timeout if necessary

    // Acquire the lock on the shared state
    let app_state = state.write().await;

    // Check if a serial connection exists
    let connection = match app_state.serial_connection.as_ref() {
        Some(conn) => conn.clone(),
        None => return Err("No serial connection available".to_string()),
    };

    // Concatenate '~' to the data
    let data_to_send = format!("{}~", data);

    println!("###DEBUG### - Sending data: {}", data_to_send);

    // Correctly handle the lock on the serial connection
    let mut port = connection.lock().await;
    
    // Write the data to the port
    port.write_all(data_to_send.as_bytes())
        .await
        .map_err(|e| format!("Failed to write to serial port: {}", e))?;
    port.flush()
        .await
        .map_err(|e| format!("Failed to flush serial port: {}", e))?;

    println!("###DEBUG### - Waiting for response...");

    let mut response = Vec::new();
    let mut buffer = [0; 1024]; // Buffer to read data in chunks

    let read_result = timeout(timeout_duration, async {
        loop {
            match port.read(&mut buffer).await {
                Ok(bytes_read) => {
                    response.extend_from_slice(&buffer[..bytes_read]);
                    println!("###DEBUG### - Read {} bytes", bytes_read);

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
            println!("###DEBUG### - Response obtained: {}", response_string);
            Ok(response_string)
        }
        Ok(Err(e)) => Err(e),
        Err(_) => Err("Timeout while waiting for response".to_string()),
    }
}
