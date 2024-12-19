#ifndef CONSTANTS_H
#define CONSTANTS_H

// Motor interface type must be set to 1 when using a driver
constexpr int motorInterfaceType = 1;

// Command codes
constexpr char MoveCommand[] = "MOVE";
constexpr char CheckCommand[] = "CHECK";
constexpr char SetVelocityCommand[] = "SETVEL";
constexpr char SetAccelerationCommand[] = "SETACC";
constexpr char ToggleStepperCommand[] = "TOGGLE";
constexpr char CalibrateStepperCommand[] = "CALIBRATE";
constexpr char GetStepperStepPositionCommand[] = "GETSTEPPOS";

constexpr char Enabled[] = "ENABLED";
constexpr char Disabled[] = "DISABLED";

// Response codes
constexpr char ConnectedResponse[] = "CONNECTED";
constexpr char CalibrationResponse[] = "[CALIBRATION];";
constexpr char StepsPositionResponse[] = "[STEPS_POSITION];";
constexpr char InfoResponse[] = "[INFO];";

// Error codes
constexpr char CommandFormatError[] = "C001"; // Command was not properly formatted
constexpr char CommandNotDefined[] = "C002";
constexpr char InvalidStepper[] = "I001";
constexpr char InvalidState[] = "I002"; // Invalid state for stepper

// Ranges
constexpr int AccelerationUpperRange = 1000; // TODO: check actual upper ranges
constexpr int VelocityUpperRange = 2000;     // TODO: check actual upper ranges

// Define stepper motor connections and motor interface type. 
// TODO: map pins correctly
constexpr int J1stepPin = 26; // E0-STEP
constexpr int J1dirPin = 28;  // E0-DIR
constexpr int J1enablePin = 24; // E0-EN

constexpr int J2stepPin = 36; // E1-STEP
constexpr int J2dirPin = 34;  // E1-DIR
constexpr int J2enablePin = 30; // E1-EN

constexpr int J3stepPin = 54; // X-STEP
constexpr int J3dirPin = 55;  // X-DIR
constexpr int J3enablePin = 38; // X-EN

constexpr int J4stepPin = 60; // Y-STEP
constexpr int J4dirPin = 61;  // Y-DIR
constexpr int J4enablePin = 56; // Y-EN

constexpr int J5stepPin = 10;
constexpr int J5dirPin = 11;
constexpr int J5enablePin = 24;

constexpr int J6stepPin = 12;
constexpr int J6dirPin = 13;
constexpr int J6enablePin = 24;

// TODO: set correct pins
// Limit switch pin definitions
constexpr int J1limitPin = 2;
constexpr int J2limitPin = 3;
constexpr int J3limitPin = 4;
constexpr int J4limitPin = 5;
constexpr int J5limitPin = 6;
constexpr int J6limitPin = 7;

#endif
