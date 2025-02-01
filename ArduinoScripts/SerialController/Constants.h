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
//Error codes
#define CommandFormatError "C001" // Command was not properly formated
#define CommandNotDefined "C002" // Given command is not defined
#define InvalidStepper "I001" // Invalid stepper selected
#define InvalidState "I002" //Invalid state for stepper

// Ranges
constexpr int AccelerationUpperRange = 1000; // TODO: check actual upper ranges
constexpr int VelocityUpperRange = 2000;     // TODO: check actual upper ranges

// Define stepper motor connections and motor interface type. 
#define J1stepPin 45 //TB6600 STEP
#define J1dirPin 47 //TB6600 DIR
#define J1enablePin 32 //TB6600 ENABLE
#define J1limitPin 19  //Z-MAX

#define J2stepPin 26 //E0-STEP
#define J2dirPin 28 //E0-DIR
#define J2enablePin 24 // E0-EN
#define J2limitPin 2 //X-MAX

#define J3stepPin 36 //E1-STEP
#define J3dirPin 34 //E1-DIR
#define J3enablePin 30 // E1-EN
#define J3limitPin 18 //Z-MIN

#define J4stepPin 54 //X-STEP
#define J4dirPin 55 //X-DIR
#define J4enablePin 38 //X-EN
#define J4limitPin 5 //X-MIN 

#define J5stepPin 60 //Y-STEP
#define J5dirPin 61 //Y-DIR
#define J5enablePin 56 //Y-EN 
#define J5limitPin 14 //Y-MIN

#define J6stepPin 12 //Z-STEP
#define J6dirPin 13 //Z-DIR
#define J6enablePin 24 //Z-EN
#define J6limitPin 15 //Y-MAX    

#endif
