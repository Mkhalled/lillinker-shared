'use client';

import type { FreelanceFormData, FreelanceRequestData } from '../../../types/freelance';
import InputField from '../../form/input/InputField';
import { StyledCheckbox } from '../../form/StyledCheckbox';

interface FreelanceTjmStepProps {
  formData: FreelanceFormData | FreelanceRequestData;
  setFormData: (
    updater: (
      prev: FreelanceFormData | FreelanceRequestData
    ) => FreelanceFormData | FreelanceRequestData
  ) => void;
}

export const FreelanceTjmStep = ({ formData, setFormData }: FreelanceTjmStepProps) => {
  // Calculate the maximum allowed salary (50% of TJM * days per month)
  const calculateMaxSalary = () => {
    const tjm = parseFloat(formData.tjm) || 0;
    const days = parseFloat(formData.days) || 0;
    const monthlyRevenue = tjm * days; // TJM * jours par mois
    return monthlyRevenue * 0.5; // 50% of monthly revenue
  };

  const maxSalary = calculateMaxSalary();
  const currentSalary = formData.salary || 0;
  const isSalaryTooHigh = formData.wantSalaried && currentSalary > maxSalary;

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
              setFormData((prev: FreelanceFormData | FreelanceRequestData) => ({
                ...prev,
                tjm: e.target.value,
              }))
            }
            placeholder="500"
            min="0"
            step="10"
            required
          />
          <InputField
            id="day"
            type="number"
            label="Nombre de jours par moi"
            value={formData.days}
            onChange={e =>
              setFormData((prev: FreelanceFormData | FreelanceRequestData) => ({
                ...prev,
                days: e.target.value,
              }))
            }
            placeholder="5"
            min="1"
            max="7"
            step="0.5"
            required
          />
        </div>

        {/* Want Salaried Section */}
        <div className="space-y-4">
          <StyledCheckbox
            name="wantSalaried"
            checked={formData.wantSalaried || false}
            onChange={e =>
              setFormData((prev: FreelanceFormData | FreelanceRequestData) => ({
                ...prev,
                wantSalaried: e.target.checked,
                // Reset salary if unchecked
                ...(e.target.checked ? {} : { salary: undefined }),
              }))
            }
            label="Je souhaite également un poste salarié"
          />

          {formData.wantSalaried && (
            <div className="space-y-2">
              <InputField
                id="salary"
                type="number"
                label="Salaire brute souhaité (€/mois)"
                value={formData.salary?.toString() || ''}
                onChange={e =>
                  setFormData((prev: FreelanceFormData | FreelanceRequestData) => ({
                    ...prev,
                    salary: e.target.value ? parseFloat(e.target.value) : undefined,
                  }))
                }
                placeholder="4000"
                min="0"
                max={maxSalary}
                step="100"
              />
              {isSalaryTooHigh && (
                <p className="text-sm text-red-600">
                  Le salaire ne peut pas dépasser 50% de votre revenus freelance (
                  {maxSalary.toLocaleString('fr-FR')}€/mois)
                </p>
              )}
              {maxSalary > 0 && !isSalaryTooHigh && (
                <p className="text-sm text-gray-500">
                  Maximum recommandé : {maxSalary.toLocaleString('fr-FR')}€/mois (50% de vos revenus
                  freelance)
                </p>
              )}
            </div>
          )}

          {/* Start Date Section */}
          <div className="space-y-2">
            <InputField
              id="startDate"
              type="date"
              label="Date de début souhaitée (optionnel)"
              value={
                formData.startDate ? new Date(formData.startDate).toISOString().split('T')[0] : ''
              }
              onChange={e =>
                setFormData((prev: FreelanceFormData | FreelanceRequestData) => ({
                  ...prev,
                  startDate: e.target.value ? new Date(e.target.value) : undefined,
                }))
              }
              min={new Date().toISOString().split('T')[0]}
              placeholder=""
            />
            <p className="text-sm text-gray-500">
              Indiquez quand vous souhaitez commencer votre prochaine mission (à partir
              d&apos;aujourd&apos;hui)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FreelanceTjmStep;
