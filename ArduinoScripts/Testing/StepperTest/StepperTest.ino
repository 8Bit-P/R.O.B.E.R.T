// Include the AccelStepper library:
#include "AccelStepper.h"

// Define stepper motor connections and motor interface type. 
// Motor interface type must be set to 1 when using a driver
#define dirPin 7
#define stepPin 8
#define motorInterfaceType 1

// Create a new instance of the AccelStepper class:
AccelStepper stepper = AccelStepper(motorInterfaceType, stepPin, dirPin);

void setup() {
  // Set the maximum speed in steps per second:
  stepper.setMaxSpeed(2000);
}

void loop() {
  // Set the speed in steps per second:
  stepper.setSpeed(200);
  // Step the motor with a constant speed as set by setSpeed():
  stepper.runSpeed();
}