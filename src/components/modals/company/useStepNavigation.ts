'use client';

import { useState, useEffect } from 'react';

export const useStepNavigation = (totalSteps: number = 7) => {
  // Initialize currentStep with localStorage data if available
  const [currentStep, setCurrentStep] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedStep = localStorage.getItem('company-modal-step');
      if (savedStep) {
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
      localStorage.setItem('company-modal-step', currentStep.toString());
    }
  }, [currentStep]);

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

  const goToStep = (step: number) => {
    if (step >= 1 && step <= totalSteps) {
      setCurrentStep(step);
    }
  };

  const clearStepProgress = () => {
    setCurrentStep(1);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('company-modal-step');
    }
  };

  return {
    currentStep,
    goToNextStep,
    goToPreviousStep,
    goToStep,
    clearStepProgress,
    isFirstStep: currentStep === 1,
    isLastStep: currentStep === totalSteps
  };
};
