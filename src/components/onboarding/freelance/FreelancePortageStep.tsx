'use client';

import type { Portage } from '../../../hooks/useModalData';
import type { FreelanceFormData } from '../../../types/freelance';

interface FreelancePortageStepProps {
  formData: FreelanceFormData;
  setFormData: (updater: (prev: FreelanceFormData) => FreelanceFormData) => void;
  portages: Portage[];
  handlePortageToggle: (portageId: number) => void;
}

export const FreelancePortageStep = ({
  formData,
  setFormData,
  portages,
  handlePortageToggle
}: FreelancePortageStepProps) => {
  return (
    <div className="space-y-6">
      <div className="text-center mb-4">
        <h4 className="text-md font-medium text-gray-800">
          Société de portage salarial
        </h4>
        <p className="text-sm text-gray-600 mt-1">Souhaitez-vous faire appel à une société de portage ?</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-3">
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.wantsPortage === "yes"}
              onChange={(e) => setFormData((prev: FreelanceFormData) => ({ ...prev, wantsPortage: e.target.checked ? "yes" : "no" }))}
              className="text-blue-600"
            />
            <span className="text-sm font-medium text-gray-700">Je souhaite faire appel à une société de portage salarial</span>
          </label>
        </div>

        {formData.wantsPortage === "yes" && (
          <div className="space-y-3">
            <h1 className="text-sm font-medium text-gray-700">Services de portage souhaités *</h1>
            <div className="grid grid-cols-3 gap-3">
              {portages.map((portage) => (
                <label key={portage.id} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.selectedPortages.includes(portage.id.toString())}
                    onChange={() => handlePortageToggle(portage.id)}
                    className="text-blue-600 rounded"
                  />
                  <span className="text-sm text-gray-700">{portage.name}</span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FreelancePortageStep;
