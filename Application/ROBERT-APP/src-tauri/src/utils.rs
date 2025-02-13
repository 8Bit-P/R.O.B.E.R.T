use crate::constants;
use crate::state::SharedAppState;
use tokio::{
    io::{AsyncReadExt, AsyncWriteExt},
    time::{timeout, Duration},
};

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

//Sends state command to arduino and returns an array of bools representing the state of the steppers
pub async fn get_steppers_state(state: SharedAppState) -> Result<[bool; 6], String> {

    let data = constants::CommandCodes::STATE;
    let response = send_and_receive_from_shared_state(data, state).await?;

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
    let response = send_and_receive_from_shared_state(data, state).await?;

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

pub async fn get_steppers_angles(state: SharedAppState) -> Result<[Option<f32>; 6], String> {
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

    Ok(angles)
}

pub async fn drive_steppers_to_angles(
    joints_angles: Vec<(i8, f32)>, // Desired angles to move each joint
    state: SharedAppState,
) -> Result<String, String> {
    // Get the current angles of the steppers
    let current_angles = get_steppers_angles(state.clone()).await?;

    let mut move_command = String::from(constants::CommandCodes::MOVE);

    for (joint_id, target_angle) in joints_angles {
        let joint_index = (joint_id - 1) as usize; // Convert joint ID to array index (1-based to 0-based)

        if joint_index >= 6 {
            return Err(format!("Invalid joint ID: {}", joint_id));
        }

        // Ensure we have a known current angle
        let current_angle = match current_angles[joint_index] {
            Some(angle) => angle,
            None => return Err(format!("Current angle for joint {} is unknown", joint_id)),
        };

        // Compute the difference between the target and current angles
        let angle_difference = target_angle - current_angle;

        // Convert angle difference to steps
        if let (Some(reduction_ratio), Some(degrees_per_step)) = (
            constants::get_reduction_ratio(joint_id as u8),
            constants::get_degrees_per_step(joint_id as u8),
        ) {
            let steps = (angle_difference * (1.0 / degrees_per_step) * reduction_ratio).round() as i32;
            move_command.push_str(&format!("J{}_{};", joint_id, steps));
        } else {
            return Err(format!("Invalid joint ID: {}", joint_id));
        }
    }

    // Send the command using the shared connection
    match send_and_receive_from_shared_state(&move_command, state).await {
        Ok(response) => Ok(format!(
            "Successfully sent move command. Response: {}",
            response
        )),
        Err(e) => Err(format!("Error: {}", e)),
    }
}


