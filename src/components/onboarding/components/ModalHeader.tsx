'use client';

import { X } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface ModalHeaderProps {
  title: string;
  currentStep: number;
  totalSteps: number;
  onClose: () => void;
  onClearProgress?: () => void;
  showRestartButton?: boolean;
}

export const ModalHeader = ({
  title,
  currentStep,
  totalSteps,
  onClose,
  onClearProgress,
  showRestartButton = true,
}: ModalHeaderProps) => {
  const t = useTranslations('onboarding.common');
  const canRestart = showRestartButton && onClearProgress && currentStep > 1;

  return (
    <div className="flex items-center justify-between mb-4 sm:mb-6">
      <div className="flex items-center space-x-2">
        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-600 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-xs sm:text-sm">L</span>
        </div>
        <span className="text-lg sm:text-xl font-bold text-gray-900 truncate">{title}</span>
      </div>

      <div className="flex items-center space-x-2 sm:space-x-4">
        <span className="text-xs sm:text-sm text-gray-500 whitespace-nowrap">
          {currentStep}/{totalSteps}
        </span>

        {canRestart && (
          <button
            onClick={onClearProgress}
            className="hidden sm:block text-xs text-red-600 hover:text-red-700 px-2 py-1 border border-red-300 rounded hover:bg-red-50 transition-colors"
            title={t('restartTitle')}
            aria-label={t('restartTitle')}
          >
            {t('restart')}
          </button>
        )}

        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Fermer la modal"
        >
          <X className="h-6 w-6" />
        </button>
      </div>
    </div>
  );
};
