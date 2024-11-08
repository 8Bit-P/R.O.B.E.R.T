// Import necessary crates
use serialport::available_ports;
use crate::utils::send_and_receive_from_selected_port;

#[tauri::command]
pub fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
pub fn connect_to_port(port: &str) -> Result<String, String> {
    match send_and_receive_from_selected_port("CHECK>", port) {
        Ok(response) => {
            if response.trim() == "CONNECTED" {
                Ok(format!("Successfully connected to port: {}.", port))
            } else {
                Err(format!("Failed to connect to port: {}. Unexpected response: {}", port, response))
            }
        }
        Err(e) => Err(format!("Failed to connect to port: {}. Error: {}", port, e)),
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