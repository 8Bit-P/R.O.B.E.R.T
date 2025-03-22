import React, { createContext, useState, useContext, ReactNode } from 'react';
import {
  checkSteppersState,
  getParameters,
  getSteppersAngles,
  toggleStepperState,
  setAPIAcceleration,
  setAPIVelocity,
  calibrateStepper,
} from '../api/commands';
import { listen } from '@tauri-apps/api/event';
import { SteppersAngles } from '../interfaces/SteppersAngles';
import toast from 'react-hot-toast';
import { CalibrationStates } from '../constants/steppersContants';

interface StepperState {
  states: Record<number, boolean>; // Maps joint ID to state
  angles: Record<number, number | null>; // Maps joint ID to angles
  calibrationStates: Record<number, CalibrationStates>; // Tracks if stepper is calibrated
  velocity: number;
  acceleration: number;
  setStates: (jointId: number, state: boolean) => void;
  setVelocity: (velocity: number) => void;
  setAcceleration: (acceleration: number) => void;
  fetchSteppersState: () => Promise<void>;
  fetchSteppersAngles: () => Promise<void>;
  resetStepperState: () => void;
  initializeSteppersInfo: () => Promise<void>;
  toggleStepper: (jointId: number) => Promise<void>;
  handleCalibrate: (index: number) => void;
  handleCalibrateAll: () => void;
}

const StepperContext = createContext<StepperState | undefined>(undefined);

export const useStepperContext = (): StepperState => {
  const context = useContext(StepperContext);
  if (!context) {
    throw new Error('useStepperContext must be used within a StepperProvider');
  }
  return context;
};

interface StepperProviderProps {
  children: ReactNode;
}

export const StepperProvider: React.FC<StepperProviderProps> = ({ children }) => {
  const [angles, setAngles] = useState<Record<number, number | null>>(Object.fromEntries([...Array(6)].map((_, i) => [i, null])));

  const [states, setStates] = useState<Record<number, boolean>>(Object.fromEntries([...Array(6)].map((_, i) => [i, false])));

  const [acceleration, setAcceleration] = useState(50);
  const [velocity, setVelocity] = useState(50);

  const [calibrationStates, setCalibrationStates] = useState<Record<number, CalibrationStates>>(
    Object.fromEntries([...Array(6)].map((_, i) => [i, CalibrationStates.NOT_CALIBRATED]))
  );


  const updateCalibrationState = (jointId: number, calState: CalibrationStates) => {
    setCalibrationStates((prev) => ({ ...prev, [jointId]: calState }));
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
      toast.error('Error fetching steppers state');
    }
  };

  const fetchSteppersAngles = async () => {
    try {
      const data: (number | null)[] = await getSteppersAngles();
      
      // Create an angles record with absolute values (or null if the angle is null)
      const anglesRecord = Object.fromEntries(
        data.map((angle, index) => [index, angle !== null ? Math.abs(angle) : null])
      );
      
      setAngles(anglesRecord); // Store the angles record
    } catch (error) {
      toast.error('Error fetching steppers angles');
    }
  };
  

  const fetchParameters = async () => {
    try {
      const params: number[] = await getParameters();
      setVelocity(params[0]);
      setAcceleration(params[1]);
    } catch (error) {
      toast.error('Error fetching parameters');
    }
  };

  // @index: is the number of the joint (from 1 to 6)
  const handleCalibrate = (index: number) => {
    
    //Set state as calibrating
    updateCalibrationState(index, CalibrationStates.CALIBRATING);
    //Create array to call rust function
    var calibrationIndexArray: number[] = [index+1];

    calibrateStepper(calibrationIndexArray)
      .then((res) => {
        //If no error response assume joint is calibrated
        console.log(res);
        updateCalibrationState(index, CalibrationStates.CALIBRATED);

        fetchSteppersAngles();
      })
      .catch((err) => {
        toast.error(err);
        updateCalibrationState(index, CalibrationStates.NOT_CALIBRATED);
      });
  };

  const handleCalibrateAll = () => {
    setCalibrationStates(new Array(6).fill(CalibrationStates.CALIBRATING));

    var calibrationIndexArray: number[] = Array.from({ length: 4 }, (_, index) => index+1);

    //TODO: logic to see if any calibration went wrong
    calibrateStepper(calibrationIndexArray)
      .then((res) => {
        //If no error response assume joints are calibrated
        console.log(res);
        for(let stepperIdx of calibrationIndexArray) {
          updateCalibrationState(stepperIdx-1, CalibrationStates.CALIBRATED);
        }

        fetchSteppersAngles();
        
      })
      .catch((err) => {
        toast.error(err);
        setCalibrationStates(new Array(6).fill(CalibrationStates.NOT_CALIBRATED));
      })
      
  };

  const initializeSteppersInfo = async () => {
    await fetchSteppersState();
    await fetchSteppersAngles();
    await fetchParameters();
  };

  const updateVelocity = async (vel: number) => {
    try {
      setAPIVelocity(vel);
      setVelocity(vel);
    } catch (error) {
      toast.error('Error updating velocity');
    }
  };

  const updateAcceleration = async (acc: number) => {
    try {
      setAPIAcceleration(acc);
      setAcceleration(acc);
    } catch (error) {
      toast.error('Error updating acceleration');
    }
  };

  const toggleStepper = async (jointId: number) => {
    try {
      const newState = !states[jointId]; // Toggle current state
      setStates((prev) => ({ ...prev, [jointId]: newState })); 

      await toggleStepperState(jointId + 1, newState ? 'ENABLED' : 'DISABLED');
      
      fetchSteppersAngles();
    } catch (error) {
      toast.error(`Failed to toggle stepper ${jointId + 1}`);
    }
  };

  const resetStepperState = () => {
    setStates(Object.fromEntries([...Array(6)].map((_, i) => [i, false])));
    setAngles(Object.fromEntries([...Array(6)].map((_, i) => [i, null])));
    setCalibrationStates(Object.fromEntries([...Array(6)].map((_, i) => [i, CalibrationStates.NOT_CALIBRATED])));
  };

  // Listen for stepper angles update event
  listen<SteppersAngles>('report-steppers-angles', (event) => {
    const { j1, j2, j3, j4, j5, j6 } = event.payload;
  
    setAngles({
      0: j1 !== null ? Math.abs(j1) : null, 
      1: j2 !== null ? Math.abs(j2) : null, 
      2: j3 !== null ? Math.abs(j3) : null, 
      3: j4 !== null ? Math.abs(j4) : null, 
      4: j5 !== null ? Math.abs(j5) : null, 
      5: j6 !== null ? Math.abs(j6) : null, 
    });
  });
  

  return (
    <StepperContext.Provider
      value={{
        angles,
        calibrationStates,
        states,
        velocity,
        acceleration,
        setStates: updateStates,
        setVelocity: updateVelocity,
        setAcceleration: updateAcceleration,
        fetchSteppersState,
        fetchSteppersAngles,
        resetStepperState,
        initializeSteppersInfo,
        toggleStepper,
        handleCalibrate,
        handleCalibrateAll,
      }}
    >
      {children}
    </StepperContext.Provider>
  );
};
