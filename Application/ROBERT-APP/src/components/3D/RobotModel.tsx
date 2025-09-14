import { useGLTF } from "@react-three/drei";
import { GroupProps } from "@react-three/fiber";

interface RobotModelProps extends GroupProps {
  scale?: number;
  position?: [number, number, number];
}

const RobotModel = ({ scale = 1, position = [0, 0, 0], ...props }: RobotModelProps) => {
  const gltf = useGLTF("/models/test.glb"); // path in public folder

  return (
    <primitive
      object={gltf.scene}
      scale={scale}
      position={position}
      {...props}
    />
  );
};

export default RobotModel;
