import { checkSteppersState, getSteppersAngles } from "../../api/commands";

const RecordPositions = () => {
  const testSteps = () => {
    getSteppersAngles()
      .then((res) => console.log("TEST: ", res))
      .catch((err) => console.error("TEST: ", err));
  };

  const testState = () => {
    checkSteppersState()
      .then((res) => console.log("TEST: ", res))
      .catch((err) => console.error("TEST: ", err));
  };

  return (
    <div className="p-4" style={{ fontFamily: "nothing" }}>
      In progress...
      <button onClick={testState}>State</button>
      <button onClick={testSteps}>Steps</button>
    </div>
  );
};

export default RecordPositions;
