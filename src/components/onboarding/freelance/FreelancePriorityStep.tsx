'use client';

import type { FreelanceFormData, FreelanceRequestData } from '../../../types/freelance';
import { StyledRadio } from '../../form/StyledRadio';

interface FreelancePriorityStepProps {
  formData: FreelanceFormData | FreelanceRequestData;
  setFormData: (updater: (prev: any) => any) => void;
}

export const FreelancePriorityStep = ({ formData, setFormData }: FreelancePriorityStepProps) => {
  const priorities = [
    { value: 'HIGH', label: 'Urgent (dans la semaine)', color: 'text-red-600' },
    { value: 'MEDIUM', label: 'Priorité moyenne (dans les 3 mois)', color: 'text-yellow-600' },
    { value: 'LOW', label: "Pas urgent (quand c'est possible)", color: 'text-green-600' },
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        {priorities.map(priority => (
          <StyledRadio
            key={priority.value}
            name="priority"
            value={priority.value}
            checked={formData.priority === priority.value}
            onChange={e =>
              setFormData((prev: FreelanceFormData) => ({ ...prev, priority: e.target.value }))
            }
            label={priority.label}
            labelClassName={priority.color}
          />
        ))}
      </div>

      {!formData.priority && (
        <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded-md">
          Veuillez sélectionner une priorité pour continuer.
        </div>
      )}
    </div>
  );
};

export default FreelancePriorityStep;
