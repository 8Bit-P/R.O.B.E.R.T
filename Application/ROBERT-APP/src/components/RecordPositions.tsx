import { useState } from 'react';
import PlayButton from './PlayButton';
import SelectComponent from './SelectComponent';

const RecordPositions = () => {
  const [currentPos, setCurrentPos] = useState<string | null>(null);

  const getStoredPositions = (): string[] => ['A1', 'A2', 'A3', 'A4', 'A5'];

  const handleChangePosition = (value: string) => {
    setCurrentPos(value);
  };

  return (
    <div className="flex flex-col gap-4 w-full max-w-md">
      {/* Button to store position */}
      <button className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 rounded-md w-full">Store Current Position</button>

      {/* Select and PlayButton on a separate row, taking full width */}
      <div className="flex justify-between items-center w-full gap-4">
        <SelectComponent value={currentPos || ''} onChange={handleChangePosition} options={getStoredPositions()}/>

        {/* Play button stays at the end */}
        <PlayButton disabled={false} />
      </div>
    </div>
  );
};

export default RecordPositions;
