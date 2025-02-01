#ifndef CONSTANTS_H
#define CONSTANTS_H

#define motorInterfaceType 1 // Motor interface type must be set to 1 when using a driver

//Command codes
#define MoveCommand "MOVE"
#define CheckCommand "CHECK"
#define SetVelocityCommand "SETVEL"
#define SetAccelerationCommand "SETACC"
#define ToggleStepperCommand "TOGGLE"
#define CalibrateStepperCommand "CALIBRATE"
#define GetStepperStepPositionCommand "GETSTEPPOS"

#define Enabled "ENABLED"
#define Disabled "DISABLED"
//Response codes
#define ConnectedResponse "CONNECTED"
#define CalibrationResponse "[CALIBRATION];"
#define StepsPositionResponse "[STEPS_POSITION];"

//Error codes
#define CommandFormatError "C001" // Command was not properly formated
#define CommandNotDefined "C002" // Given command is not defined
#define InvalidStepper "I001" // Invalid stepper selected
#define InvalidState "I002" //Invalid state for stepper

//Ranges
#define AccelerationUpperRange = 1000 //TODO: check actual upper ranges
#define VelocityUpperRange = 2000     //TODO: check actual upper ranges

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
