mod commands;
mod utils;
mod constants;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![commands::connect_to_port, commands::move_step, commands::set_acceleration, 
                                                 commands::set_velocity, commands::get_ports, commands::toggle_stepper,
                                                 commands::calibrate_steppers, commands::drive_steppers_to_angles])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
