#include "CommandProcessor.h"
#include "StepperManager.h"
#include "Constants.h"


void processCommand(String command){

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
          //TODO: change velocity scale to match library specification
          setVelocity(atoi(commandAction.c_str()));
          break;

        case SETACC:
         //TODO: change acceleration scale to match library specification
          setAcceleration(atoi(commandAction.c_str()));
          break;

        case TOGGLE:
          processToggleCommand(commandAction);
          break;

        case CALIBRATE:
          processCalibrateCommand(commandAction);
          break;

        default:
          Serial.println(CommandNotDefined);
          break;
      }
    }
}

CommandCode getCommandCode(const String& command) {
    if (command == MoveCommand) return MOVE;
    if (command == CheckCommand) return CHECK;
    if (command == SetVelocityCommand) return SETVEL;
    if (command == SetAccelerationCommand) return SETACC;
    if (command == ToggleStepperCommand) return TOGGLE;
    if (command == CalibrateStepperCommand) return CALIBRATE;
    return UNKNOWN;
}

void processMoveCommand(String actionString){

  String actionLeft = actionString;

  //Move Command actions should have the format -> MOVE>JOINT_NSTEPS;
  while(actionLeft.indexOf(";") != -1) {
      int delimiterIndex = actionLeft.indexOf(";");

      String currentAction = actionLeft.substring(0,delimiterIndex);

      //Get joint
      int jointDelimiter = currentAction.indexOf("_");
      String joint = currentAction.substring(0,jointDelimiter);
      int stepperNumber = atoi(joint.substring(1).c_str());
      //Get number of steps
      int steps = atoi(currentAction.substring(jointDelimiter+1).c_str());

      moveStepper(stepperNumber,steps);
      //Update String 
      actionLeft = actionLeft.substring(delimiterIndex+1);
  }
  
}

void processToggleCommand(String actionString){
  //Toggle command actions should have the format -> TOGGLE>JOINT_STATE;
  String actionLeft = actionString;

  //Iterate through the provided steppers
  while(actionLeft.indexOf(";") != -1) {
      int delimiterIndex = actionLeft.indexOf(";");

      String currentAction = actionLeft.substring(0,delimiterIndex);

      //Get joint
      int jointDelimiter = currentAction.indexOf("_");
      String joint = currentAction.substring(0,jointDelimiter);
      int stepperNumber = atoi(joint.substring(1).c_str());
      //Get State
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

void processCalibrateCommand(String actionString){
  //Toggle command actions should have the format -> CALIBRATE>JOINT;
  String actionLeft = actionString;

  //Iterate through the provided steppers
  while(actionLeft.indexOf(";") != -1) {
      int delimiterIndex = actionLeft.indexOf(";");

      String currentAction = actionLeft.substring(0,delimiterIndex);

      //Get joint
      int jointDelimiter = currentAction.indexOf("_");
      String joint = currentAction.substring(0,jointDelimiter);
      int stepperNumber = atoi(joint.substring(1).c_str());

      calibrateStepper(stepperNumber);

      Serial.print("Stepper: J"); Serial.print(stepperNumber); Serial.print(" Calibrated");

      //Update String 
      actionLeft = actionLeft.substring(delimiterIndex+1);
  }
}