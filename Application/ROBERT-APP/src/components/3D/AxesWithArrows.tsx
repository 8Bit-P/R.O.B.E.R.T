import * as THREE from 'three';

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

export default AxesWithArrows