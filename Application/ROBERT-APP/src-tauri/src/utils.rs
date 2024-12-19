use tokio::io::{AsyncReadExt, AsyncWriteExt};
use tokio_serial::{DataBits, Parity, SerialPortBuilderExt, StopBits};
use tokio::time::{timeout, Duration};
use crate::constants;

pub async fn send_and_receive_from_selected_port(data: &str, port_name: &str) -> Result<String, String> {
    let baud_rate = 115200;
    let timeout_duration = Duration::from_secs(3); // Adjust timeout if necessary

    // Open the serial port
    let mut port = tokio_serial::new(port_name, baud_rate)
        .timeout(timeout_duration)
        .data_bits(DataBits::Eight)
        .parity(Parity::None)
        .stop_bits(StopBits::One)
        .open_native_async()
        .map_err(|e| format!("Failed to open serial port: {}", e))?;

    // Concatenate '~' to the data
    let data_to_send = format!("{}~", data);

    println!("###DEBUG### - Sending data: {}", data_to_send);

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

                    // Check if we have received a complete response, such as ending with a newline
                    if response.ends_with(b"\n") || response.ends_with(b"~"){
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
    
            // Check if the response starts with an error code
            if let Some(error_message) = constants::ERROR_CODES.iter().find_map(|(code, message)| {
                if response_string.starts_with(code) {
                    Some(*message)
                } else {
                    None
                }
            }) {
                println!("###DEBUG### - Error response from device: {}", error_message);
                // If it's an error, return an Err with the corresponding error message
                Err(format!("Response from device: {}", error_message))
            } else {
                // Otherwise, return the response as a success
                Ok(response_string)
            }
        }
        Ok(Err(e)) => Err(e),
        Err(_) => Err("Timeout while waiting for response".to_string()),
    }
}