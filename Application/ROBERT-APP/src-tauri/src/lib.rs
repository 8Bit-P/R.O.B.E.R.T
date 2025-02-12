mod commands;
mod utils;
mod constants;
mod state;

use tauri::async_runtime::RwLock;
use state::SharedAppState;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {

    let shared_state = SharedAppState::new(RwLock::new(state::AppState::new()));

    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .manage(shared_state)
        .invoke_handler(tauri::generate_handler![
            commands::connect_to_port, 
            commands::disconnect_from_active_connection,
            commands::move_step, 
            commands::set_acceleration, 
            commands::set_velocity, 
            commands::get_ports, 
            commands::toggle_stepper,
            commands::calibrate_steppers, 
            commands::drive_steppers_to_angles,
            commands::check_steppers_state,
            commands::get_steppers_angles
            ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
