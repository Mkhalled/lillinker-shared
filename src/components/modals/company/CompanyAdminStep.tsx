'use client';

import { EmailValidationInput } from '../../form/EmailValidationInput';
import type { CompanyFormData } from '@/types/company';

interface CompanyAdminStepProps {
  formData: CompanyFormData;
  onFormDataChange: (updates: Partial<CompanyFormData>) => void;
}

export const CompanyAdminStep = ({ 
  formData, 
  onFormDataChange 
}: CompanyAdminStepProps) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="prenom" className="text-sm font-medium text-gray-700">
            Prénom de l&apos;administrateur *
          </label>
          <input
            id="prenom"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.adminFirstName}
            onChange={(e) => onFormDataChange({ adminFirstName: e.target.value })}
            placeholder="Marie"
            required
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium text-gray-700">
            Nom de l&apos;administrateur *
          </label>
          <input
            id="name"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.adminLastName}
            onChange={(e) => onFormDataChange({ adminLastName: e.target.value })}
            placeholder="Martin"
            required
          />
        </div>
      </div>
      
      <EmailValidationInput
        email={formData.adminEmail}
        onEmailChange={(email) => onFormDataChange({ adminEmail: email })}
        label="Email de l'administrateur *"
        placeholder="marie.martin@societe.com"
        id="admin-email"
      />
      
      <div className="space-y-2">
        <label htmlFor="phone" className="text-sm font-medium text-gray-700">
          Téléphone de l&apos;administrateur *
        </label>
        <input
          id="phone"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={formData.adminPhone}
          onChange={(e) => onFormDataChange({ adminPhone: e.target.value })}
          placeholder="01 23 45 67 89"
          required
        />
      </div>
    </div>
  );
};
