import React from "react";
import Select from "react-select";

interface Option {
  value: string;
  label: string;
}

interface CustomDropdownProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  name: string;
  disabled?: boolean;
}

const CustomDropdown: React.FC<CustomDropdownProps> = ({
  options,
  value,
  onChange,
  placeholder = "Select an option",
  name,
  disabled = false,
}) => {
  const handleChange = (selectedOption: Option | null) => {
    onChange(selectedOption ? selectedOption.value : "");
  };

  return (
    <Select
      options={options}
      value={options.find((option) => option.value === value) || null}
      onChange={handleChange}
      placeholder={placeholder}
      isDisabled={disabled}
      name={name}
      className="react-select-container"
      classNamePrefix="react-select"
    />
  );
};

export default CustomDropdown;
