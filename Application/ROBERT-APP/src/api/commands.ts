// @ts-ignore
export const invoke = window.__TAURI__.core.invoke;

// Fetch available ports
export const getAPIPorts = async (): Promise<string[]> => {
  return invoke<string[]>('get_ports');
};

// Connect to a specific port
export const connectToPortAPI = async (port: string): Promise<string[]> => {
  return invoke<string[]>('connect_to_port', { port });
};

//Disconnects from current connection
export const disconnectFromActiveConnectionAPI = async (): Promise<string[]> => {
  return invoke<string[]>('disconnect_from_active_connection');
};

//Sets the acceleration of all the steppers
export const setAPIAcceleration = async (acceleration: number): Promise<string[]> => {
  return invoke<string[]>('set_acceleration', { acceleration });
};

//Sets the velocity of all the steppers
export const setAPIVelocity = async (velocity: number): Promise<string[]> => {
  return invoke<string[]>('set_velocity', { velocity });
};

//Moves specified joint a number of steps
export const moveAPIStep = async (jointIndex: number, nSteps: number): Promise<string[]> => {
  return invoke<string[]>('move_step', { jointIndex, nSteps: nSteps });
};

//Enables or disables a stepper
export const toggleAPIStepperState = async (jointIndex: number, enabled: string): Promise<string[]> => {
  return invoke<string[]>('toggle_stepper', { jointIndex, enabled });
};

//Returns an array of boleans where each position represents a stepper index and each value enabled (true) or disabled (false)
export const checkAPISteppersState = async (): Promise<boolean[]> => {
  return invoke<boolean[]>('check_steppers_state');
};

//Returns an array of numbers where each position represents a stepper index and each value its angular position
export const getAPISteppersAngles = async (): Promise<number[]> => {
  return invoke<number[]>('get_steppers_angles');
};

//Returns a array of 2 numbers [velocity, acceleration]
export const getAPIParameters = async (): Promise<number[]> => {
  return invoke<number[]>('get_parameters');
};

//calibrates the array of indexes sent by parameters
export const calibrateAPIStepper = async (jointsIndexes: number[]): Promise<string> => {
  return invoke<string>('calibrate_steppers', { jointsIndexes });
};

//Given a map of indexes of steppers and angles it moves the steppers to the specified angles
export const driveAPIStepperToAngle = async (jointsAngles: Map<number, number>): Promise<string[]> => {
  const jointsAnglesArray = Array.from(jointsAngles.entries());

  return invoke<string[]>('drive_steppers_to_angles', { jointsAngles: jointsAnglesArray });
};

//Gets the transform of the end efector from the angles of the steppers
export const getFKFromAngles = async (): Promise<number[]> => {
  return invoke<number[]>('get_fk_from_angles');
};
