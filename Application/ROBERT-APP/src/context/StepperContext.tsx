import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
} from "react";
import { checkSteppersState, getSteppersAngles } from "../api/commands";
import toast from "react-hot-toast";

// Define types for stepper tracking
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
}

// Create context with undefined default
const StepperContext = createContext<StepperState | undefined>(undefined);

// Custom hook for using StepperContext
export const useStepperContext = (): StepperState => {
  const context = useContext(StepperContext);
  if (!context) {
    throw new Error("useStepperContext must be used within a StepperProvider");
  }
  return context;
};

// Define props for the provider
interface StepperProviderProps {
  children: ReactNode;
}

// Provider Component
export const StepperProvider: React.FC<StepperProviderProps> = ({
  children,
}) => {
  
  // Initialize all 6 angles to null
  const [angles, setAngles] = useState<Record<number, number | null>>(
    Object.fromEntries([...Array(6)].map((_, i) => [i, null]))
  );

  // Initialize all 6 calibrated states to false
  const [calibrated, setCalibrated] = useState<Record<number, boolean>>(
    Object.fromEntries([...Array(6)].map((_, i) => [i, false]))
  );

  // Initialize all 6 states to false
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

  // Function to fetch stepper state from backend
  const fetchSteppersState = async () => {
    try {
      const data: boolean[] = await checkSteppersState();
      
      // Convert array to record {0: true, 1: false, 2: true, ...}
      const stateRecord = Object.fromEntries(data.map((state, index) => [index, state]));

      setStates(stateRecord);
    } catch (error) {
      toast.error("Error fetching steppers state");
    }
  };

  // Function to fetch stepper angles from backend
  const fetchSteppersAngles = async () => {
    try {
      const data: (number | null)[] = await getSteppersAngles();
      
      // Convert array to record {0: 45.5, 1: null, 2: 90.0, ...}
      const anglesRecord = Object.fromEntries(data.map((angle, index) => [index, angle]));

      setAngles(anglesRecord);
    } catch (error) {
      toast.error("Error fetching steppers angles");
    }
  };

  const initializeSteppersInfo = async () => {
    await fetchSteppersState();
    await fetchSteppersAngles();
  }

  // Reset all joint positions when connection is lost
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
        initializeSteppersInfo
      }}
    >
      {children}
    </StepperContext.Provider>
  );
};
