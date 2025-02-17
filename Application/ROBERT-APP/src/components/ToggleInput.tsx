import React from "react";

interface ToggleInputProps {
  isChecked: boolean;
  handleToggleInput: (event: React.ChangeEvent<HTMLInputElement>) => void;
  isActive: boolean;
  index?: number;
}

const ToggleInput = ({ isChecked, handleToggleInput, isActive = true, index = 1 }: ToggleInputProps) => {
  // Calculate delay for animations
  const slideDelay = `${index * 0.1}s`;
  const colorDelay = `${(index + 1) * 0.1}s`;

  return (
    <label className={`relative inline-flex items-center ${isActive ? "cursor-pointer" : "cursor-not-allowed"}`}>
      <input
        type="checkbox"
        checked={isChecked}
        onChange={handleToggleInput}
        className="sr-only peer"
        disabled={!isActive}
      />
      {/* Toggle Background */}
      <div
        className={`w-11 h-6 rounded-full transition-all ${
          isActive 
            ? (isChecked ? "bg-green-600" : "bg-gray-300") 
            : "bg-gray-400 opacity-50"
        }`}
        style={{ transitionDelay: colorDelay }}
      >
        {/* Toggle Knob */}
        <div
          className={`absolute top-[2px] left-[2px] w-5 h-5 border border-gray-300 rounded-full bg-white transition-all ${
            isChecked ? "translate-x-full" : "translate-x-0"
          } ${!isActive ? "bg-gray-500" : ""}`}
          style={{ transitionDelay: slideDelay }}
        />
      </div>
    </label>
  );
};

export default ToggleInput;
