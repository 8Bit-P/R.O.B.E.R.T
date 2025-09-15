import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { listen } from '@tauri-apps/api/event';

export interface Transform {
  x: number;
  y: number;
  z: number;
  yaw: number;
  pitch: number;
  roll: number;
}

interface KinematicContextType {
  transform: Transform;
  setTransform: React.Dispatch<React.SetStateAction<Transform>>;
  updateTransform: (updates: Partial<Transform>) => void;
}

const defaultTransform: Transform = {
  x: 0,
  y: 0,
  z: 0,
  yaw: 0,
  pitch: 0,
  roll: 0,
};

const KinematicContext = createContext<KinematicContextType | undefined>(undefined);

export const KinematicProvider = ({ children }: { children: ReactNode }) => {
  const [transform, setTransform] = useState<Transform>(defaultTransform);

  const updateTransform = (updates: Partial<Transform>) => {
    setTransform((prev) => ({ ...prev, ...updates }));
  };

  useEffect(() => {
    let unlisten: (() => void) | undefined;

    // listen returns a Promise that resolves to the unlisten function
    listen<Transform>('report-robot-transform', (event) => {
      const { x, y, z, yaw, pitch, roll } = event.payload;
      setTransform({
        x: x ?? 0,
        y: y ?? 0,
        z: z ?? 0,
        yaw: yaw ?? 0,
        pitch: pitch ?? 0,
        roll: roll ?? 0,
      });
    }).then((fn) => {
      unlisten = fn;
    });

    // cleanup on unmount
    return () => {
      if (unlisten) unlisten();
    };
  }, []);

  return <KinematicContext.Provider value={{ transform, setTransform, updateTransform }}>{children}</KinematicContext.Provider>;
};

export const useKinematic = () => {
  const context = useContext(KinematicContext);
  if (!context) {
    throw new Error('useKinematic must be used within a KinematicProvider');
  }
  return context;
};
