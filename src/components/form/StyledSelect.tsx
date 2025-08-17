'use client';

import { SelectHTMLAttributes, ReactNode } from 'react';

interface StyledSelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: Array<{ value: string | number; label: string }>;
  placeholder?: string;
  label?: string | ReactNode;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  error?: string;
}

export const StyledSelect = ({
  value,
  onChange,
  options,
  placeholder = 'Sélectionner...',
  label,
  size = 'md',
  className = '',
  error,
  id,
  required,
  ...props
}: StyledSelectProps) => {
  const sizeClasses = {
    sm: 'py-1.5 px-2 text-sm',
    md: 'py-2 px-3 text-base',
    lg: 'py-3 px-4 text-lg',
  };

  const selectClasses = `
    w-full 
    ${sizeClasses[size]}
    border 
    ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}
    rounded-md 
    shadow-sm 
    focus:outline-none 
    focus:ring-1
    transition-colors 
    duration-200
    bg-white
    appearance-none
    cursor-pointer
    ${className}
  `
    .trim()
    .replace(/\s+/g, ' ');

  const component = (
    <div className="relative mt-2">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={onChange}
          className={selectClasses}
          required={required}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {/* Custom dropdown arrow */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
          <svg
            className="w-5 h-5 text-gray-400"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );

  return component;
};
