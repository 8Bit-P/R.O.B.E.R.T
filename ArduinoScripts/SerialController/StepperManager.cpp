#include "StepperManager.h"
#include "Constants.h"

//Change this for an array
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

  //Enable all steppers by default
  pinMode(J1enablePin , OUTPUT); digitalWrite(J1enablePin , LOW);
  pinMode(J2enablePin , OUTPUT); digitalWrite(J2enablePin , LOW);
  pinMode(J3enablePin , OUTPUT); digitalWrite(J3enablePin , LOW);
  pinMode(J4enablePin , OUTPUT); digitalWrite(J4enablePin , LOW);
  pinMode(J5enablePin , OUTPUT); digitalWrite(J5enablePin , LOW);
  pinMode(J6enablePin , OUTPUT); digitalWrite(J6enablePin , LOW);

  // Configure limit switch pins
  pinMode(J1limitPin, INPUT_PULLUP);
  pinMode(J2limitPin, INPUT_PULLUP);
  pinMode(J3limitPin, INPUT_PULLUP);
  pinMode(J4limitPin, INPUT_PULLUP);
  pinMode(J5limitPin, INPUT_PULLUP);
  pinMode(J6limitPin, INPUT_PULLUP);
}

AccelStepper* getStepperByIndex(int stepperIndex) {
    AccelStepper* stepper = nullptr; // Initialize to null to ensure safety.

    // Select the stepper motor
    switch (stepperIndex) {
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
            break; 
    }

    return stepper;
}


int getLimitSwitchPin(int stepperIndex) {
    switch (stepperIndex) {
        case 1: return J1limitPin;
        case 2: return J2limitPin;
        case 3: return J3limitPin;
        case 4: return J4limitPin;
        case 5: return J5limitPin;
        case 6: return J6limitPin;
        default:
            Serial.println(InvalidStepper);
            return -1;
    }
}

void toggleStepper(int stepperNum, bool enabled){
    if(stepperNum <= 0 || stepperNum > 6) Serial.println(InvalidStepper);

    AccelStepper* stepper = getStepperByIndex(stepperNum);

    digitalWrite(stepper , enabled ? LOW : HIGH);
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
    AccelStepper* stepper = getStepperByIndex(stepperNum);

    int limitPin = getLimitSwitchPin(stepperNum);
    if (limitPin == -1) return; // Invalid stepper

    Serial.print("Calibrating Stepper J");
    Serial.println(stepperNum);

    // Move the stepper slowly towards the limit switch
    stepper->setMaxSpeed(200); // Slow speed for calibration
    stepper->setAcceleration(100);

    stepper->move(-100000); // Move a large negative distance

    while (digitalRead(limitPin) == HIGH) {
        stepper->run();
    }

    // Stop the motor when the limit switch is reached
    stepper->stop();

    // Set the current position as zero (home position)
    stepper->setCurrentPosition(0);

    Serial.print("Stepper J");Serial.print(stepperNum);
    Serial.println(" calibrated to home position.");
}

void setAcceleration(int acceleration){
    //Set acceleration command should have the format -> SETACC>ACCELERATION_VALUE;
    j1.setAcceleration(acceleration);
    j2.setAcceleration(acceleration);
    j3.setAcceleration(acceleration);
    j4.setAcceleration(acceleration);
    j5.setAcceleration(acceleration);
    j6.setAcceleration(acceleration);

    Serial.print("Acceleration Set to: "); Serial.println(acceleration);
}

void setVelocity(int velocity){
    //Set velocity command should have the format -> SETVEL>VELOCITY_VALUE;
    j1.setMaxSpeed(velocity);
    j2.setMaxSpeed(velocity);
    j3.setMaxSpeed(velocity);
    j4.setMaxSpeed(velocity);
    j5.setMaxSpeed(velocity);
    j6.setMaxSpeed(velocity);

    Serial.print("Velocity Set to: "); Serial.println(velocity);
}
