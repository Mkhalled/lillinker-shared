'use client';

import { useModalNavigation } from '../../../hooks/useModalNavigation';

export const useFreelanceNavigation = (totalSteps: number = 8) => {
  return useModalNavigation({
    totalSteps,
    storageKey: 'freelance-modal-step',
    hasSubSteps: false
  });
};
