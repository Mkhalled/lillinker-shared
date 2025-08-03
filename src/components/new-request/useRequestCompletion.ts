'use client';

import { useState } from 'react';

import { FreelanceRequest } from '@/types/freelance';

export const useRequestCompletion = (
  formData: FreelanceRequest,
  clearFormData: () => void,
  goToNextStep: () => void
) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleComplete = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Get the most up-to-date form data from localStorage
      let currentFormData = formData;
      if (typeof window !== 'undefined') {
        const savedData = localStorage.getItem('request-modal-data');
        if (savedData) {
          try {
            currentFormData = JSON.parse(savedData);
          } catch (error) {
            console.error('Error parsing saved form data during submission:', error);
          }
        }
      }

      // Create new freelance request using authenticated user's ID
      const requestData = {
        mission_status: currentFormData.hasMission === 'yes' ? 'OPEN' : 'PENDING',
        priority: currentFormData.priority,
        tjm: parseFloat(currentFormData.tjm) || 1,
        days: parseFloat(currentFormData.days) || 0.5,
        wants_portage: currentFormData.wantsPortage === 'yes',
        selected_portages:
          currentFormData.wantsPortage === 'yes'
            ? currentFormData.selectedPortages.map((id: string) => parseInt(id))
            : [],
        selected_services: currentFormData.selectedServices,
        // Only include client fields if they have values
        ...(currentFormData.clientName && { client_name: currentFormData.clientName }),
        ...(currentFormData.clientAddress && { client_address: currentFormData.clientAddress }),
        ...(currentFormData.clientSector && { client_sector: currentFormData.clientSector }),
      };

      const response = await fetch('/api/freelance/nouvelle-demande', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Échec de la création de la demande');
      }

      // Show success step first
      goToNextStep();
      // Then clear form data
      clearFormData();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    setError,
    handleComplete,
  };
};
