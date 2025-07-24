'use client';

import type { Metier } from '../../../hooks/useModalData';
import type { FreelanceFormData } from '../../../types/freelance';

interface FreelanceMissionStatusStepProps {
  formData: FreelanceFormData;
  setFormData: (updater: (prev: FreelanceFormData) => FreelanceFormData) => void;
  metiers: Metier[];
}

export const FreelanceMissionStatusStep = ({
  formData,
  setFormData,
  metiers
}: FreelanceMissionStatusStepProps) => {
  return (
    <div className="space-y-6">
      <div className="text-center mb-4">
        <h4 className="text-md font-medium text-gray-800">
          Avez-vous une mission ?
        </h4>
        <p className="text-sm text-gray-600 mt-1">Parlez-nous de votre situation actuelle</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-3">
          <label htmlFor="mission" className="text-sm font-medium text-gray-700">Avez-vous une mission actuellement ? *</label>
          <div id='mission' className="flex flex-wrap gap-4">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="hasMission"
                value="no"
                checked={formData.hasMission === "no"}
                onChange={(e) => setFormData((prev: FreelanceFormData) => ({ ...prev, hasMission: e.target.value }))}
                className="text-blue-600"
              />
              <span className="text-gray-700">Non, je suis en recherche</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="hasMission"
                value="searching"
                checked={formData.hasMission === "searching"}
                onChange={(e) => setFormData((prev: FreelanceFormData) => ({ ...prev, hasMission: e.target.value }))}
                className="text-blue-600"
              />
              <span className="text-gray-700">En cours de recherche</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="hasMission"
                value="yes"
                checked={formData.hasMission === "yes"}
                onChange={(e) => setFormData((prev: FreelanceFormData) => ({ ...prev, hasMission: e.target.value }))}
                className="text-blue-600"
              />
              <span className="text-gray-700">Oui, j&apos;ai une mission en cours</span>
            </label>
          </div>
        </div>

        {formData.hasMission === "yes" && (
          <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
            <p className="text-sm text-gray-600 mb-3">
              <em>Les informations client sont optionnelles mais peuvent aider à mieux vous accompagner.</em>
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="client" className="text-sm font-medium text-gray-700">Nom du client</label>
                <input
                  id='client'
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.clientName}
                  onChange={(e) => setFormData((prev: FreelanceFormData) => ({ ...prev, clientName: e.target.value }))}
                  placeholder="Nom de l'entreprise (optionnel)"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="address" className="text-sm font-medium text-gray-700">Adresse du client</label>
                <input
                  id='address'
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.clientAddress}
                  onChange={(e) => setFormData((prev: FreelanceFormData) => ({ ...prev, clientAddress: e.target.value }))}
                  placeholder="Adresse complète (optionnel)"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="field" className="text-sm font-medium text-gray-700">Secteur d&apos;activité</label>
              <select
                id='field'
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.clientSector}
                onChange={(e) => setFormData((prev: FreelanceFormData) => ({ ...prev, clientSector: e.target.value }))}
              >
                <option value="">Sélectionnez le secteur (optionnel)</option>
                {metiers.map((metier) => (
                  <option key={metier.id} value={metier.name}>
                    {metier.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FreelanceMissionStatusStep;
