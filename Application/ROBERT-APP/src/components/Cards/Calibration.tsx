import { useState } from 'react';

const enum CalibrationStates {
  NOT_CALIBRATED = "#FD0200", // Red for uncalibrated
  CALIBRATED = "#69B59E",      // Green for calibrated
  CALIBRATING = "#A0A0A0"       // Gray for calibrating
}

const Calibration = () => {
  const [calibrationStates, setCalibrationStates] = useState([
    CalibrationStates.NOT_CALIBRATED,
    CalibrationStates.NOT_CALIBRATED,
    CalibrationStates.NOT_CALIBRATED,
    CalibrationStates.NOT_CALIBRATED,
    CalibrationStates.NOT_CALIBRATED,
    CalibrationStates.NOT_CALIBRATED,
  ]);

  const handleCalibrate = (index: number) => {
    setCalibrationStates((prevStates) => {
      const newStates = [...prevStates];
      newStates[index] = CalibrationStates.CALIBRATING;
      return newStates;
    });

    // Simulate calibration process
    //TODO: implement actual calibration
    setTimeout(() => {
      setCalibrationStates((prevStates) => {
        const newStates = [...prevStates];
        newStates[index] = CalibrationStates.CALIBRATED; // Set to CALIBRATED after process
        return newStates;
      });
    }, 2000); // Simulated delay for calibration
  };

  const handleCalibrateAll = () => {
    setCalibrationStates(new Array(6).fill(CalibrationStates.CALIBRATING));

    // Simulate calibration for all
    //TODO: implement actual calibration
    setTimeout(() => {
      setCalibrationStates(new Array(6).fill(CalibrationStates.CALIBRATED)); // Set all to CALIBRATED
    }, 2000); // Simulated delay for calibration
  };

  return (
    <div style={{ fontFamily: 'nothing' }} className="p-4 space-y-3">
      {[...Array(6)].map((_, index) => (
        <div key={index} className="flex items-center space-x-2">
          <button 
            onClick={() => handleCalibrate(index)} 
            className="bg-white border border-gray-300 text-gray-700 px-2 py-1 rounded w-32 text-left hover:bg-gray-50 focus:outline-none"
          >
            Calibrate S{index + 1}
          </button>
          <div className="flex items-center justify-center w-4 h-4 rounded-full border border-gray-300">
            <div 
              className="w-2 h-2 rounded-full" 
              style={{ backgroundColor: calibrationStates[index] }}
            />
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
