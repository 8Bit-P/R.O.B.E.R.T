use std::sync::Arc;
use tokio::sync::{Mutex, Notify};
use tokio_serial::SerialStream;
use tokio::sync::RwLock;

// Shared type for serial connection
pub type SharedSerialConnection = Arc<Mutex<SerialStream>>;

// Define your application state
pub struct AppState {
    pub serial_connection: Option<SharedSerialConnection>,
    pub stop_notify: Arc<Notify>,  // Used to stop the background task
    pub background_task_notify: Arc<Notify>,  // Used to notify the background task to read when the connection is idle
}

impl AppState {
    pub fn new() -> Self {
        Self {
            serial_connection: None,
            stop_notify: Arc::new(Notify::new()), // Notify to stop the task
            background_task_notify: Arc::new(Notify::new()), // Notify to read from the serial port
        }
    }

    pub fn set_connection(&mut self, connection: SharedSerialConnection) {
        self.serial_connection = Some(connection);
    }

    pub fn clear_connection(&mut self) {
        self.serial_connection = None;
    }
}

// Shared state type for your application
pub type SharedAppState = Arc<RwLock<AppState>>;
