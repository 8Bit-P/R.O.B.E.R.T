#include "AccelStepper.h"
#define motorInterfaceType 1 // Motor interface type must be set to 1 when using a driver

//Command codes
#define MoveCommand "MOVE"
#define CheckCommand "CHECK"

//Response codes
#define ConectedResponse "CONNECTED"

//Error codes
#define CommandFormatError "C001" // Command was not properly formated
#define CommandNotDefined "C002"
#define InvalidStepper "I001"

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


AccelStepper j1 = AccelStepper(motorInterfaceType, J1stepPin,J1dirPin);
AccelStepper j2 = AccelStepper(motorInterfaceType, J2stepPin,J2dirPin);
AccelStepper j3 = AccelStepper(motorInterfaceType, J3stepPin,J3dirPin);
AccelStepper j4 = AccelStepper(motorInterfaceType, J4stepPin,J4dirPin);
AccelStepper j5 = AccelStepper(motorInterfaceType, J5stepPin,J5dirPin);
AccelStepper j6 = AccelStepper(motorInterfaceType, J6stepPin,J6dirPin);

void initializeSteppers(){
  j1.setMaxSpeed(2000); j1.setAcceleration(1000);
  j2.setMaxSpeed(2000); j2.setAcceleration(1000);
  j3.setMaxSpeed(2000); j3.setAcceleration(1000);
  j4.setMaxSpeed(2000); j4.setAcceleration(1000);
  j5.setMaxSpeed(2000); j5.setAcceleration(1000);
  j6.setMaxSpeed(2000); j6.setAcceleration(1000);
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

      // Serial.println(joint);
      // Serial.println(steps);

      moveStepper(stepperNumber,steps);


      //Update String 
      actionLeft = actionLeft.substring(delimiterIndex+1);
  }
  
}

void moveStepper(int stepperNum, int steps) {

  Serial.println("Hasta aqui llega");

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

  // Set the target position relative to the current position
  stepper->move(steps);

  // Run to the target position
  while (stepper->distanceToGo() != 0) {
    stepper->run();
  }
}

void setup() {
  Serial.begin(9600);

  pinMode(J1enablePin , OUTPUT);
  digitalWrite(J1enablePin , LOW);
  
  // Set the maximum speed in steps per second:
  initializeSteppers();
}

void loop() {
  while(Serial.available()) {
    String command = Serial.readString();

    Serial.print("Commmand received: ");
    Serial.println(command);

    //Process String
    //1. Get command sent (Command type and action)

    int commandDelimiterIndex = command.indexOf('>');

    //Check if '>' is found in the string 
    if(commandDelimiterIndex != -1){
      String commandCode = command.substring(0,commandDelimiterIndex);
      String commandAction = command.substring(commandDelimiterIndex+1);

      //Perform proper action according to command 
      if(commandCode == MoveCommand) {
        processMoveCommand(commandAction);
      }
      else if (commandCode == CheckCommand) {
        //This sends a response to verify the Arduino is correctly connected through serial
        Serial.println(ConectedResponse);
      }
      else{
        Serial.println(CommandNotDefined);
      }

    }
    else{
      Serial.println(CommandFormatError);
    }

  }
}











