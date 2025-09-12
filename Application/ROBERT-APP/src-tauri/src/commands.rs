use crate::state::SharedAppState;
use crate::utils::{connection_utils, parameter_utils, stepper_utils};
use tauri::{AppHandle, State};

#[tauri::command]
pub async fn connect_to_port<'a>(port: String, state: State<'a, SharedAppState>) -> Result<String, String> {
    connection_utils::connect_to_port(port, state).await
}

#[tauri::command]
pub fn get_ports() -> Vec<String> {
    connection_utils::get_ports_list()
}

#[tauri::command]
pub async fn disconnect_from_active_connection<'a>(state: State<'a, SharedAppState>) -> Result<String, String> {
    connection_utils::disconnect(state.inner()).await
}

#[tauri::command]
pub async fn set_acceleration<'a>(acceleration: i8, state: State<'a, SharedAppState>) -> Result<String, String> {
    parameter_utils::set_acceleration(acceleration, state.inner().clone()).await
}

#[tauri::command]
pub async fn set_velocity<'a>(velocity: i8, state: State<'a, SharedAppState>) -> Result<String, String> {
    parameter_utils::set_velocity(velocity, state.inner().clone()).await
}

#[tauri::command]
pub async fn get_parameters<'a>(state: State<'a, SharedAppState>) -> Result<[u8; 2], String> {
    parameter_utils::get_parameters(state.inner().clone()).await
}

#[tauri::command]
pub async fn toggle_stepper<'a>(joint_index: i8, enabled: &str, state: State<'a, SharedAppState>) -> Result<String, String> {
    stepper_utils::toggle_stepper(joint_index, enabled, state.inner().clone()).await
}

#[tauri::command]
pub async fn move_step<'a>(app: AppHandle, joint_index: i8, n_steps: i16, state: State<'a, SharedAppState>) -> Result<String, String> {
    stepper_utils::move_step(&app, joint_index, n_steps, state.inner().clone()).await
}

#[tauri::command]
pub async fn calibrate_steppers<'a>(joints_indexes: Vec<i8>, state: State<'a, SharedAppState>) -> Result<String, String> {
   stepper_utils::calibrate_steppers(joints_indexes, state.inner().clone()).await
}

//Command assumes all joint angles are provided as positive numbers
#[tauri::command]
pub async fn drive_steppers_to_angles<'a>(app: AppHandle, joints_angles: Vec<(i8, f32)>, state: State<'a, SharedAppState>) -> Result<String, String> {
    stepper_utils::drive_steppers_to_angles(&app, joints_angles, state.inner().clone()).await
}

#[tauri::command]
pub async fn check_steppers_state<'a>(state: State<'a, SharedAppState>) -> Result<[bool; 6], String> {
    return stepper_utils::get_steppers_state(state.inner().clone()).await;
}

#[tauri::command]
pub async fn get_steppers_angles<'a>(app: AppHandle, state: State<'a, SharedAppState>) -> Result<[Option<f32>; 6], String> {
    return stepper_utils::get_steppers_angles(&app, state.inner().clone()).await;
}
