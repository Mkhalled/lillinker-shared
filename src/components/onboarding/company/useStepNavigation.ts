'use client';

import { useModalNavigation } from '../../../hooks/useModalNavigation';

export const useStepNavigation = (totalSteps: number = 8, onFormDataExpired?: () => void) => {
  return useModalNavigation({
    totalSteps,
    storageKey: 'company-modal-step',
    formDataKey: 'company-modal-data',
    onFormDataExpired,
  });
};
