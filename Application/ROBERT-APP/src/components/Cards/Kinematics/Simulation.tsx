import { Canvas } from '@react-three/fiber';
import { Billboard, OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';
import Point from '../../3D/Point';
import RobotModel from '../../3D/RobotModel';
import { Suspense } from 'react';
import { useKinematic } from '../../../context/KinematicContext';
import AxesWithArrows from '../../3D/AxesWithArrows';

const Simulation = () => {
  const { transforms, targetTransform } = useKinematic();

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
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 5, 5]} intensity={1.2} castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
        <directionalLight position={[-5, 2, 5]} intensity={0.6} />
        <directionalLight position={[0, -5, 5]} intensity={0.8} />

        <hemisphereLight groundColor={0x444433} intensity={0.3} />

        <OrbitControls enableZoom={true} enablePan={false} />
        {/* Parent axes */}
        <AxesWithArrows size={5} origin={[-2.5, -2.5, -0.85]} />
        {/* Floor grid aligned with axes */}
        <primitive
          object={new THREE.GridHelper(10, 10, 0xaaaaaa, 0x888888)}
          rotation={[Math.PI / 2, 0, 0]} // Rotate to lie on XY plane
          position={[0, 0, -0.85]} // At floor (z=0)
        />
        {/* Plot all joint transforms */}
        {transforms.map((t, i) => {
          // t.x,t.y,t.z in same units as backend; if backend uses mm convert to meters: /1000
          const posVec = new THREE.Vector3(t.x / 100, t.y / 100, t.z / 100);

          // if you're receiving degrees for roll/pitch/yaw:
          const roll = (t.roll * Math.PI) / 180;
          const pitch = (t.pitch * Math.PI) / 180;
          const yaw = (t.yaw * Math.PI) / 180;

          return (
            <group key={i} position={posVec} rotation={[roll, pitch, yaw] /* order: XYZ */}>
              <AxesWithArrows size={1} />
              <Point position={[0, 0, 0]} size={0.1} color={i === transforms.length - 1 ? 0xff6600 : 0x00aaff} />
              <Billboard follow={true} lockZ={false}>
                <Text position={[0.15, 0.15, 0]} fontSize={0.2} color="white" anchorX="left" anchorY="middle">
                  J{i + 1}
                </Text>
              </Billboard>
            </group>
          );
        })}

        <Point position={[targetTransform.x/100, targetTransform.y/100, targetTransform.z/100]} size={0.1} />

        <Suspense fallback={null}>
          <RobotModel scale={1} position={[0, 0, 0]} />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default Simulation;
