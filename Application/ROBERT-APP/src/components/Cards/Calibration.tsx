import { useConnection } from '../../context/ConnectionContext';
import { useStepperContext } from '../../context/StepperContext';

const Calibration = () => {
  const { isConnected } = useConnection();
  const { calibrationStates, handleCalibrate, handleCalibrateAll } = useStepperContext();

  //TODO: if not connected block buttons

  return (
    <div style={{ fontFamily: 'nothing' }} className="p-4 space-y-3">
      {[...Array(6)].map((_, index) => (
        <div key={index + 1} className="flex items-center space-x-2">
          <button
            onClick={() => handleCalibrate(index+1)}
            className={`bg-white border border-gray-300 text-gray-700 px-2 py-1 rounded w-32 text-left hover:bg-gray-50 focus:outline-none 
              ${index === 4 || index === 5 ? 'cursor-not-allowed opacity-50' : ''}`}
            disabled={index === 4 || index === 5} // Disable last two joints for now
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
