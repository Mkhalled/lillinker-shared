'use client';

import { useState, useEffect } from 'react';

import type { CompanyFormData } from '../../../types/company';
import type { NewService } from '../../../types/user';

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
          formData.description &&
          !siretExists
        );
        // Portage selection is optional even if company is portage
        return basicValid;
      }
      case 2:
        // Consultants and management fee step
        return !!(formData.consultantCount && formData.managementFeeRate);
      case 3:
        // Metiers selection step
        return formData.selectedMetiers.length > 0;
      case 4:
        // Admin step validation (includes email uniqueness check)
        return isAdminStepValid && !emailExists;
      case 5: {
        // Services step validation
        const hasSelectedServices = formData.selectedPlatformServices.length > 0;
        const hasValidNewServices = formData.newServices.some(
          (service: NewService) =>
            service.label.trim() !== '' &&
            (!service.requiresData ||
              (service.dataLabel.trim() !== '' && service.dataType.trim() !== ''))
        );
        return hasSelectedServices || hasValidNewServices;
      }
      case 6:
        // Recap step is always valid
        return true;
      case 7:
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
