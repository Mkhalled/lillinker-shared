'use client';
import { Info, X } from 'lucide-react';
import { useState } from 'react';
import { createPortal } from 'react-dom';

interface DescriptionToolTipProps {
  title: string;
  description: string;
  iconSize?: 'sm' | 'md' | 'lg';
  position?: 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  children?: React.ReactNode;
}

const DescriptionToolTip: React.FC<DescriptionToolTipProps> = ({
  title,
  description,
  iconSize = 'md',
  position = 'center',
  maxWidth = 'md',
  className = '',
  children,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  const getIconSizeClass = () => {
    switch (iconSize) {
      case 'sm':
        return 'h-3 w-3';
      case 'md':
        return 'h-4 w-4';
      case 'lg':
        return 'h-5 w-5';
      default:
        return 'h-4 w-4';
    }
  };

  const getPositionClass = () => {
    switch (position) {
      case 'center':
        return 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2';
      case 'top-left':
        return 'top-4 left-4';
      case 'top-right':
        return 'top-4 right-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'bottom-right':
        return 'bottom-4 right-4';
      default:
        return 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2';
    }
  };

  const getMaxWidthClass = () => {
    switch (maxWidth) {
      case 'sm':
        return 'max-w-sm';
      case 'md':
        return 'max-w-md';
      case 'lg':
        return 'max-w-lg';
      case 'xl':
        return 'max-w-xl';
      default:
        return 'max-w-md';
    }
  };

  const tooltipContent = isOpen ? (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-25 z-[9998]"
        onClick={() => setIsOpen(false)}
      />

      {/* Tooltip Content */}
      <div 
        className={`fixed ${getPositionClass()} z-[9999] bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-xl p-4 ${getMaxWidthClass()} w-full mx-4 max-h-[70vh] overflow-y-auto`}
      >
        <div className="flex items-start justify-between mb-3">
          <h3 className="font-medium text-gray-900 dark:text-slate-100 pr-4 leading-tight">
            {title}
          </h3>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-400 hover:text-gray-600 dark:text-slate-400 dark:hover:text-slate-300 transition-colors flex-shrink-0"
            type="button"
            aria-label="Fermer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="text-sm">
          <span className="font-medium text-gray-800 dark:text-slate-200">Description:</span>
          <div className="text-gray-600 dark:text-slate-300 mt-1 leading-relaxed whitespace-pre-wrap">
            {description}
          </div>
          
          {/* Additional content if provided */}
          {children && (
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-slate-600">
              {children}
            </div>
          )}
        </div>
      </div>
    </>
  ) : null;

  return (
    <div className={`relative inline-flex ${className}`}>
      {/* Info Button */}
      <button
        onClick={handleToggle}
        className="p-1 text-gray-400 hover:text-gray-600 dark:text-slate-400 dark:hover:text-slate-300 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 rounded"
        type="button"
        aria-label={`Voir la description: ${title}`}
      >
        <Info className={getIconSizeClass()} />
      </button>

      {/* Portal the tooltip to document.body to ensure it appears above all other elements */}
      {typeof window !== 'undefined' && tooltipContent
        ? createPortal(tooltipContent, document.body)
        : null}
    </div>
  );
};

export default DescriptionToolTip;
