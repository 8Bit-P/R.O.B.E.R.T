use tokio::{io::AsyncReadExt, time::{self, Duration}};
use tauri::Emitter;

use crate::state::SharedAppState; 

pub async fn read_serial_task(state: SharedAppState, app_handle: tauri::AppHandle) {
    loop {
        // Clone the notify instances inside the loop
        let (stop_notify, background_task_notify) = {
            let app_state = state.read().await;
            (
                app_state.stop_notify.clone(),
                app_state.background_task_notify.clone(),
            )
        };

        // Wait for the signal to stop or read if the connection is idle
        let timeout = time::timeout(Duration::from_secs(1), background_task_notify.notified());

        match timeout.await {
            Ok(_) => {
                // Background task continues reading when notified
                let app_state = state.write().await;

                if let Some(ref connection) = app_state.serial_connection {
                    let mut port = connection.lock().await; // Lock the serial connection for reading

                    // Read from the serial connection and perform actions
                    let mut buffer = [0u8; 1024];
                    match port.read(&mut buffer).await {
                        Ok(bytes_read) if bytes_read > 0 => {
                            let data = String::from_utf8_lossy(&buffer[..bytes_read]);
                            println!("Background task - Data from serial port: {}", data);

                            // Emit data to frontend (Tauri)
                            if let Err(e) = app_handle.emit("serial_data", data.to_string()) {
                                eprintln!("Failed to emit serial data: {}", e);
                            }
                        }
                        Ok(_) => {} // No data read; continue
                        Err(e) => {
                            eprintln!("Error reading from serial port: {}", e);
                        }
                    }
                }
            }
            Err(_) => {
                // Timeout reached, continue to the next cycle
            }
        }
    }
}