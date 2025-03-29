interface SelectProps {
  value: string | '';
  onChange: (value: string) => void; // Handler function to update the selected value
  options: string[]; // Array of options (strings)
  placeholder?: string; // Optional placeholder text
  onClick?: () => void;
}

const Select = ({ value, onChange, options, placeholder, onClick }: SelectProps) => {
  // Sort the options alphabetically
  const sortedOptions = options.sort((a, b) => a.localeCompare(b));

  return (
    <select
      onChange={(e) => onChange(e.target.value)}
      onClick={onClick}
      value={value || ''}
      className="flex-grow bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5"
    >
      <option value="" disabled>
        {placeholder || 'Select an option'}
      </option>
      {sortedOptions.map((option, index) => (
        <option key={index} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
};

export default Select;
