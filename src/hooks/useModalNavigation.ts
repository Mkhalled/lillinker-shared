'use client';

import { useState, useEffect, useCallback } from 'react';

interface UseModalNavigationProps {
  totalSteps: number;
  storageKey: string;
  formDataKey?: string; // Optional key for form data that should also be cleared on expiration
  onFormDataExpired?: () => void; // Callback to reset form state when data expires
}

export const useModalNavigation = ({
  totalSteps,
  storageKey,
  formDataKey,
  onFormDataExpired
}: UseModalNavigationProps) => {
  // Expiration time: 4 hours in milliseconds
  const EXPIRATION_TIME = 4 * 60 * 60 * 1000; // 4 hours in milliseconds

  // Helper function to check if localStorage data is expired
  const isDataExpired = useCallback((timestamp: string): boolean => {
    const now = Date.now();
    const savedTime = parseInt(timestamp, 10);
    return now - savedTime > EXPIRATION_TIME;
  }, [EXPIRATION_TIME]);

  // Helper function to clear expired data
  const clearExpiredData = useCallback(() => {
    localStorage.removeItem(storageKey);
    localStorage.removeItem(`${storageKey}_timestamp`);
    if (formDataKey) {
      localStorage.removeItem(formDataKey);
    }
    // Reset form state if callback is provided
    if (onFormDataExpired) {
      onFormDataExpired();
    }
  }, [storageKey, formDataKey, onFormDataExpired]);

  // Initialize currentStep with localStorage data if available and not expired
  const [currentStep, setCurrentStep] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedStep = localStorage.getItem(storageKey);
      const savedTimestamp = localStorage.getItem(`${storageKey}_timestamp`);
      
      if (savedStep && savedTimestamp) {
        // Check if data is expired
        if (isDataExpired(savedTimestamp)) {
          // Data is expired, clear it and return to step 1
          clearExpiredData();
          return 1;
        }
        
        const step = parseInt(savedStep, 10);
        if (step >= 1 && step <= totalSteps) {
          return step;
        }
      }
    }
    return 1;
  });

  // Save current step to localStorage whenever currentStep changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const timestamp = Date.now().toString();
      localStorage.setItem(storageKey, currentStep.toString());
      localStorage.setItem(`${storageKey}_timestamp`, timestamp);
    }
  }, [currentStep, storageKey]);

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (step: number) => {
    if (step >= 1 && step <= totalSteps) {
      setCurrentStep(step);
    }
  };

  const goToNextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const clearStepProgress = () => {
    setCurrentStep(1);
    if (typeof window !== 'undefined') {
      clearExpiredData();
    }
  };

  return {
    currentStep,
    handleNext,
    handlePrevious,
    goToStep,
    goToNextStep,
    goToPreviousStep,
    clearStepProgress,
    isFirstStep: currentStep === 1,
    isLastStep: currentStep === totalSteps
  };
};
