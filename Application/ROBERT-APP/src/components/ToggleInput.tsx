import React from "react";

interface ToggleInputProps {
    isChecked: boolean,
    handleToggleInput: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const ToggleInput = ({isChecked, handleToggleInput}: ToggleInputProps) => {
  return (
    <label className="cursor-pointer">
      <input
        type="checkbox"
        checked={isChecked}
        onChange={handleToggleInput}
        className="sr-only peer"
      />
      <div className="relative w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
    </label>
  );
};

export default ToggleInput;
