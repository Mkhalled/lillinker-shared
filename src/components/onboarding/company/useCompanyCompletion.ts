'use client';

import { useState } from 'react';

import { NewServiceData } from '@/types/platform';

import type { CompanyFormData } from '../../../types/company';

export const useCompanyCompletion = (
  formData: CompanyFormData,
  clearFormData: () => void,
  goToNextStep: () => void,
  clearStepProgress: () => void
) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setErrorState = (errorMessage: string | null) => {
    setError(errorMessage);
  };

  const handleComplete = async (currentStep: number) => {
    if (currentStep === 7) {
      setIsLoading(true);
      setError(null);

      try {
        // Get the most up-to-date form data from localStorage
        let currentFormData = formData;
        if (typeof window !== 'undefined') {
          const savedData = localStorage.getItem('company-modal-data');
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
            first_name: currentFormData.adminFirstName,
            last_name: currentFormData.adminLastName,
            email: currentFormData.adminEmail,
            role: 'COMPANY',
            phone_number: currentFormData.adminPhone,
            sex: currentFormData.adminSex,
          }),
        });

        if (!signupResponse.ok) {
          const errorData = await signupResponse.json();
          throw new Error(errorData.error || 'Registration failed');
        }

        const signupData = await signupResponse.json();

        // Step 2: Company onboarding
        const onboardingData = {
          userId: signupData.userId,
          company_name: currentFormData.companyName,
          company_description: currentFormData.description,
          siret: currentFormData.siret,
          consultant_count: parseInt(currentFormData.consultantCount),
          management_fees: parseFloat(currentFormData.managementFeeRate),
          is_portage: currentFormData.isPortage === 'yes',
          selected_services: currentFormData.selectedPlatformServices.map((id: string) =>
            parseInt(id)
          ),
          selected_metiers: currentFormData.selectedMetiers.map((id: string) => parseInt(id)),
          selected_portages:
            currentFormData.isPortage === 'yes'
              ? currentFormData.selectedPortages.map((id: string) => parseInt(id))
              : [],
          // Fixed new services mapping
          new_services: currentFormData.newServices
            .filter((service: NewServiceData) => service.service_label && service.service_label.trim() !== '')
            .map((service: NewServiceData) => ({
              service_label: service.service_label,
              service_description: service.service_description,
              requires_data: service.requires_data,
              dataFields: service.requires_data && service.dataFields ? 
                service.dataFields.map(field => ({
                  label: field.label,
                  description: field.description,
                  data_type: field.data_type,
                  choices: field.choices?.filter((choice: string) => choice.trim() !== '') || undefined,
                })) : undefined,
            })),
        };

        const onboardingResponse = await fetch('/api/auth/onboarding/company', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(onboardingData),
        });

        if (!onboardingResponse.ok) {
          const errorData = await onboardingResponse.json();
          throw new Error(errorData.error || 'Company onboarding failed');
        }

        // Clear localStorage on successful completion
        clearFormData();
        clearStepProgress();

        // Move to success step
        goToNextStep();
      } catch (error) {
        console.error('Registration error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Une erreur est survenue';

        // Provide more specific error messages for common cases
        if (errorMessage.includes('SIRET') && errorMessage.includes('existe déjà')) {
          setError(
            'Ce numéro SIRET est déjà utilisé par une autre société. Veuillez vérifier votre numéro SIRET.'
          );
        } else if (errorMessage.includes('Unique constraint') && errorMessage.includes('siret')) {
          setError('Ce numéro SIRET est déjà utilisé. Veuillez vérifier votre numéro SIRET.');
        } else {
          setError(errorMessage);
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  return {
    isLoading,
    error,
    setError: setErrorState,
    handleComplete,
  };
};