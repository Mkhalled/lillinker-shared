'use client';

import type { FreelanceFormData } from '../../../types/freelance';

interface FreelancePriorityStepProps {
  formData: FreelanceFormData;
  setFormData: (updater: (prev: FreelanceFormData) => FreelanceFormData) => void;
}

export const FreelancePriorityStep = ({
  formData,
  setFormData
}: FreelancePriorityStepProps) => {
  const priorities = [
    { value: "HIGH", label: "Urgent (dans la semaine)", color: "text-red-600" },
    { value: "MEDIUM", label: "Priorité moyenne (dans les 3 mois)", color: "text-yellow-600" },
    { value: "LOW", label: "Pas urgent (quand c'est possible)", color: "text-green-600" }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center mb-4">
        <h4 className="text-md font-medium text-gray-800">
          Quelle est votre priorité ?
        </h4>
        <p className="text-sm text-gray-600 mt-1">Aidez-nous à prioriser votre demande</p>
      </div>

      <div className="space-y-3">
        {priorities.map((priority) => (
          <label
            key={priority.value}
            className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
          >
            <input
              type="radio"
              name="priority"
              value={priority.value}
              checked={formData.priority === priority.value}
              onChange={(e) => setFormData((prev: FreelanceFormData) => ({ ...prev, priority: e.target.value }))}
              className="text-blue-600"
            />
            <span className={`font-medium ${priority.color}`}>{priority.label}</span>
          </label>
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
