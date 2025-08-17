'use client';

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
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InputField
          id="prenom"
          label="Prénom"
          value={formData.firstName}
          onChange={e =>
            setFormData((prev: FreelanceFormData) => ({ ...prev, firstName: e.target.value }))
          }
          placeholder="Jean"
          required
        />
        <InputField
          id="nom"
          label="Nom"
          value={formData.lastName}
          onChange={e =>
            setFormData((prev: FreelanceFormData) => ({ ...prev, lastName: e.target.value }))
          }
          placeholder="Dupont"
          required
        />
      </div>
      <BasicEmailInput
        email={formData.email}
        onEmailChange={(email: string) =>
          setFormData((prev: FreelanceFormData) => ({ ...prev, email: email }))
        }
        label="Email *"
        placeholder="jean.dupont@email.com"
        id="freelance-email"
      />
      <InputField
        id="phone"
        label="Téléphone"
        value={formData.phone}
        onChange={e =>
          setFormData((prev: FreelanceFormData) => ({ ...prev, phone: e.target.value }))
        }
        placeholder="06 12 34 56 78"
        required
      />
      <div className="space-y-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <StyledSelect
            id="metier"
            label="Métier"
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
            placeholder=""
            required
          />
          <StyledSelect
            label="Sexe"
            id="sex"
            value={formData.sex || ''}
            onChange={e =>
              setFormData((prev: FreelanceFormData) => ({
                ...prev,
                sex: e.target.value as 'MALE' | 'FEMALE',
              }))
            }
            options={[
              { value: 'MALE', label: 'Homme' },
              { value: 'FEMALE', label: 'Femme' },
            ]}
            placeholder="Sexe *"
            required
          />
        </div>
      </div>
    </div>
  );
};

export default FreelancePersonalInfoStep;
