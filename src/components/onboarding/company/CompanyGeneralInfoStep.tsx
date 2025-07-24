'use client';

import type { Portage } from '@/hooks/useModalData';
import type { CompanyFormData } from '@/types/company';

import { SiretValidationInput } from '../../form/SiretValidationInput';

interface CompanyGeneralInfoStepProps {
  formData: CompanyFormData;
  onFormDataChange: (updates: Partial<CompanyFormData>) => void;
  onSiretExistsChange: (exists: boolean) => void;
  portages: Portage[];
}

export const CompanyGeneralInfoStep = ({ 
  formData, 
  onFormDataChange, 
  onSiretExistsChange,
  portages 
}: CompanyGeneralInfoStepProps) => {
  const togglePortageSelection = (portageId: number) => {
    const portageIdStr = portageId.toString();
    const newSelectedPortages = formData.selectedPortages.includes(portageIdStr)
      ? formData.selectedPortages.filter((id: string) => id !== portageIdStr)
      : [...formData.selectedPortages, portageIdStr];
    
    onFormDataChange({ selectedPortages: newSelectedPortages });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700" htmlFor="nom">
            Nom de la société *
          </label>
          <input
            id="nom"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.companyName}
            onChange={(e) => onFormDataChange({ companyName: e.target.value })}
            placeholder="Ma Société de Portage"
            required
          />
        </div>
        <SiretValidationInput 
          siret={formData.siret}
          onSiretChange={(siret) => onFormDataChange({ siret })}
          onSiretExistsChange={onSiretExistsChange}
        />
      </div>
      
      <div className="space-y-2">
        <label htmlFor="desc" className="text-sm font-medium text-gray-700">
          Description de la société *
        </label>
        <textarea
          id="desc"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={formData.description}
          onChange={(e) => onFormDataChange({ description: e.target.value })}
          placeholder="Décrivez votre société de portage salarial..."
          rows={4}
          required
        />
      </div>

      {/* Portage Company Question */}
      <div className="space-y-3">
        <label className="flex items-center space-x-3 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.isPortage === "yes"}
            onChange={(e) => onFormDataChange({ isPortage: e.target.checked ? "yes" : "no" })}
            className="text-blue-600"
          />
          <span className="text-sm font-medium text-gray-700">
            Nous sommes une société de portage salarial
          </span>
        </label>
      </div>

      {/* Portages Selection - Only show if company is portage */}
      {formData.isPortage === "yes" && (
        <div className="space-y-3">
          <h1 className="text-sm font-medium text-gray-700">Services de portage proposés *</h1>
          <div className="grid grid-cols-3 gap-3">
            {portages.map((portage) => (
              <label key={portage.id} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.selectedPortages.includes(portage.id.toString())}
                  onChange={() => togglePortageSelection(portage.id)}
                  className="text-blue-600 rounded"
                />
                <span className="text-sm text-gray-700">{portage.name}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
