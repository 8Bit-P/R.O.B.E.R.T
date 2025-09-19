import { useKinematic } from '../../../context/KinematicContext';

const RobotTransform = () => {
  const { endEffector } = useKinematic(); 

  return (
    <div className="w-full h-full p-4" style={{ fontFamily: 'nothing' }}>
      {/* Two-column grid: Position vs Orientation */}
      <div className="grid grid-cols-2 gap-6">
        {/* Position */}
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-2">Position</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="font-medium">X:</span>
              <span>{endEffector.x.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Y:</span>
              <span>{endEffector.y.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Z:</span>
              <span>{endEffector.z.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Orientation */}
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-2">Orientation</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="font-medium">Yaw:</span>
              <span>{endEffector.yaw.toFixed(2)}º</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Pitch:</span>
              <span>{endEffector.pitch.toFixed(2)}º</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Roll:</span>
              <span>{endEffector.roll.toFixed(2)}º</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RobotTransform;
