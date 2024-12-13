import { useState } from "react";
import { useConnection } from "../../context/ConnectionContext";
import { toggleStepperState } from "../../api/commands";

import ToggleInput from "../ToggleInput";
import toast from "react-hot-toast";

const SteppersState = () => {

  const { port, isConnected } = useConnection();
  // Initialize state as an array of booleans
  const [toggleStates, setToggleStates] = useState([true, true, true, true, true, true]);

  // Function to handle the toggle change
  const handleToggleInput = (index: number) => {
    setToggleStates((prevStates) => {
      const newStates = [...prevStates]; // Create a copy of the current states
      newStates[index] = !newStates[index]; // Toggle the specific index
      return newStates; // Return the updated states
    });

    //Send command
    if(isConnected){
      toggleStepperState(port, index, toggleStates[index] ? "ENABLED" : "DISABLED")
        .then((res) => console.log(res))
        .catch((err) => toast.error(err));
    }

  };

  return (
    <div className="grid grid-cols-2 gap-2 mt-2 pl-2" style={{fontFamily:"nothing"}}>
      {toggleStates.map((isChecked, index) => (
        <div key={index} className="flex items-center mt-2">
          <span className="mr-2 w-5 select-none">S{index + 1}</span> {/* Label for each toggle */}
          <ToggleInput
            isChecked={isChecked}
            handleToggleInput={() => handleToggleInput(index)} // Pass index to handler
            isConnected={isConnected}
          />
        </div>
      ))}
    </div>
  );
};

export default SteppersState;
