'use client';

import type { CompanyFormData } from '@/types/company';
import InputField from '../../form/input/InputField';

interface CompanyConsultantsStepProps {
  formData: CompanyFormData;
  onFormDataChange: (updates: Partial<CompanyFormData>) => void;
}

export const CompanyConsultantsStep = ({ 
  formData, 
  onFormDataChange 
}: CompanyConsultantsStepProps) => {
  return (
    <div className="space-y-4">
      <InputField
        id="consu"
        label="Nombre actuel de consultants portés"
        type="number"
        value={formData.consultantCount}
        onChange={(e) => onFormDataChange({ consultantCount: e.target.value })}
        placeholder="50"
        required
      />
      
      <div className="space-y-2">
        <label htmlFor="fees" className="text-sm font-medium text-gray-700">
          Taux de frais de gestion (%) *
        </label>
        <input
          id="fees"
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          type="range"
          step="0.1"
          min="0"
          max="20"
          value={formData.managementFeeRate}
          onChange={(e) => onFormDataChange({ managementFeeRate: e.target.value })}
          placeholder="8.5"
          required
        />
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-600">
            Taux standard appliqué sur le chiffre d&apos;affaires
          </p>
          <span className="text-sm font-medium text-gray-900">
            {formData.managementFeeRate}%
          </span>
        </div>
      </div>
    </div>
  );
};
