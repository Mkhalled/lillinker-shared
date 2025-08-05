import { useState } from 'react';

interface CollapsibleRowProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

// Simple SVG icons
const ChevronDownIcon = () => (
  <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

const CollapsibleRow = ({ title, children, defaultOpen = false }: CollapsibleRowProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-gray-200 rounded-lg mb-4 overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 bg-gray-50 hover:bg-gray-100 transition-colors duration-200 flex items-center justify-between text-left"
      >
        <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        {isOpen ? <ChevronDownIcon /> : <ChevronRightIcon />}
      </button>
      
      {isOpen && (
        <div className="px-6 py-6 bg-white border-t border-gray-200">
          {children}
        </div>
      )}
    </div>
  );
}

export default CollapsibleRow;