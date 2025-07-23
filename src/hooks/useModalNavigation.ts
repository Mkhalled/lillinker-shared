'use client';

import { useState, useEffect } from 'react';

interface UseModalNavigationProps {
  totalSteps: number;
  storageKey: string;
  hasSubSteps?: boolean;
  subStepConfig?: {
    parentStep: number;
    totalSubSteps: number;
    subStorageKey: string;
  };
}

export const useModalNavigation = ({
  totalSteps,
  storageKey,
  hasSubSteps = false,
  subStepConfig
}: UseModalNavigationProps) => {
  // Initialize currentStep with localStorage data if available
  const [currentStep, setCurrentStep] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedStep = localStorage.getItem(storageKey);
      if (savedStep) {
        const step = parseInt(savedStep, 10);
        if (step >= 1 && step <= totalSteps) {
          return step;
        }
      }
    }
    return 1;
  });

  // Initialize subStep for sub-navigation (like mission steps)
  const [subStep, setSubStep] = useState(() => {
    if (hasSubSteps && subStepConfig && typeof window !== 'undefined') {
      const savedSubStep = localStorage.getItem(subStepConfig.subStorageKey);
      if (savedSubStep) {
        const step = parseInt(savedSubStep, 10);
        if (step >= 1 && step <= subStepConfig.totalSubSteps) {
          return step;
        }
      }
    }
    return 1;
  });

  // Save current step to localStorage whenever currentStep changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(storageKey, currentStep.toString());
    }
  }, [currentStep, storageKey]);

  // Save sub step to localStorage whenever subStep changes
  useEffect(() => {
    if (hasSubSteps && subStepConfig && typeof window !== 'undefined') {
      localStorage.setItem(subStepConfig.subStorageKey, subStep.toString());
    }
  }, [subStep, hasSubSteps, subStepConfig]);

  const handleNext = () => {
    // Handle sub-step navigation
    if (hasSubSteps && subStepConfig && currentStep === subStepConfig.parentStep && subStep < subStepConfig.totalSubSteps) {
      setSubStep(subStep + 1);
    } else if (currentStep < totalSteps) {
      // Reset sub-step when moving to next main step
      if (hasSubSteps && subStepConfig && currentStep === subStepConfig.parentStep) {
        setSubStep(1);
      }
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    // Handle sub-step navigation
    if (hasSubSteps && subStepConfig && currentStep === subStepConfig.parentStep && subStep > 1) {
      setSubStep(subStep - 1);
    } else if (currentStep > 1) {
      // Go back to last sub-step when coming from next main step
      if (hasSubSteps && subStepConfig && currentStep === subStepConfig.parentStep + 1) {
        setSubStep(subStepConfig.totalSubSteps);
      }
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
    setSubStep(1);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(storageKey);
      if (hasSubSteps && subStepConfig) {
        localStorage.removeItem(subStepConfig.subStorageKey);
      }
    }
  };

  return {
    currentStep,
    subStep,
    setSubStep,
    handleNext,
    handlePrevious,
    goToStep,
    goToNextStep,
    goToPreviousStep,
    clearStepProgress,
    isFirstStep: currentStep === 1,
    isLastStep: currentStep === totalSteps,
    // For backward compatibility
    missionStep: subStep,
    setMissionStep: setSubStep
  };
};
