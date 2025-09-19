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
  transforms: Transform[]; // all joint transforms
  endEffector: Transform; // convenience: last transform
  setTransforms: React.Dispatch<React.SetStateAction<Transform[]>>;
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
  const [transforms, setTransforms] = useState<Transform[]>([]);

  useEffect(() => {
    let unlisten: (() => void) | undefined;

    // Listen for all joint transforms (array)
    listen<Transform[]>('report-robot-transforms', (event) => {
      setTransforms(event.payload ?? []);
    }).then((fn) => {
      unlisten = fn;
    });

    // cleanup on unmount
    return () => {
      if (unlisten) unlisten();
    };
  }, []);

  const endEffector = transforms.length > 0 ? transforms[transforms.length - 1] : defaultTransform;

  return (
    <KinematicContext.Provider value={{ transforms, endEffector, setTransforms }}>
      {children}
    </KinematicContext.Provider>
  );
};

export const useKinematic = () => {
  const context = useContext(KinematicContext);
  if (!context) {
    throw new Error('useKinematic must be used within a KinematicProvider');
  }
  return context;
};
