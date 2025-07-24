'use client';

import type { FreelanceFormData } from '../../../types/freelance';
import type { Metier, PlatformService, Portage } from '../../../hooks/useModalData';

interface FreelanceSummaryStepProps {
  formData: FreelanceFormData;
  setFormData: (updater: (prev: FreelanceFormData) => FreelanceFormData) => void;
  metiers: Metier[];
  platformServices: PlatformService[];
  portages: Portage[];
}

export const FreelanceSummaryStep = ({
  formData,
  setFormData,
  metiers,
  platformServices,
  portages
}: FreelanceSummaryStepProps) => {
  const selectedMetier = metiers.find(m => m.id === formData.metierId);
  const selectedServices = platformServices.filter(service => 
    formData.selectedServices.some(selected => selected.serviceId === service.id)
  );
  const selectedPortageServices = portages.filter(portage =>
    formData.selectedPortages.includes(portage.id.toString())
  );

  const priorityLabels: { [key: string]: string } = {
    urgent: "Urgent (dans la semaine)",
    high: "Priorité élevée (dans le mois)",
    medium: "Priorité moyenne (dans les 3 mois)",
    low: "Pas urgent (quand c'est possible)"
  };

  const missionLabels: { [key: string]: string } = {
    no: "Non, je suis en recherche",
    searching: "En cours de recherche",
    yes: "Oui, j'ai une mission en cours"
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h4 className="text-lg font-semibold text-gray-800">
          Récapitulatif de votre demande
        </h4>
        <p className="text-sm text-gray-600 mt-1">Vérifiez vos informations avant validation</p>
      </div>

      <div className="space-y-4">
        {/* Personal Information */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h5 className="font-medium text-gray-800 mb-3">Informations personnelles</h5>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-gray-600">Nom:</span>
              <span className="ml-2 font-medium">{formData.firstName} {formData.lastName}</span>
            </div>
            <div>
              <span className="text-gray-600">Email:</span>
              <span className="ml-2 font-medium">{formData.email}</span>
            </div>
            <div>
              <span className="text-gray-600">Téléphone:</span>
              <span className="ml-2 font-medium">{formData.phone}</span>
            </div>
            <div>
              <span className="text-gray-600">Métier:</span>
              <span className="ml-2 font-medium">{selectedMetier?.name || 'Non spécifié'}</span>
            </div>
          </div>
        </div>

        {/* Mission Information */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h5 className="font-medium text-gray-800 mb-3">Informations mission</h5>
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-gray-600">Statut mission:</span>
              <span className="ml-2 font-medium">{missionLabels[formData.hasMission] || formData.hasMission}</span>
            </div>
            {formData.hasMission === "yes" && (
              <>
                {formData.clientName && (
                  <div>
                    <span className="text-gray-600">Client:</span>
                    <span className="ml-2 font-medium">{formData.clientName}</span>
                  </div>
                )}
                {formData.clientSector && (
                  <div>
                    <span className="text-gray-600">Secteur:</span>
                    <span className="ml-2 font-medium">{formData.clientSector}</span>
                  </div>
                )}
              </>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-gray-600">TJM:</span>
                <span className="ml-2 font-medium">{formData.tjm}€</span>
              </div>
              <div>
                <span className="text-gray-600">Jours/semaine:</span>
                <span className="ml-2 font-medium">{formData.days}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Portage Information */}
        {formData.wantsPortage === "yes" && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h5 className="font-medium text-gray-800 mb-3">Société de portage</h5>
            <div className="text-sm">
              <span className="text-gray-600">Services sélectionnés:</span>
              <div className="mt-2 flex flex-wrap gap-2">
                {selectedPortageServices.map(portage => (
                  <span key={portage.id} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                    {portage.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Services */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h5 className="font-medium text-gray-800 mb-3">Services demandés</h5>
          <div className="space-y-2">
            {selectedServices.map(service => (
              <div key={service.id} className="flex items-start space-x-2 text-sm">
                <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                <div>
                  <div className="font-medium">{service.label}</div>
                  {service.description && (
                    <div className="text-gray-600 text-xs">{service.description}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Priority */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h5 className="font-medium text-gray-800 mb-3">Priorité</h5>
          <div className="text-sm">
            <span className="font-medium">{priorityLabels[formData.priority] || formData.priority}</span>
          </div>
        </div>

        {/* Additional Comments */}
        <div className="space-y-2">
          <label htmlFor="comments" className="text-sm font-medium text-gray-700">
            Commentaires supplémentaires (optionnel)
          </label>
          <textarea
            id="comments"
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ajoutez des détails ou précisions sur votre demande..."
            value={formData.comments || ''}
            onChange={(e) => setFormData((prev: FreelanceFormData) => ({ ...prev, comments: e.target.value }))}
          />
        </div>
      </div>
    </div>
  );
};

export default FreelanceSummaryStep;
