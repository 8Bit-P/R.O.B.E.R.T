export const invoke = window.__TAURI__.core.invoke;

// Fetch available ports
export const getPorts = async (): Promise<string[]> => {
  return invoke<string[]>("get_ports");
};

// Connect to a specific port
export const connectToPortAPI = async (port: string): Promise<string[]> => {
  return invoke<string[]>("connect_to_port", { port });
};

export const disconnectFromActiveConnectionAPI = async (): Promise<string[]> => {
  return invoke<string[]>("disconnect_from_active_connection");
};

export const setAcceleration = async (acceleration: number | null | undefined): Promise<string[]> => {

  if (acceleration == null) {
    throw new Error("acceleration must be provided and cannot be null or undefined");
  }

  return invoke<string[]>("set_acceleration", {acceleration });
};

export const setVelocity = async (velocity: number | null | undefined): Promise<string[]> => {

  if (velocity == null) {
    throw new Error("velocity must be provided and cannot be null or undefined");
  }

  return invoke<string[]>("set_velocity", {velocity });
};

export const moveStep = async (jointIndex: number | null | undefined, nSteps: number | null | undefined): Promise<string[]> => {

  if (jointIndex == null || nSteps == null) {
    throw new Error("joint_index and steps must be provided and cannot be null or undefined");
  }

  return invoke<string[]>("move_step", {jointIndex, nSteps:nSteps });
};

export const toggleStepperState = async (jointIndex: number | null | undefined, enabled: string | null | undefined): Promise<string[]> => {

  if (jointIndex == null || enabled == null) {
    throw new Error("port, joint_index and enabled must be provided and cannot be null or undefined");
  }

  return invoke<string[]>("toggle_stepper", { jointIndex, enabled });
};

//Returns a string indicating which steppers are enabled or disabled
export const checkSteppersState = async (): Promise<string[]> => {
  
  return invoke<string[]>("check_steppers");
};

export const calibrateStepper = async (jointsIndexes: number[] | null | undefined): Promise<string[]> => {

  if (jointsIndexes == null) {
    throw new Error("port and jointsIndexes must be provided and cannot be null or undefined");
  }

  return invoke<string[]>("calibrate_steppers", { jointsIndexes });
};

export const driveStepperToAngle = async (jointsAngles: Map<number,number> | null | undefined): Promise<string[]> => {

  console.log(jointsAngles);

  if (jointsAngles == null) {
    throw new Error("port and jointAngles must be provided and cannot be null or undefined");
  }

  const jointsAnglesArray = Array.from(jointsAngles.entries());

  return invoke<string[]>("drive_steppers_to_angles", { jointsAngles: jointsAnglesArray });
};


