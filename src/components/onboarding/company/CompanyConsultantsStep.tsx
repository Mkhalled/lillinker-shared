'use client';

import type { CompanyFormData } from '@/types/company';

import InputField from '../../form/input/InputField';

interface CompanyConsultantsStepProps {
  formData: CompanyFormData;
  onFormDataChange: (updates: Partial<CompanyFormData>) => void;
}

export const CompanyConsultantsStep = ({
  formData,
  onFormDataChange,
}: CompanyConsultantsStepProps) => {
  return (
    <div className="space-y-4">
      <InputField
        id="consu"
        label="Nombre actuel de consultants portés"
        type="number"
        value={formData.consultantCount}
        onChange={e => onFormDataChange({ consultantCount: e.target.value })}
        placeholder="50"
        required
      />
      <div className="space-y-2">
        <span className="text-sm font-medium text-gray-700">
          Taux de frais de gestion (%)
        </span>
        <div className="flex space-x-4">
          <InputField
            id="managementFeeRateMin"
            label="Taux minimum"
            type="number"
            step="0.1"
            min="0"
            max="20"
            value={formData.managementFeeRateMin}
            onChange={e => onFormDataChange({ managementFeeRateMin: e.target.value })}
            placeholder="0"
          />
          <InputField
            id="managementFeeRateMax"
            label="Taux maximum"
            type="number"
            step="0.1"
            min="0"
            max="20"
            value={formData.managementFeeRateMax}
            onChange={e => onFormDataChange({ managementFeeRateMax: e.target.value })}
            placeholder="20"
          />
        </div>
      </div>
    </div>
  );
};