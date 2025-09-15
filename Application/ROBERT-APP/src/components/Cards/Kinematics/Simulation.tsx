import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import Point from '../../3D/Point';
import RobotModel from '../../3D/RobotModel';
import { Suspense } from 'react';
import { useKinematic } from '../../../context/KinematicContext';

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
  const { transform } = useKinematic();

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
        {/* Global soft light */}
        <ambientLight intensity={0.4} />

        {/* Key light (main, strong) */}
        <directionalLight position={[5, 5, 5]} intensity={1.2} castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} />

        {/* Fill light (so shadows aren’t fully black) */}
        <directionalLight position={[-5, 2, 5]} intensity={0.6} />

        {/* Back/rim light (adds edge highlight to make shape pop) */}
        <directionalLight position={[0, -5, 5]} intensity={0.8} />

        {/* Optional: subtle hemisphere light for ambient sky/ground tint */}
        <hemisphereLight groundColor={0x444433} intensity={0.3} />

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

        <Point position={[transform.x/10, transform.y/10, transform.z/10]} color={0xff6600} size={0.1} />

        <Suspense fallback={null}>
          <RobotModel scale={1} position={[0, 0, 0]} />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default Simulation;
