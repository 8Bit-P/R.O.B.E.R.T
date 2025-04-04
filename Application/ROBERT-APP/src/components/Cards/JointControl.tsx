import { useConnection } from '../../context/ConnectionContext';
import { driveStepperToAngle, moveStep } from '../../api/commands';
import { useState } from 'react';

import toast from 'react-hot-toast';
import { DEFAULT_INCREMENT_STEPS, STEPPER_LIMITS } from '../../constants/steppersContants';

const JointControl = () => {
  const { isConnected } = useConnection();
  const [jointValues, setJointValues] = useState<(number | string)[]>(Array(6).fill(''));

  const handleInputChange = (index: number, value: string) => {
    const newValues = [...jointValues];
    newValues[index] = value === '' ? '' : parseInt(value) || 0;
    setJointValues(newValues);
  };

  const driveToCustomAngle = () => {
    if (!isConnected) return;

    const jointAngles = new Map<number, number>();

    jointValues.forEach((value, index) => {
      if (value !== '') {
        jointAngles.set(index + 1, Number(value)); // Joint numbers are 1-based
      }
    });

    driveStepperToAngle(jointAngles)
      .then((res) => {
        console.log(res);
      })
      .catch((err) => toast.error(err));
  };

  //Individual increase of joint angle
  const handleJointIncrement = (jointIndex: number) => {
    if (!isConnected) return;

    moveStep(jointIndex, DEFAULT_INCREMENT_STEPS)
      .then((res) => console.log(res))
      .catch((err) => toast.error(err));
  };

  //Individual decrease of joint angle
  const handleJointDecrement = (jointIndex: number) => {
    if (!isConnected) return;

    moveStep(jointIndex, -DEFAULT_INCREMENT_STEPS)
      .then((res) => console.log(res))
      .catch((err) => toast.error(err));
  };

  return (
    <div style={{ fontFamily: 'nothing' }} className="h-full w-full flex">
      <div className="w-2/5 p-4 border-r border-gray-300">
        <h2 className="text-lg font-semibold mb-4">Increment / Decrement Angle</h2>

        <div className="space-y-3">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="flex items-center space-x-3 justify-center">
              <button
                className={`bg-red-500 text-white text-xl rounded-lg px-3 py-1 w-10 h-10 select-none 
                          ${isConnected ? 'hover:bg-red-600' : 'cursor-not-allowed opacity-50'}`}
                onClick={() => handleJointDecrement(index + 1)}
                disabled={!isConnected}
              >
                -
              </button>
              <span className="text-lg font-medium w-5 text-center">J{index + 1}</span>
              <button
                className={`bg-red-500 text-white text-xl rounded-lg px-3 py-1 w-10 h-10 select-none 
                  ${isConnected ? 'hover:bg-red-600' : 'cursor-not-allowed opacity-50'}`}
                onClick={() => handleJointIncrement(index + 1)}
                disabled={!isConnected}
              >
                +
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="w-3/5 p-4">
        <h2 className="text-lg font-semibold mb-4">Drive to Custom Angle</h2>

        {/* Grid for six numeric input fields in two rows */}
        <div className="grid grid-cols-2 gap-4 mt-11">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="flex items-center space-x-3">
              <label className="font-medium text-gray-700">J{index + 1}</label>
              <input
                type="number"
                min="0"
                max={STEPPER_LIMITS[index + 1]}
                value={jointValues[index]} // Controlled input
                onChange={(e) => handleInputChange(index, e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md text-center hover:border-blue-400 hover:bg-blue-50"
                placeholder={'0-' + STEPPER_LIMITS[index + 1]}
              />
            </div>
          ))}
        </div>

        <div className="flex float-right space-x-4 mt-4">
          {/* Clear Button */}
          <button
            className={`border-2 font-semibold px-4 py-2 rounded-lg 
                      ${isConnected ? 'border-gray-500 hover:bg-gray-200' : 'border-gray-300 bg-gray-200 cursor-not-allowed opacity-50'}`}
            onClick={() => setJointValues(Array(6).fill(''))}
            disabled={!isConnected}
          >
            Clear
          </button>

          {/* Run Button */}
          <button
            className={`text-white font-semibold px-4 py-2 rounded-lg 
                      ${isConnected ? 'bg-gray-500 hover:bg-gray-600' : 'bg-gray-300 cursor-not-allowed opacity-70'}`}
            onClick={driveToCustomAngle}
            disabled={!isConnected}
          >
            Run
          </button>
        </div>
      </div>
    </div>
  );
};

export default JointControl;
