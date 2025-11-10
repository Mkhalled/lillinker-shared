'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '../../ui/button/Button';

interface NavigationButtonsProps {
  currentStep: number;
  totalSteps: number;
  isStepValid: boolean;
  isLoading: boolean;
  isCompletionStep: boolean;
  isCompleteStep: boolean;
  onNext?: () => void;
  onPrevious?: () => void;
  onComplete?: () => void;
  onClose: () => void;
  completeButtonText?: string;
  nextButtonText?: string;
}

export const NavigationButtons = ({
  currentStep,
  totalSteps,
  isStepValid,
  isLoading,
  isCompletionStep,
  isCompleteStep,
  onNext,
  onPrevious,
  onComplete,
  onClose,
  completeButtonText,
  nextButtonText,
}: NavigationButtonsProps) => {
  const t = useTranslations('onboarding.common');

  const handleNextClick = () => {
    if (isCompleteStep && onComplete) {
      onComplete();
    } else if (onNext) {
      onNext();
    }
  };

  const isFirstStep = currentStep === 1;
  const canGoNext = currentStep < totalSteps && !isCompletionStep;
  const isDisabled = !isStepValid || isLoading;

  // Completion step - just close button
  if (isCompletionStep) {
    return (
      <div className="flex justify-center">
        <Button
          onClick={onClose}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 sm:px-8 w-full sm:w-auto"
        >
          Fermer
        </Button>
      </div>
    );
  }

  // Normal navigation
  return (
    <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-0">
      {/* Previous Button */}
      <Button
        variant="outline"
        onClick={onPrevious}
        disabled={isFirstStep || isLoading}
        className="flex items-center justify-center space-x-2 w-full sm:w-auto order-2 sm:order-1"
        aria-label={t('previous')}
      >
        <ChevronLeft className="h-4 w-4" />
        <span>{t('previous')}</span>
      </Button>

      {/* Next/Complete Button */}
      {canGoNext || !isCompletionStep ? (
        <NextButton
          onClick={handleNextClick}
          disabled={isDisabled}
          isLoading={isLoading}
          isCompleteStep={isCompleteStep}
          completeButtonText={completeButtonText || t('complete')}
          nextButtonText={nextButtonText || t('next')}
        />
      ) : null}
    </div>
  );
};

interface NextButtonProps {
  onClick: () => void;
  disabled: boolean;
  isLoading: boolean;
  isCompleteStep: boolean;
  completeButtonText: string;
  nextButtonText: string;
}

const NextButton = ({
  onClick,
  disabled,
  isLoading,
  isCompleteStep,
  completeButtonText,
  nextButtonText,
}: NextButtonProps) => {
  const t = useTranslations('onboarding.common');
  const buttonText = isCompleteStep ? completeButtonText : nextButtonText;
  const ariaLabel = isCompleteStep ? completeButtonText : nextButtonText;

  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto order-1 sm:order-2"
      aria-label={ariaLabel}
    >
      {isLoading ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
          <span>{t('loading')}</span>
        </>
      ) : (
        <>
          <span>{buttonText}</span>
          <ChevronRight className="h-4 w-4" />
        </>
      )}
    </Button>
  );
};
