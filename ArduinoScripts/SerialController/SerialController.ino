#include "AccelStepper.h"
#include "StepperManager.h"
#include "CommandProcessor.h"

void setup() {
  Serial.begin(115200);
  // Set the maximum speed in steps per second:
  initializeSteppers();
}

void loop() {
  while(Serial.available()) {
    String command = Serial.readStringUntil('~');
    // Serial.print("Commmand received: ");
    // Serial.println(command);
    processCommand(command);

    //TODO: periodically report position of steppers back
  }
}
