use crate::constants::{self, STEPPER_POSITIVE_TO_LIMIT};
use crate::state::SharedAppState;
use crate::structs::angles::SteppersAngles;
use crate::utils::command_utils::send_and_receive_from_shared_state;
use tauri::{AppHandle, Emitter};
use tokio::time::Duration;

//Sends state command to arduino and returns an array of bools representing the state of the steppers
pub async fn get_steppers_state(state: SharedAppState) -> Result<[bool; 6], String> {
    let data = constants::CommandCodes::STATE;
    let response = send_and_receive_from_shared_state(data, state, None).await?;

    // Parse the response
    let state_str = response.trim_start_matches(constants::ResponseCodes::STATE_RESPONSE).trim_end_matches("~");

    // Split the response into parts
    let parts: Vec<&str> = state_str.split(';').collect();

    let mut stepper_states = [false; 6];

    for part in parts.iter() {
        // Strip any trailing newline or extra spaces from each part
        let part = part.trim();

        if let Some(index) = part.strip_prefix("J").and_then(|s| s.chars().next()).and_then(|c| c.to_digit(10)) {
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
    let state_str = response.trim_start_matches(constants::ResponseCodes::STEPS_RESPONSE).trim_end_matches("~");

    // Split the response into parts
    let parts: Vec<&str> = state_str.split(';').collect();

    let mut stepper_steps = [None; 6];

    for part in parts.iter() {
        // Strip any trailing newline or extra spaces from each part
        let part = part.trim();

        if let Some(index) = part.strip_prefix("J").and_then(|s| s.chars().next()).and_then(|c| c.to_digit(10)) {
            let idx = (index as usize).saturating_sub(1);
            if idx < 6 {
                if part.ends_with("UNKNOWN") {
                    stepper_steps[idx] = None;
                } else if let Some(steps) = part.strip_prefix(&format!("J{}_", index)).and_then(|s| s.parse::<f32>().ok()) {
                    stepper_steps[idx] = Some(steps);
                }
            }
        }
    }

    Ok(stepper_steps)
}

//Queries the arduino the steps of each stepper and converts them to angles according to their reductions and degrees, then emits an event for the frontend to listen
pub async fn get_steppers_angles(app: &AppHandle, state: SharedAppState) -> Result<[Option<f32>; 6], String> {
    let steps = get_steppers_steps(state).await?;
    let mut angles = [None; 6];

    for (i, step) in steps.iter().enumerate() {
        if let Some(steps) = step {
            if let (Some(reduction_ratio), Some(degrees_per_step)) =
                (constants::get_reduction_ratio((i + 1) as u8), constants::get_degrees_per_step((i + 1) as u8))
            {
                // 1. Compute absolute mechanical angle
                let mut angle = ((*steps as f32) / reduction_ratio) * degrees_per_step;

                // 2. Flip sign if this joint's direction is inverted
                if STEPPER_POSITIVE_TO_LIMIT.get(&((i + 1) as u8)).copied().unwrap_or(false) {
                    angle = -angle;
                }

                // 3. Convert to relative angle (0 at min)
                if let Some(limits) = constants::get_max_angles((i + 1) as u8) {
                    angle -= limits.min.abs();
                }

                angles[i] = Some(angle);
            }
        }
    }

    // Convert `angles` array into `SteppersAngles` struct
    let steppers_angles = SteppersAngles {
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

/// Validate a set of joint angles against their configured limits.
pub fn validate_joint_angles(joints_angles: &Vec<(i8, f32)>) -> Result<(), String> {
    for (joint_id, angle) in joints_angles {
        if let Some(limits) = constants::get_max_angles(*joint_id as u8) {
            if *angle < limits.min || *angle > limits.max {
                return Err(format!(
                    "Target angle {} exceeds joint limits [{}, {}] for J{}",
                    angle, limits.min, limits.max, joint_id
                ));
            }
        }
    }
    Ok(())
}

//Given a set of angles for the steppers, moves then to the specified angle
pub async fn drive_steppers_to_angles(
    app: &AppHandle, // Pass by reference
    joints_angles: Vec<(i8, f32)>,
    state: SharedAppState,
) -> Result<String, String> {
    // Validate angles first
    validate_joint_angles(&joints_angles)?;

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

        // Convert angle difference to steps
        if let (Some(reduction_ratio), Some(degrees_per_step)) =
            (constants::get_reduction_ratio(joint_id as u8), constants::get_degrees_per_step(joint_id as u8))
        {
            // Determine direction based on positive-to-limit mapping
            let sign_multiplier = if constants::STEPPER_POSITIVE_TO_LIMIT.get(&(joint_id as u8)).copied().unwrap_or(false) {
                -1.0
            } else {
                1.0
            };

            // Compute steps with correct direction
            let steps = (((target_angle - current_angle) * sign_multiplier) * (1.0 / degrees_per_step) * reduction_ratio).round() as i32;

            move_command.push_str(&format!("J{}_{};", joint_id, steps));
        } else {
            return Err(format!("Invalid Joint: {}", joint_id));
        }
    }

    let response = send_and_receive_from_shared_state(&move_command, state.clone(), Some(Duration::from_secs(20))).await;

    // Send the command using the shared connection
    match response {
        Ok(response) => {
            // Call `get_steppers_angles` again to retrieve updated angles
            if let Err(e) = get_steppers_angles(app, state).await {
                return Err(format!("Error retrieving stepper angles: {}", e));
            }

            Ok(format!("Successfully sent move command. Response: {}", response))
        }
        Err(e) => Err(format!("Error: {}", e)),
    }
}

/// Move a single stepper by a number of steps, taking into account the positive limit switch
pub async fn move_step(app: &AppHandle, joint_index: i8, mut n_steps: i16, state: SharedAppState) -> Result<String, String> {
    // Validate joint index
    if joint_index <= 0 || joint_index as usize >= STEPPER_POSITIVE_TO_LIMIT.len() {
        return Err("Invalid joint index".to_string());
    }

    // Invert steps if joint has a positive limit switch
    let joint_index_u8 = joint_index as u8;
    if STEPPER_POSITIVE_TO_LIMIT[&joint_index_u8] {
        n_steps = -n_steps;
    }

    // Format command
    let move_step_command = format!("{}J{}_{};", constants::CommandCodes::MOVE, joint_index, n_steps);

    // Send command
    let response = send_and_receive_from_shared_state(&move_step_command, state.clone(), None).await;

    match response {
        Ok(resp) => {
            // Update stepper angles after movement
            if let Err(e) = get_steppers_angles(app, state.clone()).await {
                return Err(format!("Error retrieving stepper angles: {}", e));
            }

            Ok(format!("Successfully sent move_step command. Response: {}", resp))
        }
        Err(e) => Err(format!("Error: {}", e)),
    }
}

/// Toggle a stepper on/off
pub async fn toggle_stepper<'a>(joint_index: i8, enabled: &str, state: SharedAppState) -> Result<String, String> {
    let toggle_command = format!("{}J{}_{};", constants::CommandCodes::TOGGLE, joint_index, enabled);

    crate::utils::command_utils::send_command(&toggle_command, state, None, "Successfully sent toggle_step command").await
}

/// Calibrate multiple steppers
pub async fn calibrate_steppers(joints_indexes: Vec<i8>, state: SharedAppState) -> Result<String, String> {
    // Format joint commands
    let joint_commands: Vec<String> = joints_indexes.iter().map(|&index| format!("J{};", index)).collect();

    // Prepend the CALIBRATE command
    let calibrate_command = format!("{}{}", constants::CommandCodes::CALIBRATE, joint_commands.join(""));

    // Send command with high timeout
    let response = send_and_receive_from_shared_state(&calibrate_command, state, Some(Duration::from_secs(35))).await?;

    // Trim response to remove protocol markers
    let trimmed_response = response
        .trim_start_matches(constants::ResponseCodes::CALIBRATION_RESPONSE)
        .trim_end_matches('~')
        .trim()
        .to_string();

    Ok(trimmed_response)
}
