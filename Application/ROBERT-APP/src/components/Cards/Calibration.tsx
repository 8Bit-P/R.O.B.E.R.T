import { useState } from 'react';
import { useConnection } from '../../context/ConnectionContext';
import { calibrateStepper } from '../../api/commands';

import toast from 'react-hot-toast';

const enum CalibrationStates {
  NOT_CALIBRATED = '#FD0200', // Red for uncalibrated
  CALIBRATED = '#69B59E', // Green for calibrated
  CALIBRATING = '#A0A0A0', // Gray for calibrating
}

const Calibration = () => {
  const { isConnected } = useConnection();

  const [calibrationStates, setCalibrationStates] = useState([
    CalibrationStates.NOT_CALIBRATED,
    CalibrationStates.NOT_CALIBRATED,
    CalibrationStates.NOT_CALIBRATED,
    CalibrationStates.NOT_CALIBRATED,
    CalibrationStates.NOT_CALIBRATED,
    CalibrationStates.NOT_CALIBRATED,
  ]);

  const handleCalibrate = (index: number) => {
    if (isConnected) {
      //Set state as calibrating
      setCalibrationStates((prevStates) => {
        const newStates = [...prevStates];
        newStates[index] = CalibrationStates.CALIBRATING;
        return newStates;
      });

      var calibrationIndexArray: number[] = [index];

      //Add 1 to each index
      calibrationIndexArray = calibrationIndexArray.map((idx) => idx + 1);

      //TODO: make this properly
      calibrateStepper(calibrationIndexArray)
        .then((res) => {
          //If no error response assume joint is calibrated
          console.log(res);
          setCalibrationStates((prevStates) => {
            const newStates = [...prevStates];
            newStates[index] = CalibrationStates.CALIBRATED; // Set to CALIBRATED after process
            return newStates;
          });
        })
        .catch((err) => {
          toast.error(err);
          //Set state as not calibrated again
          setCalibrationStates((prevStates) => {
            const newStates = [...prevStates];
            newStates[index] = CalibrationStates.NOT_CALIBRATED; // Set to CALIBRATED after process
            return newStates;
          });
        });
    }
  };

  const handleCalibrateAll = () => {
    if (isConnected) {
      setCalibrationStates(new Array(6).fill(CalibrationStates.CALIBRATING));

      var calibrationIndexArray: number[] = Array.from({ length: 4 }, (_, index) => index);

      //Add 1 to each index
      calibrationIndexArray = calibrationIndexArray.map((idx) => idx + 1);

      calibrateStepper(calibrationIndexArray)
        .then((res) => {
          //If no error response assume joints are calibrated
          console.log(res);
          setCalibrationStates(new Array(4).fill(CalibrationStates.CALIBRATED)); // Set all to CALIBRATED
        })
        .catch((err) => {
          toast.error(err);
          setCalibrationStates(new Array(4).fill(CalibrationStates.NOT_CALIBRATED));
        });
    }
  };

  return (
    <div style={{ fontFamily: 'nothing' }} className="p-4 space-y-3">
      {[...Array(6)].map((_, index) => (
        <div key={index + 1} className="flex items-center space-x-2">
          <button
            onClick={() => handleCalibrate(index)}
            className={`bg-white border border-gray-300 text-gray-700 px-2 py-1 rounded w-32 text-left hover:bg-gray-50 focus:outline-none 
              ${index === 4 || index === 5 ? 'cursor-not-allowed opacity-50' : ''}`}
            disabled={index === 4 || index === 5} // Disable last two joints
          >
            Calibrate S{index + 1}
          </button>
          <div className="flex items-center justify-center w-4 h-4 rounded-full border border-gray-300">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: calibrationStates[index] }} />
          </div>
        </div>
      ))}
      <div className="flex items-center space-x-2 mt-4">
        <button
          onClick={handleCalibrateAll}
          className="bg-white border border-gray-300 text-gray-700 px-2 py-1 rounded w-40 text-left hover:bg-gray-50 focus:outline-none"
        >
          Calibrate All
        </button>
      </div>
    </div>
  );
};

export default Calibration;
