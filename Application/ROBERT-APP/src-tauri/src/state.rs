use std::sync::Arc;
use tokio::sync::Mutex;
use tokio_serial::SerialStream;
use tokio::sync::RwLock;

// Shared type for serial connection
pub type SharedSerialConnection = Arc<Mutex<SerialStream>>;

// Define your application state
pub struct AppState {
    pub serial_connection: Option<SharedSerialConnection>,
}

impl AppState {
    pub fn new() -> Self {
        Self {
            serial_connection: None,
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
