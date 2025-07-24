'use client';

import type { FreelanceFormData } from '../../../types/freelance';
import type { Metier, Portage } from '../../../hooks/useModalData';

interface FreelanceMissionStepProps {
  formData: FreelanceFormData;
  setFormData: (updater: (prev: FreelanceFormData) => FreelanceFormData) => void;
  missionStep: number;
  setMissionStep: (step: number) => void;
  metiers: Metier[];
  portages: Portage[];
  handlePortageToggle: (portageId: number) => void;
}

export const FreelanceMissionStep = ({
  formData,
  setFormData,
  missionStep,
  setMissionStep,
  metiers,
  portages,
  handlePortageToggle
}: FreelanceMissionStepProps) => {
  const missionPages = [
    {
      title: "Étape 1 : Avez-vous une mission ?",
      content: (
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
      )
    },
    {
      title: "Étape 2 : Société de portage salarial",
      content: (
        <div className="space-y-4">
          <div className="space-y-3">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.wantsPortage === "yes"}
                onChange={(e) => setFormData((prev: FreelanceFormData) => ({ ...prev, wantsPortage: e.target.checked ? "yes" : "no" }))}
                className="text-blue-600"
              />
              <span className="text-sm font-medium text-gray-700">Je souhaite faire appel à une société de portage salarial</span>
            </label>
          </div>

          {formData.wantsPortage === "yes" && (
            <div className="space-y-3">
              <h1 className="text-sm font-medium text-gray-700">Services de portage souhaités *</h1>
              <div className="grid grid-cols-3 gap-3">
                {portages.map((portage) => (
                  <label key={portage.id} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.selectedPortages.includes(portage.id.toString())}
                      onChange={() => handlePortageToggle(portage.id)}
                      className="text-blue-600 rounded"
                    />
                    <span className="text-sm text-gray-700">{portage.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      )
    },
    {
      title: "Étape 3 : TJM et jours travaillés",
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="tjm" className="text-sm font-medium text-gray-700">TJM souhaité (€) *</label>
              <input
                id='tjm'
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.tjm}
                onChange={(e) => setFormData((prev: FreelanceFormData) => ({ ...prev, tjm: e.target.value }))}
                placeholder="500"
                min="0"
                step="10"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="day" className="text-sm font-medium text-gray-700">Nombre de jours par semaine *</label>
              <input
                id='day'
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.days}
                onChange={(e) => setFormData((prev: FreelanceFormData) => ({ ...prev, days: e.target.value }))}
                placeholder="5"
                min="1"
                max="7"
                step="0.5"
              />
            </div>
          </div>
        </div>
      )
    }
  ];

  const currentMissionPage = missionPages[missionStep - 1];

  return (
    <div className="space-y-6">
      <div className="text-center mb-4">
        <h4 className="text-md font-medium text-gray-800">
          {currentMissionPage.title}
        </h4>
        <p className="text-sm text-gray-600 mt-1">Étape {missionStep} sur 3</p>
      </div>

      {currentMissionPage.content}

      {/* Mission Pagination Controls */}
      <div className="flex justify-between items-center mt-6">
        <button
          type="button"
          onClick={() => setMissionStep(Math.max(1, missionStep - 1))}
          disabled={missionStep === 1}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Étape précédente
        </button>
        
        <span className="text-sm text-gray-500">
          Étape {missionStep} sur {missionPages.length}
        </span>
        
        <button
          type="button"
          onClick={() => setMissionStep(Math.min(missionPages.length, missionStep + 1))}
          disabled={missionStep >= missionPages.length}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Étape suivante
        </button>
      </div>
    </div>
  );
};

export default FreelanceMissionStep;
