#include "AccelStepper.h"
#define motorInterfaceType 1 // Motor interface type must be set to 1 when using a driver

// Define stepper motor connections and motor interface type. 
//TODO: map pins correctly
#define J1dirPin 7
#define J1stepPin 8

#define J2dirPin 7
#define J2stepPin 8

#define J3dirPin 7
#define J3stepPin 8

#define J4dirPin 7
#define J4stepPin 8

#define J5dirPin 7
#define J5stepPin 8

#define J6dirPin 7
#define J6stepPin 8


AccelStepper j1 = AccelStepper(motorInterfaceType, J1dirPin, J1stepPin);
AccelStepper j2 = AccelStepper(motorInterfaceType, J2dirPin, J2stepPin);
AccelStepper j3 = AccelStepper(motorInterfaceType, J3dirPin, J3stepPin);
AccelStepper j4 = AccelStepper(motorInterfaceType, J4dirPin, J4stepPin);
AccelStepper j5 = AccelStepper(motorInterfaceType, J5dirPin, J5stepPin);
AccelStepper j6 = AccelStepper(motorInterfaceType, J6dirPin, J6stepPin);

void initializeSteppers(){
  j1.setMaxSpeed(2000);
  j2.setMaxSpeed(2000);
  j3.setMaxSpeed(2000);
  j4.setMaxSpeed(2000);
  j5.setMaxSpeed(2000);
  j6.setMaxSpeed(2000);
}

void setup() {
  Serial.begin(9600);
  // Set the maximum speed in steps per second:
  initializeSteppers();
}

void loop() {
  while(Serial.available()) {
    String a = Serial.readString();
    Serial.println(a);
  }
}