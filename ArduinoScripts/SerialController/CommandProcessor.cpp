#include "CommandProcessor.h"
#include "StepperManager.h"
#include "Constants.h"


void processCommand(String command) {

  //1. Get command sent (Command type and action)
  int commandDelimiterIndex = command.indexOf('>');

  //Check if '>' is found in the string
  if (commandDelimiterIndex != -1) {
    CommandCode commandCode = getCommandCode(command.substring(0, commandDelimiterIndex).c_str());
    String commandAction = command.substring(commandDelimiterIndex + 1);

    //Perform proper action according to command
    switch (commandCode) {
      case MOVE:
        processMoveCommand(commandAction);
        break;

      case CHECK:
        // This sends a response to verify the Arduino is correctly connected through serial
        Serial.println(ConnectedResponse);
        break;

      case SETVEL:
        setVelocity(atoi(commandAction.c_str()));
        break;

      case SETACC:
        setAcceleration(atoi(commandAction.c_str()));
        break;

      case TOGGLE:
        processToggleCommand(commandAction);
        break;

      case CALIBRATE:
        processCalibrateCommand(commandAction);
        break;

      case STATE:
        getSteppersState();
        break;

      case STEPS:
        getSteppersSteps();
        break;
      
      case PARAMS:
        getStepperParameters();
        break;

      case CALSTATE:
        getSteppersCalibration();
        break;

      default:
        Serial.println(CommandNotDefined);
        break;
    }
  } else {
    Serial.println(CommandFormatError);
  }
}

CommandCode getCommandCode(const String& command) {
  if (command == MoveCommand) return MOVE;
  if (command == CheckCommand) return CHECK;
  if (command == SetVelocityCommand) return SETVEL;
  if (command == SetAccelerationCommand) return SETACC;
  if (command == ToggleStepperCommand) return TOGGLE;
  if (command == CalibrateStepperCommand) return CALIBRATE;
  if (command == SteppersStateCommand) return STATE;
  if (command == SteppersStepsCommand) return STEPS;
  if (command == GetParamsCommand) return PARAMS;
  if (command == GetCalibrationStateCommand) return CALSTATE;
  return UNKNOWN;
}

void processMoveCommand(String actionString) {
  String actionLeft = actionString;
  
  if (actionString.indexOf(";") == -1) {
    Serial.println(CommandFormatError);
    return;
  }

  const int MAX_STEPPERS = 6;  
  int steps[MAX_STEPPERS] = {0}; // Array to store step values for each stepper

  // Move Command actions should have the format -> MOVE>J1_-200;J2_300;
  while (actionLeft.indexOf(";") != -1) {
    int delimiterIndex = actionLeft.indexOf(";");
    String currentAction = actionLeft.substring(0, delimiterIndex);

    int jointDelimiter = currentAction.indexOf("_");
    if (jointDelimiter == -1) continue;

    String joint = currentAction.substring(0, jointDelimiter);
    int stepperNumber = atoi(joint.substring(1).c_str());

    int stepCount = atoi(currentAction.substring(jointDelimiter + 1).c_str());

    if (stepperNumber >= 1 && stepperNumber <= MAX_STEPPERS) {
      steps[stepperNumber - 1] = stepCount;  // Store step count for each stepper
    }

    // Update String
    actionLeft = actionLeft.substring(delimiterIndex + 1);
  }

  // Move all steppers simultaneously
  moveSteppers(steps);
}
void processToggleCommand(String actionString) {
  //Toggle command actions should have the format -> TOGGLE>JOINT_STATE;
  String actionLeft = actionString;

  if (actionString.indexOf(";") == -1) {
    Serial.println(CommandFormatError);
  }

  //Iterate through the provided steppers
  while (actionLeft.indexOf(";") != -1) {
    int delimiterIndex = actionLeft.indexOf(";");

    String currentAction = actionLeft.substring(0, delimiterIndex);

    //Get joint
    int jointDelimiter = currentAction.indexOf("_");
    String joint = currentAction.substring(0, jointDelimiter);
    int stepperNumber = atoi(joint.substring(1).c_str());
    //Get State
    String stateStr = currentAction.substring(jointDelimiter + 1);
    bool state;

    if (stateStr == Enabled) {
      state = true;
    } else if (stateStr == Disabled) {
      state = false;
    } else {
      Serial.println(InvalidState);
      return;
    }

    toggleStepper(stepperNumber, state);

    //TODO: take a look at this, maybe should be printed after the while
    Serial.print("Stepper: J");
    Serial.print(stepperNumber);
    Serial.print(" ");
    Serial.println(stateStr);

    //Update String
    actionLeft = actionLeft.substring(delimiterIndex + 1);
  }
}

void processCalibrateCommand(String actionString) {
  String actionLeft = actionString;
  String failedJoints = "";   // Track joints that failed calibration
  bool allSuccessful = true;  // Track overall success

  // Check if the action string contains semicolons
  if (actionLeft.indexOf(";") == -1) {
    Serial.println(CommandFormatError);
    return;
  }

  // Iterate through the provided steppers
  while (actionLeft.indexOf(";") != -1) {
    int delimiterIndex = actionLeft.indexOf(";");

    // Get joint string (e.g., "J1")
    String joint = actionLeft.substring(0, delimiterIndex);

    // Convert the joint to an integer, skipping the "J" character
    int stepperNumber = atoi(joint.substring(1).c_str());

    // Calibrate the stepper and check the result
    bool result = calibrateStepper(stepperNumber);
    if (!result) {
      failedJoints += joint + ";";  // Append failed joint
      allSuccessful = false;        // Mark that at least one failed
    }

    // Update actionLeft string to remove processed joint
    actionLeft = actionLeft.substring(delimiterIndex + 1);
  }

  Serial.print(CalibrationResponse);
  if (allSuccessful) {
    Serial.println("OK");
  } else {
    Serial.println(failedJoints);  // Return list of failed joints
  }
}
