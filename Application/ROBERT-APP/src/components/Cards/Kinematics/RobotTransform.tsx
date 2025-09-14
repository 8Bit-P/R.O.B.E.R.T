import { useKinematic } from '../../../context/KinematicContext';

const RobotTransform = () => {
  const { transform } = useKinematic(); 

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
              <span>{transform.x.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Y:</span>
              <span>{transform.y.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Z:</span>
              <span>{transform.z.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Orientation */}
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-2">Orientation</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="font-medium">Yaw:</span>
              <span>{transform.yaw.toFixed(2)}º</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Pitch:</span>
              <span>{transform.pitch.toFixed(2)}º</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Roll:</span>
              <span>{transform.roll.toFixed(2)}º</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RobotTransform;
