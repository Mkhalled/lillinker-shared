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
        <InputField
          id="date_creation"
          label="Date de création"
          type="date"
          value={
            formData.date_creation
              ? typeof formData.date_creation === 'string'
                ? formData.date_creation
                : formData.date_creation.toISOString().slice(0, 10)
              : ''
          }
          onChange={e => onFormDataChange({ date_creation: e.target.value ? new Date(e.target.value) : undefined })}
          placeholder="YYYY-MM-DD"
        />
        <InputField
          id="chiffre_affaires"
          label="Chiffre d'affaires (€)"
          type="number"
          step="0.01"
          value={formData.chiffre_affaires?.toString() || ''}
          onChange={e => onFormDataChange({ chiffre_affaires: parseFloat(e.target.value) || undefined })}
          placeholder="100000.00"
        />
        <InputField
          id="adresse"
          label="Adresse"
          value={formData.adresse || ''}
          onChange={e => onFormDataChange({ adresse: e.target.value })}
          placeholder="123 Rue Exemple, 75000 Paris"
        />
        <InputField
          id="site_web"
          label="Site web"
          type="url"
          value={formData.site_web || ''}
          onChange={e => onFormDataChange({ site_web: e.target.value })}
          placeholder="https://www.exemple.com"
        />
        <InputField
          id="convention_collective"
          label="Convention collective"
          value={formData.convention_collective || ''}
          onChange={e => onFormDataChange({ convention_collective: e.target.value })}
          placeholder="Nom de la convention"
        />
        <InputField
          id="code_naf_ape"
          label="Code NAF/APE"
          value={formData.code_naf_ape || ''}
          onChange={e => onFormDataChange({ code_naf_ape: e.target.value })}
          placeholder="6202A"
        />
      </div>
      <TextAreaField
        id="desc"
        label="Description de la société"
        value={formData.description}
        onChange={e => onFormDataChange({ description: e.target.value })}
        placeholder="Décrivez votre société de portage salarial..."
        rows={4}
      />
    </div>
  );
};