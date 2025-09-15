import { useGLTF } from '@react-three/drei';
import { GroupProps, useFrame } from '@react-three/fiber';
import { useStepperContext } from '../../context/StepperContext';
import {  useRef } from 'react';
import * as THREE from 'three';
import { STEPPER_POSITIVE_TO_LIMIT } from '../../constants/steppersContants';

interface RobotModelProps extends GroupProps {
  scale?: number;
  position?: [number, number, number];
}

const RobotModel = ({ scale = 1, position = [0, 0, 0], ...props }: RobotModelProps) => {
  const gltf = useGLTF('/models/ROBERT.glb'); // path in public folder
  const groupRef = useRef<THREE.Group>(null);

  const { angles } = useStepperContext();

  useFrame(() => {
    if (!groupRef.current) return;

    for (let i = 1; i <= 6; i++) {
      const jointName = `J${i}`;
      const joint = groupRef.current.getObjectByName(jointName) as THREE.Object3D;

      if (joint) {
        let targetAngle = angles[i - 1] ?? 0;

        // Flip angle if positive steps are opposite for this joint
        if (!STEPPER_POSITIVE_TO_LIMIT[i]) {
          targetAngle = -targetAngle;
        }

        const current = joint.rotation.z;
        const target = THREE.MathUtils.degToRad(targetAngle);

        joint.rotation.z = THREE.MathUtils.lerp(current, target, 0.1);
      }
    }
  });

  return <primitive ref={groupRef} object={gltf.scene} scale={scale} position={position} {...props} />;
};

export default RobotModel;
