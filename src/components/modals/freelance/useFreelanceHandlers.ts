'use client';

import type { FreelanceFormData } from '../../../types/freelance';
import type { SelectedService } from '../../../types/user';

export const useFreelanceHandlers = (
  setFormData: (updater: (prev: FreelanceFormData) => FreelanceFormData) => void
) => {
  const handleServiceToggle = (serviceId: number) => {
    setFormData((prev: FreelanceFormData) => {
      const existingServiceIndex = prev.selectedServices.findIndex((s: SelectedService) => s.serviceId === serviceId);
      
      if (existingServiceIndex >= 0) {
        // Remove service
        return {
          ...prev,
          selectedServices: prev.selectedServices.filter((s: SelectedService) => s.serviceId !== serviceId)
        };
      } else {
        // Add service
        return {
          ...prev,
          selectedServices: [...prev.selectedServices, { serviceId, isRequired: false }]
        };
      }
    });
  };

  const handleServiceRequiredChange = (serviceId: number, isRequired: boolean) => {
    setFormData((prev: FreelanceFormData) => ({
      ...prev,
      selectedServices: prev.selectedServices.map((s: SelectedService) => 
        s.serviceId === serviceId ? { ...s, isRequired } : s
      )
    }));
  };

  const handleServiceDataChange = (serviceId: number, value: string) => {
    setFormData((prev: FreelanceFormData) => ({
      ...prev,
      selectedServices: prev.selectedServices.map((s: SelectedService) => 
        s.serviceId === serviceId ? { ...s, responseData: value } : s
      )
    }));
  };

  const handlePortageToggle = (portageId: number) => {
    const portageIdStr = portageId.toString();
    setFormData((prev: FreelanceFormData) => ({
      ...prev,
      selectedPortages: prev.selectedPortages.includes(portageIdStr)
        ? prev.selectedPortages.filter((id: string) => id !== portageIdStr)
        : [...prev.selectedPortages, portageIdStr]
    }));
  };

  // Helper function to parse choices from service.choices
  const parseChoices = (choices: unknown) => {
    if (!choices) return [];
    if (typeof choices === 'string') {
      try {
        return JSON.parse(choices);
      } catch {
        return [choices];
      }
    }
    if (Array.isArray(choices)) return choices;
    return [];
  };

  // Handle multiple selections for SELECT type
  const handleMultipleSelectChange = (serviceId: number, option: string, isChecked: boolean) => {
    setFormData((prev: FreelanceFormData) => {
      const service = prev.selectedServices.find((s: SelectedService) => s.serviceId === serviceId);
      if (!service) return prev;
      
      let currentSelections = service.responseData ? service.responseData.split(',').filter((s: string) => s.trim() !== '') : [];
      
      if (isChecked) {
        if (!currentSelections.includes(option)) {
          currentSelections.push(option);
        }
      } else {
        currentSelections = currentSelections.filter((s: string) => s !== option);
      }
      
      return {
        ...prev,
        selectedServices: prev.selectedServices.map((s: SelectedService) => 
          s.serviceId === serviceId ? { ...s, responseData: currentSelections.join(',') } : s
        )
      };
    });
  };

  return {
    handleServiceToggle,
    handleServiceRequiredChange,
    handleServiceDataChange,
    handlePortageToggle,
    parseChoices,
    handleMultipleSelectChange,
  };
};
