#include "StepperManager.h"
#include "Constants.h"

AccelStepper steppers[6] = {
  AccelStepper(motorInterfaceType, J1stepPin, J1dirPin),
  AccelStepper(motorInterfaceType, J2stepPin, J2dirPin),
  AccelStepper(motorInterfaceType, J3stepPin, J3dirPin),
  AccelStepper(motorInterfaceType, J4stepPin, J4dirPin),
  AccelStepper(motorInterfaceType, J5stepPin, J5dirPin),
  AccelStepper(motorInterfaceType, J6stepPin, J6dirPin)
};

// Enable pins for each motor
const int enablePins[6] = { J1enablePin, J2enablePin, J3enablePin, J4enablePin, J5enablePin, J6enablePin };

// Limit switch pins for each motor
const int limitPins[6] = { J1limitPin, J2limitPin, J3limitPin, J4limitPin, J5limitPin, J6limitPin };

// Track if joints have been calibrated
bool isCalibrated[6] = { false, false, false, false, false, false };

void initializeSteppers() {
  for (int i = 0; i < 6; i++) {
    // Set max speed and acceleration
    steppers[i].setMaxSpeed(200);
    steppers[i].setAcceleration(200);

    // Configure enable pins
    pinMode(enablePins[i], OUTPUT);
    digitalWrite(enablePins[i], LOW);  // Enable all steppers by default

    // Configure limit switch pins
    pinMode(limitPins[i], INPUT_PULLUP);
  }

  //Stepper controlled by TB6600 has inverse behaviour on enable pin
  digitalWrite(enablePins[0], HIGH);
}

AccelStepper* getStepperByIndex(int stepperIndex) {
  if (stepperIndex < 1 || stepperIndex > 6) {
    Serial.println(InvalidStepper);
    return nullptr;
  }
  return &steppers[stepperIndex - 1];  // Convert to zero-based index
}

//Returns whether a stepper moves on positive steps towards the limit switch or away from it
int moveStepperPositiveSteps(int stepperNum) {
  switch (stepperNum) {
    case 1:
      return J1PositiveToLimit;
      break;
    case 2:
      return J2PositiveToLimit;
      break;
    case 3:
      return J3PositiveToLimit;
      break;
    case 4:
      return J4PositiveToLimit;
      break;
    case 5:
      return J5PositiveToLimit;
      break;
    case 6:
      return J6PositiveToLimit;
      break;
  }

  return -1;
}

int getLimitSwitchPin(int stepperIndex) {
  if (stepperIndex < 1 || stepperIndex > 6) {
    Serial.println(InvalidStepper);
    return -1;
  }
  return limitPins[stepperIndex - 1];
}

void toggleStepper(int stepperNum, bool enabled) {
  if (stepperNum < 1 || stepperNum > 6) {
    Serial.println(InvalidStepper);
    return;
  }

  int enablePin = enablePins[stepperNum - 1];

  if (stepperNum == 1) digitalWrite(enablePin, enabled ? HIGH : LOW);  // HIGH to enable, LOW to disable (only on stepper J1 tb6600)
  else digitalWrite(enablePin, enabled ? LOW : HIGH);                  // LOW to enable, HIGH to disable
}


void moveStepper(int stepperNum, int steps) {

  AccelStepper* stepper = getStepperByIndex(stepperNum);
  int limitPin = getLimitSwitchPin(stepperNum);
  if (limitPin == -1) return;  // Invalid stepper

  int positiveToLimitSwitch = moveStepperPositiveSteps(stepperNum);

  Serial.print("Moving stepper: J");
  Serial.print(stepperNum);
  Serial.print(" ");
  Serial.print(steps);
  Serial.println(" steps");

  // Set the target position relative to the current position
  stepper->move(steps);

  // Run to the target position unless limit switch is triggered
  while (stepper->distanceToGo() != 0) {
    //if going in limit switch direction
    if (positiveToLimitSwitch == 1 && steps > 0 || positiveToLimitSwitch == 0 && steps < 0) {
      if (digitalRead(limitPin) == LOW) {
        stepper->stop();                      // Stop movement
        stepper->setCurrentPosition(0);       // Optionally reset position
        isCalibrated[stepperNum - 1] = true;  // Set as calibrated since we have reached home position
        break;
      }
    }
    stepper->run();
  }
}

