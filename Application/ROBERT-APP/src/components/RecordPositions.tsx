import { useEffect, useState } from 'react';
import PlayButton from './PlayButton';
import SelectComponent from './SelectComponent';
import { useConnection } from '../context/ConnectionContext';
import { useStepperContext } from '../context/StepperContext';
import { driveStepperToAngle } from '../api/commands';
import toast from 'react-hot-toast';
import { deletePosition, getStoredPositionsIDs, storePosition } from '../Utils/LocalStorageUtils';
import DeleteButton from './DeleteButton';

const RecordPositions = () => {
  const { isConnected } = useConnection();
  const { angles } = useStepperContext();

  const [currentPosID, setCurrentPosID] = useState<string | null>(null);
  const [storedPositionIDs, setStoredPositionsIDs] = useState<string[]>([]);

  useEffect(() => {
    updateStoredPositionsID();
  }, []);

  const updateStoredPositionsID = () => {
    setStoredPositionsIDs(getStoredPositionsIDs());
  };

  const handleStorePosition = () => {
    storePosition(angles).then((res) => {
      if (res) {
        toast.success('Position stored successfully!');
        updateStoredPositionsID();
      }
      else toast.error('Failed to store position');
    });
  };

  const handleDeletePosition = () => {
    deletePosition(currentPosID).then((res) => {
      if (res) {
        updateStoredPositionsID();
        setCurrentPosID(null);
      } else toast.error('Failed to delete position');
    });
  };

  const handleChangePosition = (value: string) => {
    setCurrentPosID(value);
  };

  const handleDriveToSelectedPosition = () => {
    if (currentPosID) {
      const storedAngle = localStorage.getItem(currentPosID);
      if (storedAngle) {

        const parsedAngle = JSON.parse(storedAngle);
        const jointAngles = new Map<number, number>();

        // Iterate over the object using Object.entries
        Object.entries(parsedAngle).forEach(([key, value]) => {
          const idx = Number(key); // Convert the key to a number
          if (value !== null) {
            jointAngles.set(idx + 1, Number(value)); // Joint numbers are 1-based
          }
        });

        driveStepperToAngle(jointAngles)
          .then((res) => {
            console.log(res);
          })
          .catch((err) => toast.error(err));
      }
    } else {
      toast.error('No position selected');
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full max-w-md">
      {/* Button to store position */}
      <button
        className={`text-white font-medium py-2 rounded-md w-full 
            ${isConnected ? 'bg-gray-600 hover:bg-gray-700' : 'bg-gray-400 cursor-not-allowed'}`}
        onClick={handleStorePosition}
        disabled={!isConnected}
      >
        Store Current Position
      </button>

      {/* Select and PlayButton on a separate row, taking full width */}
      <div className="flex justify-between items-center w-full gap-2">
        <SelectComponent value={currentPosID || ''} onChange={handleChangePosition} options={storedPositionIDs} />

        {/* Play button stays at the end */}
        <DeleteButton disabled={false} onClick={handleDeletePosition} />
        <PlayButton disabled={!isConnected} onClick={handleDriveToSelectedPosition} />
      </div>
    </div>
  );
};

export default RecordPositions;
