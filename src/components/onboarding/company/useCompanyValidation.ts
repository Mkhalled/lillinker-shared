'use client';

import { useState, useEffect } from 'react';

import type { NewServiceData } from '@/types/platform';

import type { CompanyFormData } from '../../../types/company';

export const useCompanyValidation = (
  formData: CompanyFormData,
  currentStep: number,
  siretExists: boolean,
  isAdminStepValid: boolean
) => {
  const [emailExists, setEmailExists] = useState(false);

  const isValidEmail = (email: string): boolean => {
    const basicEmailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return basicEmailRegex.test(email);
  };

  const checkEmailExists = async (email: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/check-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        const data = await response.json();
        return data.exists;
      }
      return false;
    } catch (error) {
      console.error('Error checking email:', error);
      return false;
    }
  };

  useEffect(() => {
    const checkEmail = async () => {
      if (!formData.adminEmail || !isValidEmail(formData.adminEmail)) {
        setEmailExists(false);
        return;
      }

      const exists = await checkEmailExists(formData.adminEmail);
      setEmailExists(exists);
    };

    // ✅ Now the Admin step is step 6
    if (currentStep === 6) {
      checkEmail();
    }
  }, [formData.adminEmail, currentStep]);

  const isStepValid = (): boolean => {
    switch (currentStep) {
      case 1: {
        // General info validation
        return !!(formData.companyName && formData.siret && !siretExists);
      }
      case 2: {
        // Juridique step
        return true;
      }
      case 3:
        // Portage step (optional, always valid)
        return true;
      case 4:
        // Consultants step
        return !!formData.consultantCount;
      case 5:
        // Metiers step
        return formData.selectedMetiers.length > 0;
      case 6:
        // Admin step
        return isAdminStepValid && !emailExists;
      case 7: {
        // Services step
        const hasSelectedServices = formData.selectedPlatformServices.length > 0;
        const hasValidNewServices = (formData.newServices as NewServiceData[]).some((service) => {
          if (!service.service_label || service.service_label.trim() === '') return false;

          if (service.requires_data) {
            const dataFields = service.dataFields || [];
            return (
              dataFields.length > 0 &&
              dataFields.every((field) => {
                return (
                  field.label &&
                  field.label.trim() !== '' &&
                  // RADIO/SELECT require at least 2 choices
                  (field.data_type !== 'RADIO' && field.data_type !== 'SELECT' ||
                    (field.choices && field.choices.filter(c => c.trim() !== '').length >= 2))
                );
              })
            );
          }
          return true;
        });
        return hasSelectedServices || hasValidNewServices;
      }
      case 8:
        // Recap always valid
        return true;
      case 9:
        // Success always valid
        return true;
      default:
        return false;
    }
  };

  return {
    isStepValid,
    emailExists,
    isValidEmail,
  };
};
