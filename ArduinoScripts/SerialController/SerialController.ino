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
    // Serial.print("Commmand received: ");
    // Serial.println(command);
    processCommand(command);

    // Serial.print("J1LIMIT: ");
    // Serial.println(digitalRead(J1limitPin));
    // Serial.print("J2LIMIT: ");
    // Serial.println(digitalRead(J2limitPin));

    // delay(100);

    //TODO: periodically report position of steppers back
  }
}
