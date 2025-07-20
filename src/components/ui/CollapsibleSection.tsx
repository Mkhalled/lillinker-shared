'use client';

import { ChevronDown, ChevronUp, Building2 } from 'lucide-react';
import { useState } from 'react';

interface CollapsibleSectionProps<T> {
  title: string;
  description?: string;
  items: T[];
  selectedItems: string[];
  onToggleItem: (itemId: number) => void;
  renderItem: (item: T, isSelected: boolean) => React.ReactNode;
  getItemId: (item: T) => number;
  loadingText?: string;
  emptyStateIcon?: React.ReactNode;
  emptyStateText?: string;
  className?: string;
  maxHeight?: string;
  showItemCount?: boolean;
}

export const CollapsibleSection = <T,>({
  title,
  description,
  items,
  selectedItems,
  onToggleItem,
  renderItem,
  getItemId,
  loadingText = "Chargement...",
  emptyStateIcon,
  emptyStateText = "Aucun élément disponible",
  className = "",
  maxHeight = "max-h-60",
  showItemCount = true
}: CollapsibleSectionProps<T>) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className={`space-y-4 ${className}`}>
      <div 
        className="flex items-center justify-between cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div>
          <h4 className="font-medium text-gray-900">{title}</h4>
          {description && (
            <p className="text-xs text-gray-500">{description}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {selectedItems.length > 0 && (
            <span className="text-sm text-green-600 font-medium">
              {selectedItems.length} sélectionné{selectedItems.length > 1 ? 's' : ''}
            </span>
          )}
          {showItemCount && items.length > 0 && (
            <span className="text-sm text-gray-500">
              {items.length} élément{items.length > 1 ? 's' : ''}
            </span>
          )}
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-gray-500" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-500" />
          )}
        </div>
      </div>
      
      {isExpanded && (
        <>
          {items.length === 0 ? (
            <div className="text-center py-8 text-gray-500 border border-gray-200 rounded-lg">
              {emptyStateIcon || <Building2 className="h-12 w-12 mx-auto mb-2 text-gray-400" />}
              <p>{items.length === 0 && !loadingText ? emptyStateText : loadingText}</p>
            </div>
          ) : (
            <div className={`${maxHeight} overflow-y-auto space-y-1 border border-gray-200 rounded-lg p-4`}>
              {items.map((item) => {
                const itemId = getItemId(item);
                const isSelected = selectedItems.includes(itemId.toString());
                return (
                  <div
                    key={itemId}
                    className={`p-3 border rounded-lg transition-colors cursor-pointer ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                    onClick={() => onToggleItem(itemId)}
                  >
                    {renderItem(item, isSelected)}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
};
