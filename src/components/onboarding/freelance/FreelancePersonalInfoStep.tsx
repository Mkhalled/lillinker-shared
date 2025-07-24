'use client';

import type { Metier } from '../../../hooks/useModalData';
import type { FreelanceFormData } from '../../../types/freelance';
import { BasicEmailInput } from '../../form/BasicEmailInput';

interface FreelancePersonalInfoStepProps {
  formData: FreelanceFormData;
  setFormData: (updater: (prev: FreelanceFormData) => FreelanceFormData) => void;
  metiers: Metier[];
}

export const FreelancePersonalInfoStep = ({ 
  formData, 
  setFormData, 
  metiers 
}: FreelancePersonalInfoStepProps) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="prenom" className="text-sm font-medium text-gray-700">Prénom *</label>
          <input
            id='prenom'
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.firstName}
            onChange={(e) => setFormData((prev: FreelanceFormData) => ({ ...prev, firstName: e.target.value }))}
            placeholder="Jean"
            required
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="nom" className="text-sm font-medium text-gray-700">Nom *</label>
          <input
            id='nom'
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.lastName}
            onChange={(e) => setFormData((prev: FreelanceFormData) => ({ ...prev, lastName: e.target.value }))}
            placeholder="Dupont"
            required
          />
        </div>
      </div>
      <BasicEmailInput
        email={formData.email}
        onEmailChange={(email: string) => setFormData((prev: FreelanceFormData) => ({ ...prev, email: email }))}
        label="Email *"
        placeholder="jean.dupont@email.com"
        id="freelance-email"
      />
      <div className="space-y-2">
        <label htmlFor="phone" className="text-sm font-medium text-gray-700">Téléphone *</label>
        <input
          id='phone'
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={formData.phone}
          onChange={(e) => setFormData((prev: FreelanceFormData) => ({ ...prev, phone: e.target.value }))}
          placeholder="06 12 34 56 78"
          required
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="metier" className="text-sm font-medium text-gray-700">Métier *</label>
        <select
          id='metier'
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={formData.metierId}
          onChange={(e) => setFormData((prev: FreelanceFormData) => ({ ...prev, metierId: parseInt(e.target.value) }))}
        >
          <option value={0}>Sélectionnez votre métier</option>
          {metiers.map((metier) => (
            <option key={metier.id} value={metier.id}>
              {metier.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default FreelancePersonalInfoStep;
