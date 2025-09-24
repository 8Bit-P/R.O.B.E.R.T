import { AngleLimit } from '../interfaces/SteppersAngles';

export const DEFAULT_INCREMENT_STEPS = 10;

export const STEPPER_LIMITS: Record<number, AngleLimit> = {
  1: { min: 0, max: 270 },
  2: { min: -15, max: 75},
  3: { min: -70, max: 50 },
  4: { min: 0, max: 270 },
  5: { min: 0, max: 45 }, //TODO: set when joints developed
  6: { min: 0, max: 360 },
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
  3: true,
  4: false,
  5: false, // TODO: set when joints developed
  6: false,
};
