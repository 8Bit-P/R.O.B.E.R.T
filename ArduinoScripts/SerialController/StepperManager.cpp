#include "StepperManager.h"
#include "Constants.h"

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
