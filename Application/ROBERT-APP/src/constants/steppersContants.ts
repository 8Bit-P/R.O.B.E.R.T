export const DEFAULT_INCREMENT_STEPS = 10;

export const STEPPER_LIMITS: Record<number, number> = {
  1: 270,
  2: 100,
  3: 120,
  4: 270,
  5: 45, //TODO: set when joints developed
  6: 360, //TODO: set when joints developed
};

export const enum CalibrationStates {
  NOT_CALIBRATED = '#FD0200', // Red for uncalibrated
  CALIBRATED = '#69B59E', // Green for calibrated
  CALIBRATING = '#A0A0A0', // Gray for calibrating
}
