'use client';

import { CompanyFormData } from '@/types/company';

import type { Portage } from '../../../hooks/useModalData';
import { StyledCheckbox } from '../../form/StyledCheckbox';

interface CompanyPortageStepProps {
  formData: CompanyFormData;
  onFormDataChange: (updates: Partial<CompanyFormData>) => void;
  portages: Portage[];
}

export const CompanyPortageStep = ({
  formData,
  onFormDataChange,
  portages,
}: CompanyPortageStepProps) => {
  const togglePortageSelection = (portageId: number) => {
    const portageIdStr = portageId.toString();
    const newSelectedPortages = formData.selectedPortages.includes(portageIdStr)
      ? formData.selectedPortages.filter((id: string) => id !== portageIdStr)
      : [...formData.selectedPortages, portageIdStr];

    onFormDataChange({ selectedPortages: newSelectedPortages });
  };
  return (
    <div className="space-y-6 pb-5">
      <div className="space-y-4">
        {/* Portage Company Question */}
        <div className="space-y-3">
          <div className="p-4 border-2 rounded-xl hover:bg-gray-50 transition-all duration-200">
            <StyledCheckbox
              checked={formData.isPortage === 'yes'}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                onFormDataChange({ isPortage: e.target.checked ? 'yes' : 'no' })
              }
              label="Nous sommes une société de portage salarial"
            />
          </div>
        </div>

        {/* Portages Selection - Only show if company is portage */}
        {formData.isPortage === 'yes' && (
          <div className="space-y-3">
            <h1 className="text-sm font-medium text-gray-700">Services de portage proposés</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {portages.map(portage => (
                <div
                  key={portage.id}
                  className="p-3 border rounded-lg hover:bg-gray-50 transition-all duration-200"
                >
                  <StyledCheckbox
                    checked={formData.selectedPortages.includes(portage.id.toString())}
                    onChange={() => togglePortageSelection(portage.id)}
                    label={portage.name}
                    size="sm"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyPortageStep;
