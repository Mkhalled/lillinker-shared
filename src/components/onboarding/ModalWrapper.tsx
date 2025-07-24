'use client';

import { ProgressBar, ModalHeader, StepContent, NavigationButtons } from './components';

interface ModalWrapperProps {
  children: React.ReactNode;
  onClose: () => void;
  title: string;
  currentStep: number;
  totalSteps: number;
  stepTitle: string;
  stepDescription: string;
  onNext?: () => void;
  onPrevious?: () => void;
  onComplete?: () => void;
  isStepValid: boolean;
  isLoading: boolean;
  error?: string | null;
  showNavigation?: boolean;
  completeButtonText?: string;
  nextButtonText?: string;
  completionStep?: number;
  onClearProgress?: () => void;
}

export const ModalWrapper = ({
  children,
  onClose,
  title,
  currentStep,
  totalSteps,
  stepTitle,
  stepDescription,
  onNext,
  onPrevious,
  onComplete,
  isStepValid,
  isLoading,
  error,
  showNavigation = true,
  completeButtonText = "Finaliser l'inscription",
  nextButtonText = "Suivant",
  completionStep,
  onClearProgress
}: ModalWrapperProps) => {
  const isCompletionStep = currentStep === totalSteps;
  const isCompleteStep = completionStep ? currentStep === completionStep : currentStep === totalSteps - 1;

  return (
    <div className="w-full">
      <div className="bg-white">
        <div className="p-6">
          <ModalHeader
            title={title}
            currentStep={currentStep}
            totalSteps={totalSteps}
            onClose={onClose}
            onClearProgress={onClearProgress}
          />

          <ProgressBar
            currentStep={currentStep}
            totalSteps={totalSteps}
          />

          <StepContent
            stepTitle={stepTitle}
            stepDescription={stepDescription}
            error={error}
          >
            {children}
          </StepContent>

          {showNavigation && (
            <NavigationButtons
              currentStep={currentStep}
              totalSteps={totalSteps}
              isStepValid={isStepValid}
              isLoading={isLoading}
              isCompletionStep={isCompletionStep}
              isCompleteStep={isCompleteStep}
              onNext={onNext}
              onPrevious={onPrevious}
              onComplete={onComplete}
              onClose={onClose}
              completeButtonText={completeButtonText}
              nextButtonText={nextButtonText}
            />
          )}
        </div>
      </div>
    </div>
  );
};
