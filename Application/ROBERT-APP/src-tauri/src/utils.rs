use serialport::{self, DataBits, Parity, StopBits};
use std::io::{self};
use std::time::Duration;


pub fn send_and_receive_from_selected_port(data: &str, port_name: &str) -> io::Result<String> {
    let baud_rate = 9600;
    let timeout = Duration::from_secs(2); // Increase the timeout if needed

    // Open the serial port
    let mut port = serialport::new(port_name, baud_rate)
        .timeout(timeout)
        .data_bits(DataBits::Eight)
        .parity(Parity::None)
        .stop_bits(StopBits::One)
        .open()?;

    println!("###DEBUG### - Sending data: {}", data);

    // Write the data to the port
    port.write_all(data.as_bytes())?;
    port.flush()?; // Ensure data is flushed and sent

    println!("###DEBUG### - Waiting for response...");

    let mut response = Vec::new();
    let mut buffer = [0; 1024]; // Buffer to read data in chunks

    loop {
        match port.read(&mut buffer) {
            Ok(bytes_read) => {
                response.extend_from_slice(&buffer[..bytes_read]);
                println!("###DEBUG### - Read {} bytes", bytes_read);
                
                // Check if we have received a complete response, such as ending with a newline
                if response.ends_with(b"\n") {
                    break;
                }
            }
            Err(ref e) if e.kind() == io::ErrorKind::TimedOut => {
                println!("###DEBUG### - Read timed out. No more data received.");
                break;
            }
            Err(e) => return Err(io::Error::new(io::ErrorKind::Other, format!("Error reading response: {}", e))),
        }
    }

    // Convert the response bytes into a string
    let response_string = String::from_utf8_lossy(&response).to_string();
    println!("###DEBUG### - Response obtained: {}", response_string);

    Ok(response_string)
}