void moveSteppers(int steps[]) {
  const int MAX_STEPPERS = 6;  // Number of steppers
  AccelStepper* steppers[MAX_STEPPERS];

  // Assign each stepper pointer
  for (int i = 0; i < MAX_STEPPERS; i++) {
    steppers[i] = getStepperByIndex(i + 1);
    if (steppers[i] != nullptr && steps[i] != 0) {
      steppers[i]->move(steps[i]);  // Set movement target
    }
  }

  String moveSteppersResponse = String(InfoResponse) + "MOVING_STEPS:";

  for (int s = 0; s < MAX_STEPPERS; s++) {
    if (steps[s] != 0) {
      moveSteppersResponse += "J" + String(s + 1) + "_" + String(steps[s]) + " ";
    }
  }

  Serial.println(moveSteppersResponse);

  bool anyStepperMoving;
  do {
    anyStepperMoving = false;
    for (int i = 0; i < MAX_STEPPERS; i++) {
      if (steppers[i] != nullptr && steppers[i]->distanceToGo() != 0) {
        int limitPin = getLimitSwitchPin(i + 1);
        int positiveToLimitSwitch = moveStepperPositiveSteps(i + 1);

        // Check for limit switch
        if (limitPin != -1 && ((positiveToLimitSwitch == 1 && steps[i] > 0) || (positiveToLimitSwitch == 0 && steps[i] < 0))) {

          if (digitalRead(limitPin) == LOW) {
            steppers[i]->stop();
            steppers[i]->setCurrentPosition(0);
            isCalibrated[i] = true;
            continue;
          }
        }

        steppers[i]->run();
        anyStepperMoving = true;
      }
    }
  } while (anyStepperMoving);  // Continue running until all steppers finish
}

bool calibrateStepper(int stepperNum) {
  int limitPin = getLimitSwitchPin(stepperNum);
  if (limitPin == -1) {
    Serial.println(InvalidLimitSwitchConversion);
    return;  // Invalid stepper
  }

  AccelStepper* stepper = getStepperByIndex(stepperNum);

  // Move the stepper slowly towards the limit switch
  stepper->setMaxSpeed(200);
  stepper->setAcceleration(100);

  int positiveToLimitSwitch = moveStepperPositiveSteps(stepperNum);
  if (positiveToLimitSwitch == 1) stepper->move(100000);
  else if (positiveToLimitSwitch == 0) stepper->move(-100000);
  else {
    Serial.println(InvalidLimitSwitchConversion);
    return;
  }

  unsigned long startTime = millis();  // Start time for timeout
  const unsigned long timeout = CalibrationTimeout;

  while (digitalRead(limitPin) == HIGH) {
    stepper->run();

    // Check if we've exceeded the timeout
    if (millis() - startTime > timeout) {
      stepper->stop();  // Stop the motor
      Serial.println(CalibrationResponse);
      return false;
    }
  }

  // Stop the motor when the limit switch is reached
  stepper->stop();

  // Set the current position as zero (home position)
  stepper->setCurrentPosition(0);
  isCalibrated[stepperNum - 1] = true;  // Set stepper as calibrated

  return true;
}


void setAcceleration(int acceleration) {
  //Set acceleration command should have the format -> SETACC>ACCELERATION_VALUE;
  for (int i = 0; i < 6; i++) {
    steppers[i].setAcceleration(acceleration);
  }

  Serial.print("Acceleration Set to: ");
  Serial.println(acceleration);
}

void setVelocity(int velocity) {
  //Set velocity command should have the format -> SETVEL>ACCELERATION_VALUE;
  for (int i = 0; i < 6; i++) {
    steppers[i].setMaxSpeed(velocity);
  }
  Serial.print("Velocity set to: ");
  Serial.println(velocity);
}

void getSteppersState() {
  String steppersState = SteppersStateResponse;

  for (int i = 0; i < 6; i++) {
    int enablePin = enablePins[i];
    bool isEnabled = (digitalRead(enablePin) == LOW);

    if (i == 0)
      steppersState += "J" + String(i + 1) + (isEnabled ? "_DISABLED" : "_ENABLED");
    else
      steppersState += "J" + String(i + 1) + (isEnabled ? "_ENABLED" : "_DISABLED");

    steppersState += ";";
  }

  Serial.println(steppersState);
}

void getSteppersSteps() {

  String steppersSteps = SteppersStepsResponse;

  for (int i = 0; i < 6; i++) {
    AccelStepper* stepper = &steppers[i];
    long currentPosition = stepper->currentPosition();

    if (!isCalibrated[i]) {
      steppersSteps += "J" + String(i + 1) + "_UNKNOWN";
    } else {
      steppersSteps += "J" + String(i + 1) + "_" + String(currentPosition);
    }

    steppersSteps += ";";
  }

  Serial.println(steppersSteps);
}

void getStepperParameters() {
  String steppersState = SteppersParamsResponse;

  // Assuming all steppers share the same velocity and acceleration, we can use any stepper to fetch these values
  // Here we use the first stepper to fetch the velocity and acceleration
  int velocity = steppers[0].maxSpeed();
  int acceleration = steppers[0].acceleration();

  // Format the response with the current velocity and acceleration
  steppersState += "VEL_" + String(velocity) + ";";
  steppersState += "ACC_" + String(acceleration) + ";";

  // Print the response
  Serial.println(steppersState);
}

void getSteppersCalibration() {
  String steppersState = CalibrationResponse;

  // Loop through the isCalibrated array and append calibration status to the response string
  for (int i = 0; i < 6; i++) {
    steppersState += "J" + String(i + 1) + "_" + String(isCalibrated[i] ? 1 : 0) + ";";
  }

  // Print the final response string
  Serial.println(steppersState);
}
