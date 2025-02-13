import React, { createContext, useState, useContext, ReactNode } from "react";
import { checkSteppersState, getSteppersAngles, toggleStepperState } from "../api/commands";
import toast from "react-hot-toast";

interface StepperState {
  states: Record<number, boolean>; // Maps joint ID to state
  angles: Record<number, number | null>; // Maps joint ID to angles
  calibrated: Record<number, boolean>; // Tracks if stepper is calibrated
  setCalibrated: (jointId: number, calibrated: boolean) => void;
  setAngles: (jointId: number, angle: number | null) => void;
  setStates: (jointId: number, state: boolean) => void;
  fetchSteppersState: () => Promise<void>;
  fetchSteppersAngles: () => Promise<void>;
  resetStepperState: () => void;
  initializeSteppersInfo: () => Promise<void>;
  toggleStepper: (jointId: number) => Promise<void>;
}

const StepperContext = createContext<StepperState | undefined>(undefined);

export const useStepperContext = (): StepperState => {
  const context = useContext(StepperContext);
  if (!context) {
    throw new Error("useStepperContext must be used within a StepperProvider");
  }
  return context;
};

interface StepperProviderProps {
  children: ReactNode;
}

export const StepperProvider: React.FC<StepperProviderProps> = ({ children }) => {

  const [angles, setAngles] = useState<Record<number, number | null>>(
    Object.fromEntries([...Array(6)].map((_, i) => [i, null]))
  );

  const [calibrated, setCalibrated] = useState<Record<number, boolean>>(
    Object.fromEntries([...Array(6)].map((_, i) => [i, false]))
  );

  const [states, setStates] = useState<Record<number, boolean>>(
    Object.fromEntries([...Array(6)].map((_, i) => [i, false]))
  );

  const updateAngles = (jointId: number, newAngle: number | null) => {
    setAngles((prev) => ({ ...prev, [jointId]: newAngle }));
  };

  const updateCalibrated = (jointId: number, isCalibrated: boolean) => {
    setCalibrated((prev) => ({ ...prev, [jointId]: isCalibrated }));
  };

  const updateStates = (jointId: number, state: boolean) => {
    setStates((prev) => ({ ...prev, [jointId]: state }));
  };

  const fetchSteppersState = async () => {
    try {
      const data: boolean[] = await checkSteppersState();
      const stateRecord = Object.fromEntries(data.map((state, index) => [index, state]));
      setStates(stateRecord);
    } catch (error) {
      toast.error("Error fetching steppers state");
    }
  };

  const fetchSteppersAngles = async () => {
    try {
      const data: (number | null)[] = await getSteppersAngles();
      const anglesRecord = Object.fromEntries(data.map((angle, index) => [index, angle]));
      setAngles(anglesRecord);
    } catch (error) {
      toast.error("Error fetching steppers angles");
    }
  };

  const initializeSteppersInfo = async () => {
    await fetchSteppersState();
    await fetchSteppersAngles();
  };

  const toggleStepper = async (jointId: number) => {
    try {
      const newState = !states[jointId]; // Toggle current state
      setStates((prev) => ({ ...prev, [jointId]: newState })); // Optimistic UI update

      await toggleStepperState(jointId + 1, newState ? "ENABLED" : "DISABLED");
    } catch (error) {
      toast.error(`Failed to toggle stepper ${jointId + 1}`);
    }
  };

  const resetStepperState = () => {
    setStates(Object.fromEntries([...Array(6)].map((_, i) => [i, false])));
    setAngles(Object.fromEntries([...Array(6)].map((_, i) => [i, null])));
    setCalibrated(Object.fromEntries([...Array(6)].map((_, i) => [i, false])));
  };

  return (
    <StepperContext.Provider
      value={{
        angles,
        calibrated,
        states,
        setAngles: updateAngles,
        setCalibrated: updateCalibrated,
        setStates: updateStates,
        fetchSteppersState,
        fetchSteppersAngles,
        resetStepperState,
        initializeSteppersInfo,
        toggleStepper,
      }}
    >
      {children}
    </StepperContext.Provider>
  );
};
