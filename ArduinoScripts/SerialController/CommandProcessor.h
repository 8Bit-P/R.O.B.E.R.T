#ifndef COMMAND_PROCESSOR_H
#define COMMAND_PROCESSOR_H

#include <Arduino.h> // Include the Arduino framework

enum CommandCode {
    MOVE,
    CHECK,
    SETVEL,
    SETACC,
    TOGGLE,
    CALIBRATE,
    STATE,
    STEPS,
    PARAMS,
    CALSTATE,
    UNKNOWN
};


CommandCode getCommandCode(const String& command);
void processCommand(String command);
void processToggleCommand(String actionString);
void processMoveCommand(String actionString);
void processCalibrateCommand(String actionString);

#endif
