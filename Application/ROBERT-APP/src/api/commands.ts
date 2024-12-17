export const invoke = window.__TAURI__.core.invoke;

// Fetch available ports
export const getPorts = async (): Promise<string[]> => {
  return invoke<string[]>("get_ports");
};

// Connect to a specific port
export const connectToPortAPI = async (port: string): Promise<string[]> => {
  return invoke<string[]>("connect_to_port", { port });
};

export const setAcceleration = async (port: string | null | undefined, acceleration: number | null | undefined): Promise<string[]> => {
  // Check if `port` or `acceleration` is null or undefined
  if (port == null || acceleration == null) {
    throw new Error("port and acceleration must be provided and cannot be null or undefined");
  }

  return invoke<string[]>("set_acceleration", { port, acceleration });
};

export const setVelocity = async (port: string | null | undefined, velocity: number | null | undefined): Promise<string[]> => {
  // Check if `port` or `velocity` is null or undefined
  if (port == null || velocity == null) {
    throw new Error("port and velocity must be provided and cannot be null or undefined");
  }

  return invoke<string[]>("set_velocity", { port, velocity });
};

export const moveStep = async (port: string | null | undefined, jointIndex: number | null | undefined, nSteps: number | null | undefined): Promise<string[]> => {

  // Check if `port` or `jointIndex` or `nSteps` is null or undefined
  if (port == null || jointIndex == null || nSteps == null) {
    throw new Error("port, joint_index and steps must be provided and cannot be null or undefined");
  }

  return invoke<string[]>("move_step", { port, jointIndex, nSteps:nSteps });
};

export const toggleStepperState = async (port: string | null | undefined, jointIndex: number | null | undefined, enabled: string | null | undefined): Promise<string[]> => {

  // Check if `port` or `jointIndex` or `enabled` is null or undefined
  if (port == null || jointIndex == null || enabled == null) {
    throw new Error("port, joint_index and enabled must be provided and cannot be null or undefined");
  }

  return invoke<string[]>("toggle_stepper", { port, jointIndex, enabled });
};

//Returns a string indicating which steppers are enabled or disabled
export const checkSteppersState = async (port: string | null | undefined): Promise<string[]> => {

  // Check if `port` is null or undefined
  if (port == null) {
    throw new Error("port and cannot be null or undefined");
  }

  return invoke<string[]>("check_steppers", { port });
};

export const calibrateStepper = async (port: string | null | undefined, jointsIndexes: number[] | null | undefined): Promise<string[]> => {

  // Check if `port` or `velocity` is null or undefined
  if (port == null || jointsIndexes == null) {
    throw new Error("port, jointsIndexes must be provided and cannot be null or undefined");
  }

  return invoke<string[]>("calibrate_steppers", { port, jointsIndexes });
};


