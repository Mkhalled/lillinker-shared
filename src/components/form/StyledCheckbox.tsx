'use client';

import { InputHTMLAttributes, ReactNode } from 'react';

interface StyledCheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label?: string | ReactNode;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const StyledCheckbox = ({
  checked,
  onChange,
  label,
  size = 'md',
  className = '',
  id,
  ...props
}: StyledCheckboxProps) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const iconSizeClasses = {
    sm: 'w-2.5 h-2.5',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  };

  const component = (
    <div className={`relative ${className}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="sr-only"
        id={id}
        {...props}
      />
      <div
        className={`${sizeClasses[size]} rounded-md border-2 transition-all duration-200 flex items-center justify-center cursor-pointer ${
          checked ? 'border-indigo-600 bg-indigo-600' : 'border-gray-300 bg-white hover:border-indigo-400'
        }`}
        onClick={() => {
          // Create a synthetic event to trigger onChange
          const syntheticEvent = {
            target: { checked: !checked },
            currentTarget: { checked: !checked },
          } as React.ChangeEvent<HTMLInputElement>;
          onChange(syntheticEvent);
        }}
      >
        {checked && (
          <svg
            className={`${iconSizeClasses[size]} text-white`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        )}
      </div>
    </div>
  );

  if (label) {
    return (
      <label className="flex items-center space-x-3 cursor-pointer group">
        {component}
        <span className="text-sm font-medium text-gray-700 select-none">{label}</span>
      </label>
    );
  }

  return component;
};
