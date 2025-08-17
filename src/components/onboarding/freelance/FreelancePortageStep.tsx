'use client';

import type { Portage } from '../../../hooks/useModalData';
import type { FreelanceFormData, FreelanceRequestData } from '../../../types/freelance';
import { StyledCheckbox } from '../../form/StyledCheckbox';

interface FreelancePortageStepProps {
  formData: FreelanceFormData | FreelanceRequestData;
  setFormData: (
    updater: (
      prev: FreelanceFormData | FreelanceRequestData
    ) => FreelanceFormData | FreelanceRequestData
  ) => void;
  portages: Portage[];
  handlePortageToggle: (portageId: number) => void;
}

export const FreelancePortageStep = ({
  formData,
  setFormData,
  portages,
  handlePortageToggle,
}: FreelancePortageStepProps) => {
  return (
    <div className="space-y-6 pb-5">
      <div className="space-y-4">
        <div className="space-y-3">
          <StyledCheckbox
            checked={formData.wantsPortage === 'yes'}
            onChange={e =>
              setFormData((prev: FreelanceFormData | FreelanceRequestData) => ({
                ...prev,
                wantsPortage: e.target.checked ? 'yes' : 'no',
              }))
            }
            label="Je souhaite faire appel à une société de portage salarial"
          />
        </div>

        {formData.wantsPortage === 'yes' && (
          <div className="space-y-3">
            <h1 className="text-sm font-medium text-gray-700">Services de portage souhaités</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {portages.map(portage => (
                <StyledCheckbox
                  key={portage.id}
                  checked={formData.selectedPortages.includes(portage.id.toString())}
                  onChange={() => handlePortageToggle(portage.id)}
                  label={portage.name}
                  size="sm"
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FreelancePortageStep;
