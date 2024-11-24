import { useConnection } from '../../context/ConnectionContext';
import { moveStep } from "../../api/commands";

const JointControl = () => {

  const { port, isConnected } = useConnection();

  //Individual increase of joint angle
  const handleJointIncrement = (jointIndex:number) => {
    if(isConnected){
      moveStep(port,jointIndex,1)
    }
  }

  //Individual decrease of joint angle
  const handleJointDecrement = (jointIndex:number) => {
    if(isConnected){
      moveStep(port,jointIndex,-1)
    }
  }

  return (
    <div style={{ fontFamily: "nothing" }} className="h-full w-full flex">
      <div className="w-2/5 p-4 border-r border-gray-300">
        <h2 className="text-lg font-semibold mb-4">
          Increment / Decrement Angle
        </h2>

        <div className="space-y-3">
          {[...Array(6)].map((_, index) => (
            <div
              key={index}
              className="flex items-center space-x-3 justify-center"
            >
              <button
                className="bg-red-500 text-white text-xl rounded-lg px-3 py-1 w-10 h-10 select-none hover:bg-red-600"
                onClick={() => handleJointIncrement(index)}
              >
                -
              </button>
              <span className="text-lg font-medium w-5 text-center">
                J{index + 1}
              </span>
              <button
                className="bg-red-500 text-xl text-white rounded-lg px-3 py-1 w-10 h-10 select-none hover:bg-red-600"
                onClick={() => handleJointDecrement(index)}
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
                max="360"
                className="w-full p-2 border border-gray-300 rounded-md text-center hover:border-blue-400 hover:bg-blue-50"
                placeholder="0-360"
              />
            </div>
          ))}
        </div>

        {/* Run button */}
        <button
          className="bg-gray-500 text-white font-semibold mt-4 ml-[205px] px-4 py-2 rounded-lg hover:bg-gray-600"
          onClick={() => console.log("Run command for custom angles")}
        >
          Run
        </button>
      </div>
    </div>
  );
};

export default JointControl;
