import { useStepperContext } from "../../context/StepperContext";
import { useConnection } from "../../context/ConnectionContext";
import ToggleInput from "../ToggleInput";

const EnableSteppers = () => {
  const { isConnected } = useConnection();
  const { states, toggleStepper } = useStepperContext();

  return (
    <div className="grid grid-cols-2 gap-2 mt-2 pl-2" style={{ fontFamily: "nothing" }}>
      {Object.entries(states).map(([index, isEnabled]) => (
        <div key={index} className="flex items-center mt-2">
          <span className="mr-2 w-5 select-none">S{+index + 1}</span> {/* Label for each toggle */}
          <ToggleInput
            isChecked={isEnabled}
            handleToggleInput={() => toggleStepper(Number(index))}
            isActive={isConnected}
            index={Number(index)}
          />
        </div>
      ))}
    </div>
  );
};

export default EnableSteppers;
