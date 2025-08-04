'use client';

import { useState, useEffect } from 'react';

import type { CompanyFormData } from '@/types/company';

import { EmailValidationInput } from '../../form/EmailValidationInput';
import InputField from '../../form/input/InputField';
import { StyledSelect } from '../../form/StyledSelect';

interface CompanyAdminStepProps {
  formData: CompanyFormData;
  onFormDataChange: (updates: Partial<CompanyFormData>) => void;
  onValidityChange?: (isValid: boolean) => void;
}

export const CompanyAdminStep = ({
  formData,
  onFormDataChange,
  onValidityChange,
}: CompanyAdminStepProps) => {
  const [isEmailValid, setIsEmailValid] = useState(false);

  // Check overall form validity
  useEffect(() => {
    const isFormValid = Boolean(
      formData.adminFirstName && 
      formData.adminLastName && 
      formData.adminPhone && 
      formData.adminSex &&
      isEmailValid
    );
    onValidityChange?.(isFormValid);
  }, [
    formData.adminFirstName,
    formData.adminLastName,
    formData.adminPhone,
    formData.adminSex,
    isEmailValid,
    onValidityChange,
  ]);
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <InputField
          id="prenom"
          label="Prénom de l'administrateur"
          value={formData.adminFirstName}
          onChange={e => onFormDataChange({ adminFirstName: e.target.value })}
          placeholder="Marie"
          required
        />
        <InputField
          id="name"
          label="Nom de l'administrateur"
          value={formData.adminLastName}
          onChange={e => onFormDataChange({ adminLastName: e.target.value })}
          placeholder="Martin"
          required
        />
      </div>

      <EmailValidationInput
        email={formData.adminEmail}
        onEmailChange={email => onFormDataChange({ adminEmail: email })}
        onValidityChange={setIsEmailValid}
        label="Email de l'administrateur *"
        placeholder="marie.martin@societe.com"
        id="admin-email"
      />

      <InputField
        id="phone"
        label="Téléphone de l'administrateur"
        value={formData.adminPhone}
        onChange={e => onFormDataChange({ adminPhone: e.target.value })}
        placeholder="01 23 45 67 89"
        required
      />

      <div className="grid grid-cols-2 gap-4">
        <StyledSelect
          id="adminSex"
          label="Sexe de l'administrateur"
          value={formData.adminSex}
          onChange={e => onFormDataChange({ adminSex: e.target.value as 'MALE' | 'FEMALE' | '' })}
          options={[
            { value: 'MALE', label: 'Homme' },
            { value: 'FEMALE', label: 'Femme' }
          ]}
          placeholder="Sélectionner..."
          required
        />
      </div>
    </div>
  );
};
