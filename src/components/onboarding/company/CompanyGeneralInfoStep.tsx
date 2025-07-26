'use client';

import type { Portage } from '@/hooks/useModalData';
import type { CompanyFormData } from '@/types/company';

import InputField from '../../form/input/InputField';
import TextAreaField from '../../form/input/TextAreaField';
import { SiretValidationInput } from '../../form/SiretValidationInput';
interface CompanyGeneralInfoStepProps {
  formData: CompanyFormData;
  onFormDataChange: (updates: Partial<CompanyFormData>) => void;
  onSiretExistsChange: (exists: boolean) => void;
  portages: Portage[];
}

export const CompanyGeneralInfoStep = ({
  formData,
  onFormDataChange,
  onSiretExistsChange,
}: CompanyGeneralInfoStepProps) => {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <InputField
            id="nom"
            label="Nom de la société"
            value={formData.companyName}
            onChange={e => onFormDataChange({ companyName: e.target.value })}
            placeholder="Ma Société de Portage"
            required
          />
        </div>
        <SiretValidationInput
          siret={formData.siret}
          onSiretChange={siret => onFormDataChange({ siret })}
          onSiretExistsChange={onSiretExistsChange}
        />
      </div>

      <TextAreaField
        id="desc"
        label="Description de la société"
        value={formData.description}
        onChange={e => onFormDataChange({ description: e.target.value })}
        placeholder="Décrivez votre société de portage salarial..."
        rows={4}
        required
      />
    </div>
  );
};
