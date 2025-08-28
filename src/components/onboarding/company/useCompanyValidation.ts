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

  // Basic email validation function
  const isValidEmail = (email: string): boolean => {
    const basicEmailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return basicEmailRegex.test(email);
  };

  // Function to check if email exists
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

  // Check email existence when admin email changes
  useEffect(() => {
    const checkEmail = async () => {
      if (!formData.adminEmail || !isValidEmail(formData.adminEmail)) {
        setEmailExists(false);
        return;
      }

      const exists = await checkEmailExists(formData.adminEmail);
      setEmailExists(exists);
    };

    // Only check email on step 4 (admin step)
    if (currentStep === 4) {
      checkEmail();
    }
  }, [formData.adminEmail, currentStep]);

  const isStepValid = (): boolean => {
    switch (currentStep) {
      case 1: {
        // General info step validation
        const basicValid = !!(
          formData.companyName &&
          formData.siret &&
          !siretExists
        );
        return basicValid;
      }
      case 2:
        // Portage step is always valid (not required)
        return true;
      case 3:
        // Consultants and management fee step
        return !!(formData.consultantCount);
      case 4:
        // Metiers selection step
        return formData.selectedMetiers.length > 0;
      case 5:
        // Admin step validation (includes email uniqueness check)
        return isAdminStepValid && !emailExists;
      case 6: {
        // Services step validation
        const hasSelectedServices = formData.selectedPlatformServices.length > 0;
        const hasValidNewServices = (formData.newServices as NewServiceData[]).some((service) => {
          // Check if service_label is defined and not empty
          if (!service.service_label || service.service_label.trim() === '') {
            return false;
          }

          // If requires_data is true, validate dataFields
          if (service.requires_data) {
            const dataFields = service.dataFields || [];
            return (
              dataFields.length > 0 &&
              dataFields.every((field) => {
                return (
                  field.label &&
                  field.label.trim() !== '' &&
                  // For RADIO or SELECT, ensure at least 2 non-empty choices
                  (field.data_type !== 'RADIO' && field.data_type !== 'SELECT' ||
                    (field.choices && field.choices.filter(c => c.trim() !== '').length >= 2))
                );
              })
            );
          }

          // If requires_data is false, service is valid if service_label is valid
          return true;
        });
        return hasSelectedServices || hasValidNewServices;
      }
      case 7:
        // Recap step is always valid
        return true;
      case 8:
        // Success step is always valid
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