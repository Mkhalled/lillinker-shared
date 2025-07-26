import React, { FC } from 'react';

interface TextAreaProps {
  id?: string;
  name?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  className?: string;
  disabled?: boolean;
  required?: boolean;
  rows?: number;
  error?: boolean;
  success?: boolean;
  hint?: string;
  label?: string;
}

const TextAreaField: FC<TextAreaProps> = ({
  id,
  name,
  placeholder,
  value,
  onChange,
  className = '',
  disabled = false,
  required = false,
  rows = 4,
  error = false,
  success = false,
  hint,
  label,
}) => {
  // Base textarea styles with responsive sizing
  let textareaClasses = `w-full px-3 py-2 text-sm sm:text-base border-2 rounded-md outline-none transition-all duration-200 resize-vertical ${className}`;

  // Add styles for the different states
  if (disabled) {
    textareaClasses += ` text-gray-500 border-blue-200 bg-gray-50 cursor-not-allowed`;
  } else if (error) {
    textareaClasses += ` text-red-800 border-red-300 focus:border-red-500`;
  } else if (success) {
    textareaClasses += ` text-green-800 border-green-300 focus:border-green-500`;
  } else {
    textareaClasses += ` text-gray-900 border-blue-200 focus:border-blue-400`;
  }

  return (
    <div className="space-y-2">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <textarea
        id={id}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        required={required}
        rows={rows}
        className={textareaClasses}
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

export default TextAreaField;
