import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
} from "react";
import { checkSteppersState } from "../api/commands";
import { useConnection } from "./ConnectionContext";

// Define types for stepper tracking
interface StepperState {
  steps: Record<number, number>; // Maps joint ID to step count
  angles: Record<number, number>; // Maps joint ID to angles
  calibrated: Record<number, boolean>; // Tracks if stepper is calibrated
  setSteps: (jointId: number, steps: number) => void;
  setAngles: (jointId: number, angle: number) => void;
  setCalibrated: (jointId: number, isCalibrated: boolean) => void;
}

// Create context with undefined default
const StepperContext = createContext<StepperState | undefined>(undefined);

// Custom hook for using StepperContext
export const useStepper = (): StepperState => {
  const context = useContext(StepperContext);
  if (!context) {
    throw new Error("useStepper must be used within a StepperProvider");
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
  const [steps, setSteps] = useState<Record<number, number>>({});
  const [angles, setAngles] = useState<Record<number, number>>({});
  const [calibrated, setCalibrated] = useState<Record<number, boolean>>({});

  const { isConnected } = useConnection(); 

  const updateSteps = (jointId: number, newSteps: number) => {
    setSteps((prev) => ({ ...prev, [jointId]: newSteps }));
  };

  const updateAngles = (jointId: number, newAngle: number) => {
    setAngles((prev) => ({ ...prev, [jointId]: newAngle }));
  };

  const updateCalibrated = (jointId: number, isCalibrated: boolean) => {
    setCalibrated((prev) => ({ ...prev, [jointId]: isCalibrated }));
  };
  
  // Function to fetch stepper data from backend
  const fetchSteppersState = async () => {
    //TODO: get steppers state 
    // checkSteppersState()
    //   .then((data) => {
    //     console.log(data);
    //   })
    //   .catch((err) => {
    //     console.error("Error fetching steppers state:", err);
    //   });

      //TODO: get steppers angles
  };

  // Reset all joint positions when connection is lost
  const resetStepperState = () => {
    setSteps({});
    setAngles({});
    setCalibrated({});
  };

  // Monitor connection state
  useEffect(() => {
    let timeoutId;
  
    if (isConnected) {
      timeoutId = setTimeout(() => {
        fetchSteppersState(); // ✅ Fetch stepper state after a delay
      }, 1000); // Adjust the delay as needed (1000ms = 1 second)
    } else {
      timeoutId = setTimeout(() => {
        resetStepperState(); // ❌ Reset stepper state after a delay
      }, 500); // Adjust delay for reset if needed
    }
  
    return () => clearTimeout(timeoutId); // Cleanup timeout when effect re-runs
  }, [isConnected]);
  

  return (
    <StepperContext.Provider
      value={{
        steps,
        angles,
        calibrated,
        setSteps: updateSteps,
        setAngles: updateAngles,
        setCalibrated: updateCalibrated,
      }}
    >
      {children}
    </StepperContext.Provider>
  );
};
