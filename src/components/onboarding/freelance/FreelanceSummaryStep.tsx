'use client';

import type { Metier, PlatformService, Portage } from '../../../hooks/useModalData';
import type { FreelanceFormData, FreelanceRequestData } from '../../../types/freelance';
import OptionInfoTooltip from '../../details/OptionInfoTooltip';
import ServiceInfoTooltip from '../../ServiceInfoTooltip';

interface FreelanceSummaryStepProps {
  formData: FreelanceFormData | FreelanceRequestData;
  setFormData: (updater: (prev: FreelanceFormData | FreelanceRequestData) => FreelanceFormData | FreelanceRequestData) => void;
  metiers: Metier[];
  platformServices: PlatformService[];
  portages: Portage[];
}

export const FreelanceSummaryStep = ({
  formData,
  metiers,
  platformServices,
  portages,
}: FreelanceSummaryStepProps) => {
  // Type guard to check if formData has personal info
  const hasPersonalInfo = (data: FreelanceFormData | FreelanceRequestData): data is FreelanceFormData => {
    return 'firstName' in data && 'lastName' in data && 'email' in data && 'phone' in data &&
           !!(data as FreelanceFormData).firstName && !!(data as FreelanceFormData).lastName;
  };

  const selectedMetier = hasPersonalInfo(formData) && (formData as FreelanceFormData).metierId 
    ? metiers.find(m => m.id === (formData as FreelanceFormData).metierId)
    : undefined;
  const selectedServices = platformServices.filter(service =>
    formData.selectedServices.some(selected => selected.serviceId === service.id)
  );
  const selectedPortageServices = portages.filter(portage =>
    formData.selectedPortages.includes(portage.id.toString())
  );

  const priorityLabels: { [key: string]: string } = {
    urgent: 'Urgent (dans la semaine)',
    high: 'Priorité élevée (dans le mois)',
    medium: 'Priorité moyenne (dans les 3 mois)',
    low: "Pas urgent (quand c'est possible)",
  };

  const missionLabels: { [key: string]: string } = {
    no: 'Non, je suis en recherche',
    searching: 'En cours de recherche',
    yes: "Oui, j'ai une mission en cours",
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="space-y-4">
        {/* Personal Information */}
       {hasPersonalInfo(formData) && (
         <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
          <h5 className="font-medium text-gray-800 mb-3">Informations personnelles</h5>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 sm:gap-3 text-sm">
            <div>
              <span className="text-gray-600">Nom:</span>
              <span className="ml-2 font-medium">
                {formData.firstName} {formData.lastName}
              </span>
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
            {formData.sex && (
              <div>
                <span className="text-gray-600">Sexe:</span>
                <span className="ml-2 font-medium">
                  {formData.sex === 'MALE' ? 'Homme' : formData.sex === 'FEMALE' ? 'Femme' : formData.sex}
                </span>
              </div>
            )}
          </div>
        </div>
       )}

        {/* Mission Information */}
        <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
          <h5 className="font-medium text-gray-800 mb-3">Informations mission</h5>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 sm:gap-3 text-sm">
            <div className="lg:col-span-2">
              <span className="text-gray-600">Statut mission:</span>
              <span className="ml-2 font-medium">
                {missionLabels[formData.hasMission] || formData.hasMission}
              </span>
            </div>
            {formData.hasMission === 'yes' && (
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
            <div>
              <span className="text-gray-600">TJM:</span>
              <span className="ml-2 font-medium">{formData.tjm}€</span>
            </div>
            <div>
              <span className="text-gray-600">Jours/semaine:</span>
              <span className="ml-2 font-medium">{formData.days}</span>
            </div>
            {formData.startDate && (
              <div>
                <span className="text-gray-600">Date de début souhaitée:</span>
                <span className="ml-2 font-medium">
                  {new Date(formData.startDate).toLocaleDateString('fr-FR')}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Salary Preferences */}
        {formData.wantSalaried && (
          <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
            <h5 className="font-medium text-gray-800 mb-3">Préférences salariales</h5>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 sm:gap-3 text-sm">
              <div>
                <span className="text-gray-600">Poste salarié:</span>
                <span className="ml-2 font-medium text-green-600">Oui, intéressé(e)</span>
              </div>
              {formData.salary && (
                <div>
                  <span className="text-gray-600">Salaire souhaité:</span>
                  <span className="ml-2 font-medium">{formData.salary.toLocaleString('fr-FR')}€/mois</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Portage Information */}
        {formData.wantsPortage === 'yes' && (
          <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
            <h5 className="font-medium text-gray-800 mb-3">Société de portage</h5>
            <div className="text-sm">
              <span className="text-gray-600">Services sélectionnés:</span>
              <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {selectedPortageServices.map(portage => (
                  <span
                    key={portage.id}
                    className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs"
                  >
                    {portage.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Services */}
        <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
          <h5 className="font-medium text-gray-800 mb-3">Services demandés</h5>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {selectedServices.map(service => {
              const selectedService = formData.selectedServices.find(
                s => s.serviceId === service.id
              );
              const hasResponseData = selectedService?.responseData;

              const mockOption = {
                id: service.id,
                platformService: service,
                response_data: hasResponseData
                  ? { response: selectedService.responseData ?? null }
                  : undefined,
                description: null,
              };

              return (
                <div key={service.id} className="flex items-start space-x-2 text-sm">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">{service.label}</div>
                      {hasResponseData ? (
                        <OptionInfoTooltip option={mockOption} />
                      ) : (
                        <ServiceInfoTooltip service={service} />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Priority */}
        <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
          <h5 className="font-medium text-gray-800 mb-3">Priorité</h5>
          <div className="text-sm">
            <span className="font-medium">
              {priorityLabels[formData.priority] || formData.priority}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FreelanceSummaryStep;
