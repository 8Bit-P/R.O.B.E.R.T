import { useState } from 'react';
import { useConnection } from '../../../context/ConnectionContext';
import toast from 'react-hot-toast';

// placeholder functions (replace with your real API calls later)
const driveToPoseAPI = async (pose: Record<string, number>) => {
  console.log('Driving to pose:', pose);
};
const DEFAULT_POSE = { x: '', y: '', z: '', yaw: '', pitch: '', roll: '' };

const KinematicsControl = () => {
  const { isConnected } = useConnection();
  const [poseValues, setPoseValues] = useState<Record<string, number | string>>(DEFAULT_POSE);

  const handleInputChange = (key: string, value: string) => {
    setPoseValues((prev) => ({
      ...prev,
      [key]: value === '' ? '' : parseFloat(value) || 0,
    }));
  };

  const handleClear = () => setPoseValues(DEFAULT_POSE);

  const handleRun = () => {
    if (!isConnected) return;

    const pose: Record<string, number> = {};
    Object.entries(poseValues).forEach(([key, value]) => {
      if (value !== '') pose[key] = Number(value);
    });

    driveToPoseAPI(pose).catch((err) => toast.error(err));
  };

  const positionFields = ['x', 'y', 'z'];
  const rotationFields = ['yaw', 'pitch', 'roll'];

  return (
    <div style={{ fontFamily: 'nothing' }} className="h-full w-full p-4 flex flex-col">
      {/* Title */}
      <h2 className="text-lg font-semibold mb-6">Drive to Custom Pose</h2>

      {/* Two columns: position and orientation */}
      <div className="grid grid-cols-2 gap-6 flex-grow">
        {/* Position column */}
        <div className="space-y-3">
          {positionFields.map((field) => (
            <div key={field} className="flex items-center space-x-3">
              <label className="font-medium text-gray-700 uppercase w-14">{field}</label>
              <input
                type="number"
                value={poseValues[field]}
                onChange={(e) => handleInputChange(field, e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md text-center hover:border-blue-400 hover:bg-blue-50"
                placeholder={field}
              />
            </div>
          ))}
        </div>

        {/* Rotation column */}
        <div className="space-y-3">
          {rotationFields.map((field) => (
            <div key={field} className="flex items-center space-x-3">
              <label className="font-medium text-gray-700 capitalize w-14">{field}</label>
              <input
                type="number"
                value={poseValues[field]}
                onChange={(e) => handleInputChange(field, e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md text-center hover:border-blue-400 hover:bg-blue-50"
                placeholder={field}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-end space-x-4 mt-6">
        <button
          className={`border-2 font-semibold px-4 py-2 rounded-lg 
            ${isConnected ? 'border-gray-500 hover:bg-gray-200' : 'border-gray-300 bg-gray-200 cursor-not-allowed opacity-50'}`}
          onClick={handleClear}
          disabled={!isConnected}
        >
          Clear
        </button>

        <button
          className={`text-white font-semibold px-4 py-2 rounded-lg 
            ${isConnected ? 'bg-gray-500 hover:bg-gray-600' : 'bg-gray-300 cursor-not-allowed opacity-70'}`}
          onClick={handleRun}
          disabled={!isConnected}
        >
          Run
        </button>
      </div>
    </div>
  );
};

export default KinematicsControl;
