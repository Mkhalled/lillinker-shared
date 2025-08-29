'use client';

import { useState } from 'react';

import type { FreelanceFormData } from '../../../types/freelance';

export const useFreelanceCompletion = (
  formData: FreelanceFormData,
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
        const savedData = localStorage.getItem('freelance-modal-data');
        if (savedData) {
          try {
            currentFormData = JSON.parse(savedData);
          } catch (error) {
            console.error('Error parsing saved form data during submission:', error);
          }
        }
      }

      // Step 1: Initial registration (create user)
      const signupResponse = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          first_name: currentFormData.firstName,
          last_name: currentFormData.lastName,
          email: currentFormData.email,
          role: 'FREELANCE',
          phone_number: currentFormData.phone,
          sex: currentFormData.sex,
        }),
      });

      if (!signupResponse.ok) {
        const errorData = await signupResponse.json();
        throw new Error(errorData.error || 'Registration failed');
      }

      const signupData = await signupResponse.json();

      // Step 2: Freelance onboarding
      const onboardingData = {
        userId: signupData.userId,
        metier_id: currentFormData.metierId,
        mission_status: currentFormData.hasMission === 'yes' ? 'OPEN' : 'PENDING',
        priority: currentFormData.priority,
        tjm: parseFloat(currentFormData.tjm) || 1,
        days: parseFloat(currentFormData.days) || 0.5,
        wants_portage: currentFormData.wantsPortage === 'yes',
        selected_portages:
          currentFormData.wantsPortage === 'yes'
            ? currentFormData.selectedPortages.map((id: string) => parseInt(id))
            : [],
        selected_services: currentFormData.selectedServices.map(service => ({
          serviceId: service.serviceId,
          isRequired: service.isRequired,
          responseData: service.responseData || {},
        })),
        // Salary preferences
        want_salaried: currentFormData.wantSalaried || false,
        ...(currentFormData.salary !== undefined &&
          currentFormData.salary !== null && { salary: currentFormData.salary }),
        ...(currentFormData.startDate && {
          start_date:
            currentFormData.startDate instanceof Date
              ? currentFormData.startDate.toISOString()
              : new Date(currentFormData.startDate).toISOString(),
        }),
        // Only include client fields if they have values
        ...(currentFormData.clientName && { client_name: currentFormData.clientName }),
        ...(currentFormData.clientAddress && { client_address: currentFormData.clientAddress }),
        ...(currentFormData.clientSector && { client_sector: currentFormData.clientSector }),
      };

      const onboardingResponse = await fetch('/api/auth/onboarding/freelance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(onboardingData),
      });

      if (!onboardingResponse.ok) {
        const errorData = await onboardingResponse.json();
        throw new Error(errorData.error || 'Freelance onboarding failed');
      }

      // Clear form data on successful completion
      clearFormData();
      // Show success step
      goToNextStep();
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
