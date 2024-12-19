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
        steppers[i].setMaxSpeed(2000);
        steppers[i].setAcceleration(1000);

        // Configure enable pins
        pinMode(enablePins[i], OUTPUT);
        digitalWrite(enablePins[i], LOW); // Enable all steppers by default

        // Configure limit switch pins
        pinMode(limitPins[i], INPUT_PULLUP);
    }

    Serial.print(InfoResponse);Serial.println("Steppers initialized.");
}

AccelStepper* getStepperByIndex(int stepperIndex) {
    if (stepperIndex < 1 || stepperIndex > 6) {
        Serial.println(InvalidStepper);
        return nullptr;
    }
    return &steppers[stepperIndex - 1]; // Convert to zero-based index
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
    digitalWrite(enablePin, enabled ? LOW : HIGH); // LOW to enable, HIGH to disable
}


void moveStepper(int stepperNum, int steps) {

  AccelStepper* stepper = getStepperByIndex(stepperNum);

  Serial.print("Moving stepper: J"); Serial.print(stepperNum);
  Serial.print(" "); Serial.print(steps); Serial.println(" steps");

  // Set the target position relative to the current position
  stepper->move(steps);

  // Run to the target position
  while (stepper->distanceToGo() != 0) {
    stepper->run();
  }
}

void calibrateStepper(int stepperNum) {

    int limitPin = getLimitSwitchPin(stepperNum);
    if (limitPin == -1) return; // Invalid stepper

    AccelStepper* stepper = getStepperByIndex(stepperNum);

    Serial.print("Calibrating Stepper J");
    Serial.println(stepperNum);

    // Move the stepper slowly towards the limit switch
    stepper->setMaxSpeed(200); // Slow speed for calibration
    stepper->setAcceleration(100);

    stepper->move(-100000); // Move a large negative distance

    //TODO: REMOVE COMMENTS AND TEST
    // while (digitalRead(limitPin) == HIGH) {
    //     stepper->run();
    // }

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
