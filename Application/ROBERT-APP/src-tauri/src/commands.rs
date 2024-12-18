use serialport::available_ports;
use crate::utils::send_and_receive_from_selected_port;
use crate::constants;


#[tauri::command]
pub async fn connect_to_port(port: &str) -> Result<String, String> {
    match send_and_receive_from_selected_port(constants::CommandCodes::CHECK, port).await {
        Ok(response) => {
            if response.trim() == constants::ResponseCodes::CONNECTED_RESPONSE{
                Ok(format!("Successfully connected to port: {}.", port))
            } else {
                Err(format!("Failed to connect to port: {}. Unexpected response: {}", port, response))
            }
        }
        Err(e) => Err(format!("Failed to connect to port: {}. Error: {}", port, e)),
    }
}

#[tauri::command]
pub async fn set_acceleration(port: &str, acceleration: i8) -> Result<String, String> {
    //Arduino command format: SETACC>ACCELERATION_VALUE;
    let set_acc_command = format!(
        "{}{}",
        constants::CommandCodes::SETACC,
        acceleration
    );

    match send_and_receive_from_selected_port(&set_acc_command, port).await {
        Ok(response) => Ok(format!("Succesfully sent set_acc command. Response: {}",response)),
        Err(e) => Err(format!("Error: {}", e)),
    }
}

#[tauri::command]
pub async fn set_velocity(port: &str, velocity: i8) -> Result<String, String> {
    //Arduino command format: SETACC>ACCELERATION_VALUE;
    let set_vel_command = format!(
        "{}{}",
        constants::CommandCodes::SETVEL,
        velocity
    );

    match send_and_receive_from_selected_port(&set_vel_command, port).await {
        Ok(response) => Ok(format!("Succesfully sent set_vel command. Response: {}",response)),
        Err(e) => Err(format!("Error: {}", e)),
    }
}

#[tauri::command]
pub async fn move_step(port: &str, joint_index:i8, n_steps: i16 ) -> Result<String, String> {

    //Arduino command format: MOVE>JOINT_NSTEPS;
    let move_step_command = format!(
        "{}J{}_{};",
        constants::CommandCodes::MOVE,
        joint_index,
        n_steps
    );

    match send_and_receive_from_selected_port(&move_step_command, port).await {
        Ok(response) => Ok(format!("Succesfully sent move_step command. Response: {}",response)),
        Err(e) => Err(format!("Error: {}", e)),
    }
}

#[tauri::command]
pub async fn toggle_stepper(port: &str, joint_index:i8, enabled: &str ) -> Result<String, String> {

    //Arduino command format: TOGGLE>JOINT_STATE;
    let toggle_command = format!(
        "{}J{}_{};",
        constants::CommandCodes::TOGGLE,
        joint_index,
        enabled
    );

    match send_and_receive_from_selected_port(&toggle_command, port).await {
        Ok(response) => Ok(format!("Succesfully sent toggle_step command. Response: {}",response)),
        Err(e) => Err(format!("Error: {}", e)),
    }
}

#[tauri::command]
pub async fn calibrate_steppers(port: &str, joints_indexes: Vec<i8>) -> Result<String, String> {

    // Create a string for each joint in the joints_indexes array, formatted as J{index};
    let joint_commands: Vec<String> = joints_indexes
        .iter()
        .map(|&index| format!("J{};", index))
        .collect();
    
    // Join all joint commands with no separator, and prepend the CALIBRATE> part
    let calibrate_command = format!("{}{}", constants::CommandCodes::CALIBRATE, joint_commands.join(""));

    match send_and_receive_from_selected_port(&calibrate_command, port).await {
        Ok(response) => Ok(format!("Successfully sent calibrate command. Response: {}", response)),
        Err(e) => Err(format!("Error: {}", e)),
    }
}

#[tauri::command]
pub async fn drive_steppers_to_angles(port: &str, joints_angles: Vec<(i8, f32)>) -> Result<String, String> {

    //TODO: Create MOVE> command to send to arduino that maps angles to moving steps for each stepper
        //1. Get current angle of the motors (or number of steps from home position most likely)
            //1.0 Implement getPosition command in arduino
            //1.1 Convert steps into angles for each motor
        //2. Get difference between desired angle and current angle for each motor that provided in joints_angles
        //3. Compute amount of steps for each motor to reach desired angle knowing its reductions

    match send_and_receive_from_selected_port(&"TODO", port).await {
        Ok(response) => Ok(format!("Successfully sent calibrate command. Response: {}", response)),
        Err(e) => Err(format!("Error: {}", e)),
    }
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