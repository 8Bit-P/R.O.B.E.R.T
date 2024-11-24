use serialport::available_ports;
use crate::utils::send_and_receive_from_selected_port;
use crate::constants;


#[tauri::command]
pub fn connect_to_port(port: &str) -> Result<String, String> {
    match send_and_receive_from_selected_port(constants::CommandCodes::CHECK, port) {
        Ok(response) => {
            if response.trim() == constants::ResponseCodes::CONNECTED{
                Ok(format!("Successfully connected to port: {}.", port))
            } else {
                Err(format!("Failed to connect to port: {}. Unexpected response: {}", port, response))
            }
        }
        Err(e) => Err(format!("Failed to connect to port: {}. Error: {}", port, e)),
    }
}

#[tauri::command]
pub fn set_acceleration(port: &str, acceleration: i8) -> Result<String, String> {
    //Arduino command format: SETACC>ACCELERATION_VALUE;
    let set_acc_command = format!(
        "{}{}",
        constants::CommandCodes::SETACC,
        acceleration
    );

    match send_and_receive_from_selected_port(&set_acc_command, port) {
        Ok(response) => Ok(format!("Succesfully send set_acc command. Response: {}",response)),
        Err(e) => Err(format!("Unexpected error while sending set_acc command. Error: {}", e)),
    }
}

#[tauri::command]
pub fn set_velocity(port: &str, velocity: i8) -> Result<String, String> {
    //Arduino command format: SETACC>ACCELERATION_VALUE;
    let set_vel_command = format!(
        "{}{}",
        constants::CommandCodes::SETVEL,
        velocity
    );

    match send_and_receive_from_selected_port(&set_vel_command, port) {
        Ok(response) => Ok(format!("Succesfully send set_vel command. Response: {}",response)),
        Err(e) => Err(format!("Unexpected error while sending set_vel command. Error: {}", e)),
    }
}

#[tauri::command]
pub fn increment_step(port: &str, joint_index:i8, n_steps: i16 ) -> Result<String, String> {
    //Arduino command format: MOVE>JOINT_NSTEPS;
    let increment_step_command = format!(
        "{}JOINT{}_{};",
        constants::CommandCodes::MOVE,
        joint_index,
        n_steps
    );

    match send_and_receive_from_selected_port(&increment_step_command, port) {
        Ok(response) => Ok(format!("Succesfully send increment_step command. Response: {}",response)),
        Err(e) => Err(format!("Unexpected error while sending increment step command. Error: {}", e)),
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