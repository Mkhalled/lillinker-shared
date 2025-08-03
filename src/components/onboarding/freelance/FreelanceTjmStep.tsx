'use client';

import type { FreelanceFormData, FreelanceRequestData } from '../../../types/freelance';
import InputField from '../../form/input/InputField';

interface FreelanceTjmStepProps {
  formData: FreelanceFormData | FreelanceRequestData;
  setFormData: (updater: (prev: any) => any) => void;
}

export const FreelanceTjmStep = ({ formData, setFormData }: FreelanceTjmStepProps) => {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputField
            id="tjm"
            type="number"
            label="TJM souhaité (€)"
            value={formData.tjm}
            onChange={e =>
              setFormData((prev: FreelanceFormData) => ({ ...prev, tjm: e.target.value }))
            }
            placeholder="500"
            min="0"
            step="10"
            required
          />
          <InputField
            id="day"
            type="number"
            label="Nombre de jours par semaine"
            value={formData.days}
            onChange={e =>
              setFormData((prev: FreelanceFormData) => ({ ...prev, days: e.target.value }))
            }
            placeholder="5"
            min="1"
            max="7"
            step="0.5"
            required
          />
        </div>
      </div>
    </div>
  );
};

export default FreelanceTjmStep;
