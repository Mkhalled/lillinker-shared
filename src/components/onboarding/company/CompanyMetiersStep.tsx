'use client';

import type { CompanyFormData } from '@/types/company';

import { CollapsibleSection } from '../../ui/CollapsibleSection';

interface Metier {
  id: number;
  name: string;
  description?: string;
}

interface CompanyMetiersStepProps {
  formData: CompanyFormData;
  onFormDataChange: (updates: Partial<CompanyFormData>) => void;
  metiers: Metier[];
}

export const CompanyMetiersStep = ({ 
  formData, 
  onFormDataChange, 
  metiers 
}: CompanyMetiersStepProps) => {
  const toggleMetierSelection = (metierId: number) => {
    const metierIdStr = metierId.toString();
    const newSelectedMetiers = formData.selectedMetiers.includes(metierIdStr)
      ? formData.selectedMetiers.filter((id: string) => id !== metierIdStr)
      : [...formData.selectedMetiers, metierIdStr];
    
    onFormDataChange({ selectedMetiers: newSelectedMetiers });
  };

  return (
    <div className="space-y-4">
      <CollapsibleSection
        title="Métiers supportés *"
        description="Sélectionnez les métiers que votre société de portage prend en charge"
        items={metiers}
        selectedItems={formData.selectedMetiers}
        onToggleItem={toggleMetierSelection}
        getItemId={(metier: Metier) => metier.id}
        renderItem={(metier: Metier, isSelected: boolean) => (
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-700 font-medium">{metier.name}</span>
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => {
                e.stopPropagation();
                toggleMetierSelection(metier.id);
              }}
              onClick={(e) => e.stopPropagation()}
              className="h-4 w-4 text-blue-600 rounded"
            />
          </div>
        )}
        loadingText="Chargement des métiers..."
        emptyStateText="Aucun métier disponible"
        showItemCount={true}
      />
    </div>
  );
};
