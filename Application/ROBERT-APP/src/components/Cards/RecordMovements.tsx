import RecordPositions from '../RecordPositions';
import ScriptRunner from '../ScriptRunner';

const RecordMovements = () => {
  return (
    <div className="p-4" style={{ fontFamily: 'nothing' }}>
      <ScriptRunner />
      <hr className="my-4 border-t border-gray-300" />
      <RecordPositions />
    </div>
  );
};

export default RecordMovements;
