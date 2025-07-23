'use client';

import { useModalNavigation } from '../../../hooks/useModalNavigation';

export const useStepNavigation = (totalSteps: number = 7) => {
  return useModalNavigation({
    totalSteps,
    storageKey: 'company-modal-step'
  });
};
