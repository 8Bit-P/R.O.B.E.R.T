#include "StepperManager.h"
#include "CommandProcessor.h"
#include "Constants.h"

void setup() {
  Serial.begin(115200);
  // Set the maximum speed in steps per second:
  initializeSteppers();
}

void loop() {
  while(Serial.available()) {
    String command = Serial.readStringUntil('~');
    //TODO: remove comments
    // Serial.print("Commmand received: ");
    // Serial.println(command);
    processCommand(command);
  }
}
