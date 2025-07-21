'use client';

import { ChevronLeft, ChevronRight, X } from 'lucide-react';

import { Button } from '../ui/button/Button';

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
  completionStep?: number; // New prop to specify which step triggers completion
  onClearProgress?: () => void; // New prop for clearing progress
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
  completionStep, // New prop
  onClearProgress // New prop
}: ModalWrapperProps) => {
  const isCompletionStep = currentStep === totalSteps;
  const isCompleteStep = completionStep ? currentStep === completionStep : currentStep === totalSteps - 1;

  const handleNextClick = () => {
    if (isCompleteStep && onComplete) {
      onComplete();
    } else if (onNext) {
      onNext();
    }
  };

  return (
    <div className="w-full">
      <div className="bg-white">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">L</span>
              </div>
              <span className="text-xl font-bold text-gray-900">{title}</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                Étape {currentStep} sur {totalSteps}
              </span>
              {onClearProgress && currentStep > 1 && (
                <button
                  onClick={onClearProgress}
                  className="text-xs text-red-600 hover:text-red-700 px-2 py-1 border border-red-300 rounded hover:bg-red-50 transition-colors"
                  title="Recommencer depuis le début"
                >
                  Recommencer
                </button>
              )}
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Step Title and Description */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{stepTitle}</h2>
            <p className="text-gray-600">{stepDescription}</p>
          </div>

          {/* Content */}
          <div className="mb-8">
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}
            {children}
          </div>

          {/* Navigation */}
          {showNavigation && !isCompletionStep && (
            <div className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={onPrevious} 
                disabled={currentStep === 1 || isLoading}
                className="flex items-center space-x-2"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Précédent</span>
              </Button>

              {currentStep < totalSteps && !isCompletionStep ? (
                <Button 
                  onClick={handleNextClick} 
                  disabled={!isStepValid || isLoading}
                  className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <span>{isCompleteStep ? completeButtonText : nextButtonText}</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              ) : !isCompletionStep ? (
                <Button 
                  onClick={handleNextClick}
                  disabled={!isStepValid || isLoading}
                  className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Inscription en cours...</span>
                    </>
                  ) : (
                    <>
                      <span>{completeButtonText}</span>
                      <ChevronRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              ) : null}
            </div>
          )}

          {isCompletionStep && (
            <div className="flex justify-center">
              <Button 
                onClick={onClose}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8"
              >
                Fermer
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
