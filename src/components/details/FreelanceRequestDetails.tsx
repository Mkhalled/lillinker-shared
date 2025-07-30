'use client';

import { demande } from "@/types/demande";
import OptionInfoTooltip from "./OptionInfoTooltip";


export const FreelanceRequestDetails = ({ demandeItem }: { demandeItem: demande }) => {
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
    <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark mt-8">
      <div className="p-7">
        <form action="#">
          {/* Mission Information */}
          <div className="space-y-4 sm:space-y-6">
            {/* Mission Information */}
            <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
              <h5 className="font-medium text-gray-800 mb-3">Informations mission</h5>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 sm:gap-3 text-sm">
                <div className="lg:col-span-2">
                  <span className="text-gray-600">Statut mission:</span>
                  <span className="ml-2 font-medium">
                    {missionLabels[demandeItem.mission_status] || demandeItem.mission_status}
                  </span>
                </div>
                {demandeItem.mission_status === 'OPEN' && (
                  <>
                    {demandeItem.client_name && (
                      <div>
                        <span className="text-gray-600">Client:</span>
                        <span className="ml-2 font-medium">{demandeItem.client_name}</span>
                      </div>
                    )}
                    {demandeItem.client_sector && (
                      <div>
                        <span className="text-gray-600">Secteur:</span>
                        <span className="ml-2 font-medium">{demandeItem.client_sector}</span>
                      </div>
                    )}
                    {demandeItem.client_address && (
                      <div>
                        <span className="text-gray-600">Adresse:</span>
                        <span className="ml-2 font-medium">{demandeItem.client_address}</span>
                      </div>
                    )}
                  </>
                )}
                <div>
                  <span className="text-gray-600">TJM:</span>
                  <span className="ml-2 font-medium">{demandeItem.tjm}€</span>
                </div>
                <div>
                  <span className="text-gray-600">Jours/semaine:</span>
                  <span className="ml-2 font-medium">{demandeItem.days}</span>
                </div>
                <div>
                  <span className="text-gray-600">Date de création:</span>
                  <span className="ml-2 font-medium">{new Date(demandeItem.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: '2-digit' })}</span>
                </div>
                <div>
                  <span className="text-gray-600">Priorité:</span>
                  <span className="ml-2 font-medium">{priorityLabels[demandeItem.priority] || demandeItem.priority}</span>
                </div>
              </div>
            </div>

            {/* Portage Information */}
            {demandeItem.wants_portage && (
              <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                <h5 className="font-medium text-gray-800 mb-3">Portage</h5>
                <div className="flex items-center mb-2">
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                    Le freelance souhaite du portage
                  </span>
                </div>
                {demandeItem.portages && demandeItem.portages.length > 0 && (
                  <div className="text-sm mt-2">
                    <span className="text-gray-600">Sociétés de portage sélectionnées :</span>
                    <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {demandeItem.portages.map((portage: any) => (
                        <span
                          key={portage.portage?.id || portage.id}
                          className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs"
                        >
                          {portage.portage?.name || portage.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Options */}
            {demandeItem.options && demandeItem.options.length > 0 && (
                <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                    <h5 className="font-medium text-gray-800 mb-3">Options demandées</h5>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                        {(demandeItem.options ?? []).map((option: any) => (
                            <div key={option.id} className="flex items-center space-x-2 text-sm">
                                <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></span>
                                <div className="flex items-center space-x-1">
                                    <span className="font-medium">{option.platformService?.data_label || option.platformService?.label}</span>
                                    <OptionInfoTooltip option={option} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default FreelanceRequestDetails;
