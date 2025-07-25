'use client';

import { useState, useEffect } from 'react';

import type { PlatformService } from '../../../hooks/useModalData';
import type { FreelanceFormData } from '../../../types/freelance';

export const useFreelanceValidation = (
  formData: FreelanceFormData,
  currentStep: number,
  platformServices: PlatformService[]
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

  // Check email existence when email changes
  useEffect(() => {
    const checkEmail = async () => {
      if (!formData.email || !isValidEmail(formData.email)) {
        setEmailExists(false);
        return;
      }

      try {
        const exists = await checkEmailExists(formData.email);
        setEmailExists(exists);
      } catch (error) {
        console.error('Error checking email existence:', error);
        setEmailExists(false);
      }
    };

    // Debounce the email check
    const timeoutId = setTimeout(checkEmail, 500);
    return () => clearTimeout(timeoutId);
  }, [formData.email]);

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.firstName && 
               formData.lastName && 
               formData.email && 
               formData.phone && 
               formData.metierId > 0 &&
               isValidEmail(formData.email) &&
               !emailExists;
      case 2:
        return formData.hasMission; // Must select a mission status
      case 3:
        // Portage step is always valid regardless of selection
        return true;
      case 4:
        // Must have TJM and days
        return formData.tjm && 
               parseFloat(formData.tjm) >= 1 && 
               formData.days && 
               parseFloat(formData.days) >= 0.5;
      case 5: {
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
      case 6:
        return formData.priority;
      case 7:
        return true; // Recap step is always valid and ready for submission
      case 8:
        return true;
      default:
        return false;
    }
  };

  return {
    emailExists,
    isValidEmail,
    checkEmailExists,
    isStepValid,
  };
};
