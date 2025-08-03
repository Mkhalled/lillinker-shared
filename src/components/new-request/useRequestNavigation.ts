'use client';

import { useModalNavigation } from '../../hooks/useModalNavigation';

export const useRequestNavigation = (totalSteps: number = 6, onFormDataExpired?: () => void) => {
  return useModalNavigation({
    totalSteps,
    storageKey: 'request-modal-step',
    formDataKey: 'request-modal-data',
    onFormDataExpired,
  });
};
