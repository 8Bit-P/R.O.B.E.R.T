// use crate::state::SharedAppState;
// use crate::utils::command_utils::send_and_receive_from_shared_state;
// use std::sync::Arc;
// use tauri::State;
// use tokio::sync::Mutex;
// use tokio::time::Duration;
// use tokio_serial::{DataBits, Parity, SerialPortBuilderExt, StopBits};


// pub async fn get_cartesian_from_angles(
//     app: &AppHandle,
//     state: SharedAppState,
// ) -> Result<[Option<f32>; 6], String> { //TODO: probably good to create a struct or something o hold the values to be returned so they are more understandable
//     //From J1ª,J2ª,J3ª,J4ª,J5ª,J6ª -> X,Y,Z / ROLL, PITCH, YAW
//     //TODO: 
//     //1. Create function to give parameters and return transformation matrix Ji
//     //2. Get all RO-i until ROT (or one less since we dont have the gripper yet)
//     //3. Extract the position from the end efector (simple values in matrix)
//     //4. Extract the yaw,pitch,roll from the last matrix using the arctan2 ecuations
// }