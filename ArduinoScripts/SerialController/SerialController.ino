#include "AccelStepper.h"
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

enum CommandCode {
  MOVE,
  CHECK,
  SETVEL,
  SETACC,
  TOGGLE,
  UNKNOWN
};


AccelStepper j1 = AccelStepper(motorInterfaceType, J1stepPin, J1dirPin);
AccelStepper j2 = AccelStepper(motorInterfaceType, J2stepPin, J2dirPin);
AccelStepper j3 = AccelStepper(motorInterfaceType, J3stepPin, J3dirPin);
AccelStepper j4 = AccelStepper(motorInterfaceType, J4stepPin, J4dirPin);
AccelStepper j5 = AccelStepper(motorInterfaceType, J5stepPin, J5dirPin);
AccelStepper j6 = AccelStepper(motorInterfaceType, J6stepPin, J6dirPin);

void initializeSteppers(){
  j1.setMaxSpeed(2000); j1.setAcceleration(1000);
  j2.setMaxSpeed(2000); j2.setAcceleration(1000);
  j3.setMaxSpeed(2000); j3.setAcceleration(1000);
  j4.setMaxSpeed(2000); j4.setAcceleration(1000);
  j5.setMaxSpeed(2000); j5.setAcceleration(1000);
  j6.setMaxSpeed(2000); j6.setAcceleration(1000);

  pinMode(J1enablePin , OUTPUT); digitalWrite(J1enablePin , LOW);
  pinMode(J2enablePin , OUTPUT); digitalWrite(J2enablePin , LOW);
  pinMode(J3enablePin , OUTPUT); digitalWrite(J3enablePin , LOW);
  pinMode(J4enablePin , OUTPUT); digitalWrite(J4enablePin , LOW);
  pinMode(J5enablePin , OUTPUT); digitalWrite(J5enablePin , LOW);
  pinMode(J6enablePin , OUTPUT); digitalWrite(J6enablePin , LOW);
}

void processMoveCommand(String actionString){

  String actionLeft = actionString;

  //Move Command actions should have the format -> MOVE>JOINT_NSTEPS;
  while(actionLeft.indexOf(";") != -1) {
      int delimiterIndex = actionLeft.indexOf(";");

      String currentAction = actionLeft.substring(0,delimiterIndex);

      //Apply current action

      //Get joint
      int jointDelimiter = currentAction.indexOf("_");
      String joint = currentAction.substring(0,jointDelimiter);
      int stepperNumber = atoi(joint.substring(1).c_str());
      int steps = atoi(currentAction.substring(jointDelimiter+1).c_str());

      moveStepper(stepperNumber,steps);

      //Update String 
      actionLeft = actionLeft.substring(delimiterIndex+1);
  }
  
}

void processToggleCommand(String actionString){
  //Toggle command actions should have the format -> TOGGLE>JOINT_STATE;
  String actionLeft = actionString;

  while(actionLeft.indexOf(";") != -1) {
      int delimiterIndex = actionLeft.indexOf(";");

      String currentAction = actionLeft.substring(0,delimiterIndex);

      //Apply current action

      //Get joint
      int jointDelimiter = currentAction.indexOf("_");
      String joint = currentAction.substring(0,jointDelimiter);
      int stepperNumber = atoi(joint.substring(1).c_str());
      
      String stateStr = currentAction.substring(jointDelimiter+1);
      bool state;

      if(stateStr == Enabled){
        state = true;
      }
      else if(stateStr == Disabled){
        state = false;
      }
      else{
        Serial.println(InvalidState);
        return;
      }

      toggleStepper(stepperNumber, state);

      Serial.print("Stepper: J"); Serial.print(stepperNumber); Serial.print(" "); Serial.println(stateStr);

      //Update String 
      actionLeft = actionLeft.substring(delimiterIndex+1);
  }
}

void toggleStepper(int stepperNum, bool enabled){
    if(stepperNum <= 0 || stepperNum > 6) Serial.println(InvalidStepper);

    digitalWrite(J6enablePin , enabled ? LOW : HIGH);
}

void moveStepper(int stepperNum, int steps) {

  AccelStepper* stepper;

  // Select the stepper motor
  switch (stepperNum) {
    case 1:
      stepper = &j1;
      break;
    case 2:
      stepper = &j2;
      break;
    case 3:
      stepper = &j3;
      break;
    case 4:
      stepper = &j4;
      break;
    case 5:
      stepper = &j5;
      break;
    case 6:
      stepper = &j6;
      break;
    default:
      Serial.println(InvalidStepper);
      return;
  }

  Serial.print("Moving stepper: J"); Serial.print(stepperNum);
  Serial.print(" "); Serial.print(steps); Serial.println(" steps");

  // Set the target position relative to the current position
  stepper->move(steps);

  // Run to the target position
  while (stepper->distanceToGo() != 0) {
    stepper->run();
  }
}

void setAcceleration(String actionString){

    //Set acceleration command should have the format -> SETACC>ACCELERATION_VALUE;

    int acceleration = atoi(actionString.c_str());

    j1.setAcceleration(acceleration);
    j2.setAcceleration(acceleration);
    j3.setAcceleration(acceleration);
    j4.setAcceleration(acceleration);
    j5.setAcceleration(acceleration);
    j6.setAcceleration(acceleration);

    Serial.print("Acceleration Set to: ");
    Serial.println(acceleration);
}

void setVelocity(String actionString){
    //Set velocity command should have the format -> SETVEL>VELOCITY_VALUE;
    int velocity = atoi(actionString.c_str());

    j1.setMaxSpeed(2000);
    j2.setMaxSpeed(2000);
    j3.setMaxSpeed(2000);
    j4.setMaxSpeed(2000);
    j5.setMaxSpeed(2000);
    j6.setMaxSpeed(2000);

    Serial.print("Velocity Set to: "); Serial.println(velocity);
}

CommandCode getCommandCode(const char* command) {
  if (strcmp(command, MoveCommand) == 0) {
    return MOVE;
  } else if (strcmp(command, CheckCommand) == 0) {
    return CHECK;
  } else if (strcmp(command, SetVelocityCommand) == 0) {
    return SETVEL;
  } else if (strcmp(command, SetAccelerationCommand) == 0) {
    return SETACC;
  } else if (strcmp(command, ToggleStepperCommand) == 0) {
    return TOGGLE;
  } else {
    return UNKNOWN;
  }
}

void setup() {
  Serial.begin(115200);

  
  
  // Set the maximum speed in steps per second:
  initializeSteppers();
}

void loop() {
  while(Serial.available()) {
    String command = Serial.readStringUntil('~');

    // Serial.print("Commmand received: ");
    // Serial.println(command);

    processCommand(command);
  }
}

void processCommand(String command){
//Process String
    //1. Get command sent (Command type and action)
    int commandDelimiterIndex = command.indexOf('>');

    //Check if '>' is found in the string 
    if(commandDelimiterIndex != -1){
      CommandCode commandCode = getCommandCode(command.substring(0,commandDelimiterIndex).c_str());
      String commandAction = command.substring(commandDelimiterIndex+1);

      //Perform proper action according to command 
      switch (commandCode) {
        case MOVE:
          processMoveCommand(commandAction);
          break;

        case CHECK:
          // This sends a response to verify the Arduino is correctly connected through serial
          Serial.println(ConectedResponse);
          break;

        case SETVEL:
          setVelocity(commandAction);
          break;

        case SETACC:
          setAcceleration(commandAction);
          break;

        case TOGGLE:
          processToggleCommand(commandAction);
          break;

        default:
          Serial.println(CommandNotDefined);
          break;
      }
    }
}











