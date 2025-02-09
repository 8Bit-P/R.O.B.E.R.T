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

void initializeSteppers() {
    for (int i = 0; i < 6; i++) {
        // Set max speed and acceleration
        steppers[i].setMaxSpeed(200);
        steppers[i].setAcceleration(200);

        // Configure enable pins
        pinMode(enablePins[i], OUTPUT);
        digitalWrite(enablePins[i], LOW); // Enable all steppers by default

        // Configure limit switch pins
        pinMode(limitPins[i], INPUT_PULLUP);
    }

    //Stepper controlled by TB6600 has inverse behaviour on enable pin
    digitalWrite(enablePins[0], HIGH);

    //TODO: see if need to keep it
    //Serial.print(InfoResponse);Serial.println("Steppers initialized.");
}

AccelStepper* getStepperByIndex(int stepperIndex) {
    if (stepperIndex < 1 || stepperIndex > 6) {
        Serial.println(InvalidStepper);
        return nullptr;
    }
    return &steppers[stepperIndex - 1]; // Convert to zero-based index
}

//Returns whether a stepper moves on positive steps towards the limit switch or away from it
int moveStepperPositiveSteps(int stepperNum){
  switch(stepperNum){
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

    if(stepperNum == 1) digitalWrite(enablePin, enabled ? HIGH : LOW); // HIGH to enable, LOW to disable (only on stepper 1 tb6600)
    else digitalWrite(enablePin, enabled ? LOW : HIGH); // LOW to enable, HIGH to disable 
    
}


void moveStepper(int stepperNum, int steps) {
    
    AccelStepper* stepper = getStepperByIndex(stepperNum);
    int limitPin = getLimitSwitchPin(stepperNum);
    if (limitPin == -1) return; // Invalid stepper

    int positiveToLimitSwitch = moveStepperPositiveSteps(stepperNum);

    Serial.print("Moving stepper: J"); Serial.print(stepperNum);
    Serial.print(" "); Serial.print(steps); Serial.println(" steps");

    // Set the target position relative to the current position
    stepper->move(steps);

    // Run to the target position unless limit switch is triggered
    while (stepper->distanceToGo() != 0) {
        //if going in limit switch direction 
        if(positiveToLimitSwitch == 1 && steps > 0 || positiveToLimitSwitch == 0 && steps < 0){
          if (digitalRead(limitPin) == LOW) {
              Serial.print("Limit switch triggered! Stopping stepper ");
              Serial.print("J");Serial.println(stepperNum);
              stepper->stop(); // Stop movement
              stepper->setCurrentPosition(0); // Optionally reset position
              break;
          }
        }
        stepper->run();
    }
}

void calibrateStepper(int stepperNum) {

    int limitPin = getLimitSwitchPin(stepperNum);
    if (limitPin == -1) {
      Serial.println(InvalidLimitSwitchConversion);
      return; // Invalid stepper
    }

    AccelStepper* stepper = getStepperByIndex(stepperNum);

    Serial.print("Calibrating Stepper J");
    Serial.println(stepperNum);

    // Move the stepper slowly towards the limit switch
    stepper->setMaxSpeed(200); // Slow speed for calibration
    stepper->setAcceleration(100);

    int positiveToLimitSwitch = moveStepperPositiveSteps(stepperNum);
    // Move a large positive distance TODO: check positive or negative direction
    if(positiveToLimitSwitch == 1) stepper->move(100000);
    else if(positiveToLimitSwitch == 0) stepper->move(-100000);
    else{
      Serial.println(InvalidLimitSwitchConversion);
      return;
    }

    while (digitalRead(limitPin) == HIGH) {
        stepper->run();
    }

    // Stop the motor when the limit switch is reached
    stepper->stop();

    // Set the current position as zero (home position)
    stepper->setCurrentPosition(0);

    Serial.print(CalibrationResponse);
    Serial.print("Stepper J");Serial.print(stepperNum);
    Serial.println(" calibrated to home position.");
}

void setAcceleration(int acceleration){
    //Set acceleration command should have the format -> SETACC>ACCELERATION_VALUE;
    for (int i = 0; i < 6; i++) {
        steppers[i].setAcceleration(acceleration);
    }

    Serial.print("Acceleration Set to: "); Serial.println(acceleration);
}

void setVelocity(int velocity) {
  //Set velocity command should have the format -> SETVEL>ACCELERATION_VALUE;
    for (int i = 0; i < 6; i++) {
        steppers[i].setMaxSpeed(velocity);
    }
    Serial.print("Velocity set to: "); Serial.println(velocity);
}

//TODO:
void reportSteppersPositions(){
  Serial.print(StepsPositionResponse);Serial.println("Random string");
}
