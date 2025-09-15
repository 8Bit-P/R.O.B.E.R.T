export const DEFAULT_INCREMENT_STEPS = 10;

export const STEPPER_LIMITS: Record<number, number> = {
  1: 270,
  2: 100,
  3: 120,
  4: 270,
  5: 45, //TODO: set when joints developed
  6: 360,
};

export const enum CalibrationStates {
  NOT_CALIBRATED = '#FD0200', // Red for uncalibrated
  CALIBRATED = '#69B59E', // Green for calibrated
  CALIBRATING = '#A0A0A0', // Gray for calibrating
}

// To map correct orientations when moving the arm in the simulation
export const STEPPER_POSITIVE_TO_LIMIT: Record<number, boolean> = {
  1: true, 
  2: false,
  3: false,
  4: true,
  5: false, // TODO: set when joints developed
  6: false, 
};
