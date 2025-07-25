'use client';

import { InputHTMLAttributes } from 'react';

interface StyledRadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  labelClassName?: string;
}

export const StyledRadio = ({ 
  checked, 
  onChange, 
  label, 
  size = 'md',
  className = '',
  labelClassName = '',
  id,
  name,
  value,
  ...props 
}: StyledRadioProps) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5', 
    lg: 'w-6 h-6'
  };

  const component = (
    <div className={`relative ${className}`}>
      <input
        type="radio"
        checked={checked}
        onChange={onChange}
        className="sr-only"
        id={id}
        name={name}
        value={value}
        {...props}
      />
      <div className={`${sizeClasses[size]} rounded-full border-2 transition-all duration-200 cursor-pointer ${
        checked 
          ? 'border-blue-600 bg-blue-600' 
          : 'border-gray-300 bg-white hover:border-blue-400'
      }`}>
        {checked && (
          <div className="w-full h-full rounded-full bg-white scale-[0.4] transition-transform duration-200"></div>
        )}
      </div>
    </div>
  );

  if (label) {
    return (
      <label className="flex items-center space-x-3 cursor-pointer group">
        {component}
        <span className={`text-sm font-medium text-gray-700 select-none ${labelClassName}`}>{label}</span>
      </label>
    );
  }

  return component;
};
