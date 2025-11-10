'use client';

import { useTranslations } from 'next-intl';

import type { Metier } from '../../../hooks/useModalData';
import type { FreelanceFormData } from '../../../types/freelance';
import { BasicEmailInput } from '../../form/BasicEmailInput';
import InputField from '../../form/input/InputField';
import { StyledSelect } from '../../form/StyledSelect';

interface FreelancePersonalInfoStepProps {
  formData: FreelanceFormData;
  setFormData: (updater: (prev: FreelanceFormData) => FreelanceFormData) => void;
  metiers: Metier[];
}

export const FreelancePersonalInfoStep = ({
  formData,
  setFormData,
  metiers,
}: FreelancePersonalInfoStepProps) => {
  const t = useTranslations('onboarding.freelance.personalInfo');

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StyledSelect
          label={t('sex')}
          id="sex"
          value={formData.sex || ''}
          onChange={e =>
            setFormData((prev: FreelanceFormData) => ({
              ...prev,
              sex: e.target.value as 'MALE' | 'FEMALE',
            }))
          }
          options={[
            { value: 'MALE', label: t('male') },
            { value: 'FEMALE', label: t('female') },
          ]}
          placeholder={t('sexPlaceholder')}
        />
        <InputField
          id="prenom"
          label={t('firstName')}
          value={formData.firstName}
          onChange={e =>
            setFormData((prev: FreelanceFormData) => ({ ...prev, firstName: e.target.value }))
          }
          placeholder={t('firstNamePlaceholder')}
          required
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InputField
          id="nom"
          label={t('lastName')}
          value={formData.lastName}
          onChange={e =>
            setFormData((prev: FreelanceFormData) => ({ ...prev, lastName: e.target.value }))
          }
          placeholder={t('lastNamePlaceholder')}
          required
        />
        <BasicEmailInput
          email={formData.email}
          onEmailChange={(email: string) =>
            setFormData((prev: FreelanceFormData) => ({ ...prev, email: email }))
          }
          label={t('email')}
          placeholder={t('emailPlaceholder')}
          id="freelance-email"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InputField
          id="phone"
          label={t('phone')}
          value={formData.phone}
          onChange={e =>
            setFormData((prev: FreelanceFormData) => ({ ...prev, phone: e.target.value }))
          }
          placeholder={t('phonePlaceholder')}
        />
        <StyledSelect
          id="metier"
          label={t('profession')}
          value={formData.metierId}
          onChange={e =>
            setFormData((prev: FreelanceFormData) => ({
              ...prev,
              metierId: parseInt(e.target.value),
            }))
          }
          options={[
            { value: 0, label: 'Sélectionnez votre métier' },
            ...metiers.map(metier => ({ value: metier.id, label: metier.name })),
          ]}
          placeholder={t('professionPlaceholder')}
          required
        />
      </div>
    </div>
  );
};

export default FreelancePersonalInfoStep;
