export const invoke = window.__TAURI__.core.invoke;

// Fetch available ports
export const getPorts = async (): Promise<string[]> => {
  return invoke<string[]>("get_ports");
};

// Connect to a specific port
export const connectToPortAPI = async (port: string): Promise<string[]> => {
  return invoke<string[]>("connect_to_port", { port });
};
