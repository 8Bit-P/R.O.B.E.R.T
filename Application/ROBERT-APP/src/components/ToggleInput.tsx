import React from "react";

interface ToggleInputProps {
  isChecked: boolean;
  handleToggleInput: (event: React.ChangeEvent<HTMLInputElement>) => void;
  isActive: boolean;
  index?: number;
}

const ToggleInput = ({ isChecked, handleToggleInput, isActive = true, index = 1 }: ToggleInputProps) => {
  // Calculate delay for the sliding effect
  const slideDelay = `${index * 0.1}s`; // Delay for sliding
  // Calculate delay for the color transition
  const colorDelay = `${(index + 1) * 0.1}s`; // Color transition delay, ensures it's later than the sliding

  return (
    <label className="cursor-pointer">
      <input
        type="checkbox"
        checked={isChecked}
        onChange={handleToggleInput}
        className="sr-only peer"
        disabled={!isActive}
      />
      <div
        className="relative w-11 h-6 rounded-full peer transition-all"
        style={{
          backgroundColor: isChecked ? '#059669' : '#E0E0E0', // Color transition
          transitionDelay: colorDelay, // Apply delay to background color change
        }}
      >
        {/* The sliding "dot" part */}
        <div
          className="absolute top-[2px] left-[2px] w-5 h-5 bg-white border-gray-300 border rounded-full transition-all"
          style={{
            transitionDelay: slideDelay, // Apply delay to sliding
            transform: isChecked ? 'translateX(100%)' : 'translateX(0)', // Control sliding based on checked state
          }}
        />
      </div>
    </label>
  );
};

export default ToggleInput;
