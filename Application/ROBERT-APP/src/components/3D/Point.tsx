interface PointProps {
  position: [number, number, number]; // <-- tuple type
  color?: number;
  size?: number;
}

const Point = ({ position, color = 0xff0000, size = 0.1 }: PointProps) => {
  return (
    <mesh position={position}>
      <sphereGeometry args={[size, 16, 16]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
};

export default Point