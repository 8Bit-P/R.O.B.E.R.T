// Import necessary crates
use serialport::available_ports;

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn connect_to_port(port: &str) -> String {
    println!("Attempting to connect to port: {}", port);
    format!("Connected to port: {}", port)
}

#[tauri::command]
fn get_ports() -> Vec<String> {
    let mut ports_list = Vec::new();

    // Attempt to get the list of available serial ports
    if let Ok(ports) = available_ports() {
        for port in ports {
            // Add all detected port names, regardless of type
            println!("Found port: {:?}", port);  // For debugging

            // Add the port name to the list (like COM1, COM2, etc.)
            ports_list.push(port.port_name);
        }
    } else {
        println!("Failed to list ports.");
    }

    ports_list
}


#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![greet, connect_to_port, get_ports])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
