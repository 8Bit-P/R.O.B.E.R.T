import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import Point from '../../3D/Point';
import RobotModel from '../../3D/RobotModel';
import { Suspense } from 'react';

const AxesWithArrows = ({ size = 3, origin = [0, 0, 0] }) => {
  const originVec = new THREE.Vector3(...origin);
  // Add a tiny Z offset
  if (originVec.z === 0) originVec.z += 0.01;

  return (
    <>
      <primitive object={new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), originVec, size, 0xab1f18)} renderOrder={1} /> {/* Red */}
      <primitive object={new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), originVec, size, 0x1d8f39)} renderOrder={1} /> {/* Green */}
      <primitive object={new THREE.ArrowHelper(new THREE.Vector3(0, 0, 1), originVec, size, 0x3149c0)} renderOrder={1} /> {/* Blue */}
    </>
  );
};

const Simulation = () => {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        minWidth: '500px',
        minHeight: '500px',
      }}
    >
      <Canvas
        style={{ width: '100%', height: '100%' }}
        camera={{ position: [7, 7, 5], fov: 60, up: [0, 0, 1] }} // Initial angle
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[3, 3, 3]} />

        {/* Orbit controls constrained to Z-axis rotation */}
        <OrbitControls enableZoom={false} enablePan={false} />

        {/* Parent axes */}
        <AxesWithArrows size={5} origin={[-2.5, -2.5, 0]} />

        {/* Smaller local axes shifted along X and Y */}
        <AxesWithArrows size={2} origin={[0, 0, 0]} />
        {/* Floor grid aligned with axes */}
        <primitive
          object={new THREE.GridHelper(10, 10, 0xaaaaaa, 0x888888)}
          rotation={[Math.PI / 2, 0, 0]} // Rotate to lie on XY plane
          position={[0, 0, 0]} // At floor (z=0)
        />

        <Point position={[1, 1, 1]} color={0xff6600} size={0.1} />

        <Suspense fallback={null}>
          <RobotModel scale={1} position={[0, 0, 0]} />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default Simulation;
