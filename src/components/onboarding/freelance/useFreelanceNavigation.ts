'use client';

import { useModalNavigation } from '../../../hooks/useModalNavigation';

export const useFreelanceNavigation = (totalSteps: number = 6) => {
  return useModalNavigation({
    totalSteps,
    storageKey: 'freelance-modal-step',
    hasSubSteps: true,
    subStepConfig: {
      parentStep: 2,
      totalSubSteps: 3,
      subStorageKey: 'freelance-modal-mission-step'
    }
  });
};
