#ifndef STEPPER_MANAGER_H
#define STEPPER_MANAGER_H

#include "AccelStepper.h"

void initializeSteppers();
void toggleStepper(int stepperNum, bool enabled);
void moveStepper(int stepperNum, int steps);
void moveSteppers(int steps[]);
void setVelocity(int velocity);
void setAcceleration(int acceleration);
bool calibrateStepper(int stepper);
int getLimitSwitchPin(int stepperIndex);
void reportSteppersPositions();
int moveStepperPositiveSteps(int stepperNum);
void getSteppersState();
void getSteppersSteps();
void getStepperParameters();
void getSteppersCalibration();

AccelStepper* getStepperByIndex(int stepperIndex);

#endif
