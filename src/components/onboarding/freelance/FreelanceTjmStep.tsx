'use client';

import type { FreelanceFormData } from '../../../types/freelance';

interface FreelanceTjmStepProps {
  formData: FreelanceFormData;
  setFormData: (updater: (prev: FreelanceFormData) => FreelanceFormData) => void;
}

export const FreelanceTjmStep = ({
  formData,
  setFormData
}: FreelanceTjmStepProps) => {
  return (
    <div className="space-y-6">
      <div className="text-center mb-4">
        <h4 className="text-md font-medium text-gray-800">
          TJM et jours travaillés
        </h4>
        <p className="text-sm text-gray-600 mt-1">Définissez votre tarif et disponibilité</p>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="tjm" className="text-sm font-medium text-gray-700">TJM souhaité (€) *</label>
            <input
              id='tjm'
              type="number"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.tjm}
              onChange={(e) => setFormData((prev: FreelanceFormData) => ({ ...prev, tjm: e.target.value }))}
              placeholder="500"
              min="0"
              step="10"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="day" className="text-sm font-medium text-gray-700">Nombre de jours par semaine *</label>
            <input
              id='day'
              type="number"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.days}
              onChange={(e) => setFormData((prev: FreelanceFormData) => ({ ...prev, days: e.target.value }))}
              placeholder="5"
              min="1"
              max="7"
              step="0.5"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FreelanceTjmStep;
