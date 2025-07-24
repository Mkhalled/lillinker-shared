'use client';

import type { PlatformService } from '../../../hooks/useModalData';
import type { FreelanceFormData } from '../../../types/freelance';

interface FreelanceServicesStepProps {
  formData: FreelanceFormData;
  setFormData: (updater: (prev: FreelanceFormData) => FreelanceFormData) => void;
  platformServices: PlatformService[];
}

export const FreelanceServicesStep = ({
  formData,
  setFormData,
  platformServices
}: FreelanceServicesStepProps) => {
  const handleServiceToggle = (serviceId: number) => {
    const existingServiceIndex = formData.selectedServices.findIndex(
      service => service.serviceId === serviceId
    );

    setFormData((prev: FreelanceFormData) => ({
      ...prev,
      selectedServices: existingServiceIndex > -1
        ? prev.selectedServices.filter(service => service.serviceId !== serviceId)
        : [...prev.selectedServices, { serviceId, isRequired: false }]
    }));
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-4">
        <h4 className="text-md font-medium text-gray-800">
          De quels services avez-vous besoin ?
        </h4>
        <p className="text-sm text-gray-600 mt-1">Sélectionnez tous les services qui vous intéressent</p>
      </div>

      <div className="space-y-3">
        {platformServices.map((option) => (
          <label
            key={option.id}
            className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
          >
            <input
              type="checkbox"
              checked={formData.selectedServices.some(service => service.serviceId === option.id)}
              onChange={() => handleServiceToggle(option.id)}
              className="mt-1 text-blue-600 rounded"
            />
            <div className="flex-1">
              <div className="font-medium text-gray-900">{option.label}</div>
              {option.description && (
                <div className="text-sm text-gray-600 mt-1">{option.description}</div>
              )}
            </div>
          </label>
        ))}
      </div>

      {formData.selectedServices.length === 0 && (
        <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded-md">
          Veuillez sélectionner au moins un service pour continuer.
        </div>
      )}
    </div>
  );
};

export default FreelanceServicesStep;
