import React, { FC } from 'react';

interface InputProps {
  type?: 'text' | 'number' | 'email' | 'password' | 'date' | 'time' | string;
  id?: string;
  name?: string;
  placeholder?: string;
  value?: string | number;
  defaultValue?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  min?: string | number;
  max?: string | number;
  step?: number | string;
  disabled?: boolean;
  required?: boolean;
  success?: boolean;
  error?: boolean;
  hint?: string;
  label?: string;
}

const InputField: FC<InputProps> = ({
  type = 'text',
  id,
  name,
  placeholder,
  value,
  defaultValue,
  onChange,
  className = '',
  min,
  max,
  step,
  disabled = false,
  required = false,
  success = false,
  error = false,
  hint,
  label,
}) => {
  // Base input styles with responsive sizing
  let inputClasses = `w-full px-3 py-2 text-sm sm:text-base border-2 rounded-md outline-none transition-all duration-200 ${className}`;

  // Add styles for the different states
  if (disabled) {
    inputClasses += ` text-gray-500 border-blue-200 bg-gray-50 cursor-not-allowed`;
  } else if (error) {
    inputClasses += ` text-red-800 border-red-300 focus:border-red-500`;
  } else if (success) {
    inputClasses += ` text-green-800 border-green-300 focus:border-green-500`;
  } else {
    inputClasses += ` text-gray-900 border-blue-200 focus:border-blue-400`;
  }

  return (
    <div className="space-y-2">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <input
        type={type}
        id={id}
        name={name}
        placeholder={placeholder}
        value={value}
        defaultValue={defaultValue}
        onChange={onChange}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        required={required}
        className={inputClasses}
      />

      {/* Optional Hint Text */}
      {hint && (
        <p
          className={`text-xs ${
            error ? 'text-red-500' : success ? 'text-green-500' : 'text-gray-500'
          }`}
        >
          {hint}
        </p>
      )}
    </div>
  );
};

export default InputField;
