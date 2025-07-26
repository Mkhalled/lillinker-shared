'use client';

import { useModalNavigation } from '../../../hooks/useModalNavigation';

export const useFreelanceNavigation = (totalSteps: number = 8, onFormDataExpired?: () => void) => {
  return useModalNavigation({
    totalSteps,
    storageKey: 'freelance-modal-step',
    formDataKey: 'freelance-modal-data',
    onFormDataExpired,
  });
};
