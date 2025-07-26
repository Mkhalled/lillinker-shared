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
  nextButtonText = 'Suivant',
  completionStep,
  onClearProgress,
}: ModalWrapperProps) => {
  const isCompletionStep = currentStep === totalSteps;
  const isCompleteStep = completionStep
    ? currentStep === completionStep
    : currentStep === totalSteps - 1;

  return (
    <div className="w-full h-full flex flex-col">
      <div className="bg-white flex-1 flex flex-col max-h-full overflow-hidden sm:rounded-lg sm:shadow-lg">
        <div className="flex-1 flex flex-col p-4 sm:p-6 overflow-y-auto">
          <ModalHeader
            title={title}
            currentStep={currentStep}
            totalSteps={totalSteps}
            onClose={onClose}
            onClearProgress={onClearProgress}
          />

          <ProgressBar currentStep={currentStep} totalSteps={totalSteps} />

          <div className="flex-1 flex flex-col min-h-0">
            <StepContent stepTitle={stepTitle} stepDescription={stepDescription} error={error}>
              {children}
            </StepContent>
          </div>

          {showNavigation && (
            <div className="mt-auto pt-4 border-t border-gray-100">
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
