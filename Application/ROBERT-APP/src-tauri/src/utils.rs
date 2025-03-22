use crate::constants;
use crate::state::SharedAppState;
use std::sync::Arc;
use tauri::State;
use tauri::{AppHandle, Emitter};
use tokio::sync::Mutex;
use tokio::{
    io::{AsyncReadExt, AsyncWriteExt},
    time::{timeout, Duration},
};
use tokio_serial::{DataBits, Parity, SerialPortBuilderExt, StopBits};

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
                    None,
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

    Err(format!(
        "Failed to connect to port: {} after {} attempts.",
        port, max_retries
    ))
}

//Sends state command to arduino and returns an array of bools representing the state of the steppers
pub async fn get_steppers_state(state: SharedAppState) -> Result<[bool; 6], String> {
    let data = constants::CommandCodes::STATE;
    let response = send_and_receive_from_shared_state(data, state, None).await?;

    // Parse the response
    let state_str = response
        .trim_start_matches(constants::ResponseCodes::STATE_RESPONSE)
        .trim_end_matches("~");

    // Split the response into parts
    let parts: Vec<&str> = state_str.split(';').collect();

    let mut stepper_states = [false; 6];

    for part in parts.iter() {
        // Strip any trailing newline or extra spaces from each part
        let part = part.trim();

        if let Some(index) = part
            .strip_prefix("J")
            .and_then(|s| s.chars().next())
            .and_then(|c| c.to_digit(10))
        {
            let idx = (index as usize).saturating_sub(1);
            if idx < 6 {
                stepper_states[idx] = part.ends_with("ENABLED");
            }
        }
    }

    Ok(stepper_states)
}

//Sends state command to arduino and returns an array of steps representing the steps of the steppers
pub async fn get_steppers_steps(state: SharedAppState) -> Result<[Option<f32>; 6], String> {
    let data = constants::CommandCodes::STEPS;
    let response = send_and_receive_from_shared_state(data, state, Some(Duration::from_secs(8))).await?;

    // Parse the response
    let state_str = response
        .trim_start_matches(constants::ResponseCodes::STEPS_RESPONSE)
        .trim_end_matches("~");

    // Split the response into parts
    let parts: Vec<&str> = state_str.split(';').collect();

    let mut stepper_steps = [None; 6];

    for part in parts.iter() {
        // Strip any trailing newline or extra spaces from each part
        let part = part.trim();

        if let Some(index) = part
            .strip_prefix("J")
            .and_then(|s| s.chars().next())
            .and_then(|c| c.to_digit(10))
        {
            let idx = (index as usize).saturating_sub(1);
            if idx < 6 {
                if part.ends_with("UNKNOWN") {
                    stepper_steps[idx] = None;
                } else if let Some(steps) = part
                    .strip_prefix(&format!("J{}_", index))
                    .and_then(|s| s.parse::<f32>().ok())
                {
                    stepper_steps[idx] = Some(steps);
                }
            }
        }
    }

    Ok(stepper_steps)
}

pub async fn get_steppers_angles(
    app: &AppHandle,
    state: SharedAppState,
) -> Result<[Option<f32>; 6], String> {
    let steps = get_steppers_steps(state).await?;
    let mut angles = [None; 6];

    for (i, step) in steps.iter().enumerate() {
        if let Some(steps) = step {
            if let (Some(reduction_ratio), Some(degrees_per_step)) = (
                constants::get_reduction_ratio((i + 1) as u8),
                constants::get_degrees_per_step((i + 1) as u8),
            ) {
                angles[i] = Some(((*steps as f32) / reduction_ratio) * degrees_per_step);
            }
        }
    }

    // Convert `angles` array into `SteppersAngles` struct
    let steppers_angles = constants::SteppersAngles {
        j1: angles[0],
        j2: angles[1],
        j3: angles[2],
        j4: angles[3],
        j5: angles[4],
        j6: angles[5],
    };

    // Emit calculated angles to the frontend
    app.emit("report-steppers-angles", steppers_angles).unwrap();

    Ok(angles)
}

pub async fn drive_steppers_to_angles(
    app: &AppHandle, // Pass by reference
    joints_angles: Vec<(i8, f32)>, 
    state: SharedAppState,
) -> Result<String, String> {
    // Get the current angles of the steppers
    let current_angles = get_steppers_angles(app, state.clone()).await?;

    let mut move_command = String::from(constants::CommandCodes::MOVE);

    // Build move command for each stepper taking into account current and max angles
    for (joint_id, target_angle) in joints_angles {
        let joint_index = (joint_id - 1) as usize; // Convert joint ID to array index (1-based to 0-based)

        if joint_index >= 6 {
            return Err(format!("Invalid Joint: {}", joint_id));
        }

        // Ensure we have a known current angle
        let current_angle = match current_angles[joint_index] {
            Some(angle) => angle,
            None => return Err(format!("Current angle for J{} is unknown", joint_id)),
        };

        // Check if the target angle exceeds joint limits
        if target_angle > constants::get_max_angle(joint_id as u8).unwrap() {
            return Err(format!(
                "Target angle exceeds joint limits for J{}",
                joint_id
            ));
        }

        // Convert angle difference to steps
        if let (Some(reduction_ratio), Some(degrees_per_step)) = (
            constants::get_reduction_ratio(joint_id as u8),
            constants::get_degrees_per_step(joint_id as u8),
        ) {
            let steps =
                ((target_angle - current_angle) * (1.0 / degrees_per_step) * reduction_ratio).round() as i32;
            move_command.push_str(&format!("J{}_{};", joint_id, steps));
        } else {
            return Err(format!("Invalid Joint: {}", joint_id));
        }
    }

    let response = send_and_receive_from_shared_state(&move_command, state.clone(),  Some(Duration::from_secs(20))).await;

    // Send the command using the shared connection
    match response {
        Ok(response) => {
            // Call `get_steppers_angles` again to retrieve updated angles
            if let Err(e) = get_steppers_angles(app, state).await {
                return Err(format!("Error retrieving stepper angles: {}", e));
            }

            Ok(format!(
                "Successfully sent move command. Response: {}",
                response
            ))
        }
        Err(e) => Err(format!("Error: {}", e)),
    }
}
