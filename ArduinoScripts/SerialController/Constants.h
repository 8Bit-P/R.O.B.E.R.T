#ifndef CONSTANTS_H
#define CONSTANTS_H

#define motorInterfaceType 1 // Motor interface type must be set to 1 when using a driver

//Command codes
#define MoveCommand "MOVE"
#define CheckCommand "CHECK"
#define SetVelocityCommand "SETVEL"
#define SetAccelerationCommand "SETACC"
#define ToggleStepperCommand "TOGGLE"

#define Enabled "ENABLED"
#define Disabled "DISABLED"
//Response codes
#define ConectedResponse "CONNECTED"

//Error codes
#define CommandFormatError "C001" // Command was not properly formated
#define CommandNotDefined "C002"
#define InvalidStepper "I001"
#define InvalidState "I002"

//Ranges
#define AccelerationUpperRange = 1000 //TODO: check actual upper ranges
#define VelocityUpperRange = 2000     //TODO: check actual upper ranges

// Define stepper motor connections and motor interface type. 
//TODO: map pins correctly
#define J1stepPin 26 //E0-STEP
#define J1dirPin 28 // E0-DIR 
#define J1enablePin 24 // E0-EN

#define J2stepPin 36 //E1-STEP
#define J2dirPin 34 //E1-DIR
#define J2enablePin 30 // E1-EN

#define J3stepPin 54 // X-STEP
#define J3dirPin 55 // X-DIR
#define J3enablePin 38 // X-EN

#define J4stepPin 60 // Y-STEP
#define J4dirPin 61 // Y-DIR
#define J4enablePin 56 // Y-EN

#define J5stepPin 10
#define J5dirPin 11
#define J5enablePin 24 // 

#define J6stepPin 12
#define J6dirPin 13
#define J6enablePin 24 // 

#endif
