interface SelectProps {
  value: string | '';
  onChange: (value: string) => void; // Handler function to update the selected value
  options: string[]; // Array of options (strings)
  placeholder?: string; // Optional placeholder text
}

const Select = ({ value, onChange, options, placeholder }: SelectProps) => {
  return (
    <select
      onChange={(e) => onChange(e.target.value)}
      value={value || ''}
      className="flex-grow bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5"
    >
      <option value="" disabled>
        {placeholder || 'Select an option'}
      </option>
      {options.map((option, index) => (
        <option key={index} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
};

export default Select;
