'use client';

import type { PlatformService } from '@/types/platform';

import type { FreelanceRequest } from '../../types/freelance';

export const useRequestValidation = (
  formData: FreelanceRequest,
  currentStep: number,
  platformServices: PlatformService[]
) => {
  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.hasMission; // Must select a mission status
      case 2:
        // Portage step is always valid regardless of selection
        return true;
      case 3:
        // Must have TJM and days
        return (
          formData.tjm &&
          parseFloat(formData.tjm) >= 1 &&
          formData.days &&
          parseFloat(formData.days) >= 0.5
        );
      case 4: {
        // Services step validation
        // If no services are selected, step is valid (services are optional)
        if (formData.selectedServices.length === 0) {
          return true;
        }

        // If services are selected, validate that required data is provided
        for (const selectedService of formData.selectedServices) {
          const service = platformServices.find(s => s.id === selectedService.serviceId);
          if (service?.requires_data) {
            // For services that require data, check if responseData is provided
            if (!selectedService.responseData || selectedService.responseData.trim() === '') {
              return false; // Data is required but not provided
            }
          }
        }
        return true;
      }
      case 5:
        return formData.priority;
      case 6:
        return true; // Recap step is always valid and ready for submission
      case 7:
        return true;
      default:
        return false;
    }
  };

  return {
    isStepValid,
  };
};
