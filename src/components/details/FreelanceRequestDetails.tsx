'use client';
import { demande, PortageInfo, OptionInfo } from '@/types/demande';

import OptionInfoTooltip from './OptionInfoTooltip';

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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'MEDIUM':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'LOW':
        return 'bg-green-50 text-green-700 border-green-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getMissionStatusColor = (status: string) => {
    switch (status) {
      case 'yes':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'searching':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'no':
        return 'bg-slate-50 text-slate-700 border-slate-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="w-full mt-8">
      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-black px-6 py-4">
          <h2 className="text-xl font-semibold text-white mb-1">Détails de la demande</h2>
          <p className="text-blue-100 text-sm">
            Créée le{' '}
            {new Date(demandeItem.created_at).toLocaleDateString('fr-FR', {
              day: '2-digit',
              month: 'short',
              year: '2-digit',
            })}
          </p>
        </div>

        <div className="p-6 space-y-6">
          {/* Mission Information */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-6 h-6 bg-blue-100 rounded-md flex items-center justify-center">
                <svg
                  className="w-3 h-3 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6.5"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-800">Informations de la mission</h3>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Mission Status */}
              <div>
                <span className="block text-xs font-medium text-gray-600 mb-1">Statut mission</span>
                <div
                  className={`inline-flex items-center px-3 py-1 rounded-md border font-medium text-sm ${getMissionStatusColor(demandeItem.mission_status)}`}
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-current mr-2"></div>
                  {missionLabels[demandeItem.mission_status] || demandeItem.mission_status}
                </div>
              </div>

              {/* TJM */}
              <div className="bg-green-50 p-3 rounded-md border border-green-100">
                <span className="block text-xs font-medium text-green-600 mb-1">TJM</span>
                <p className="text-lg font-bold text-green-700">{demandeItem.tjm}€</p>
              </div>

              {/* Days */}
              <div className="bg-blue-50 p-3 rounded-md border border-blue-100">
                <span className="block text-xs font-medium text-blue-600 mb-1">Jours/semaine</span>
                <p className="text-lg font-bold text-blue-700">{demandeItem.days}</p>
              </div>

              {/* Priority */}
              <div>
                <span className="block text-xs font-medium text-gray-600 mb-1">Priorité</span>
                <div
                  className={`inline-flex items-center px-3 py-1 rounded-md border font-medium text-sm ${getPriorityColor(demandeItem.priority)}`}
                >
                  <svg className="w-3 h-3 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 8l2.55 3.4A1 1 0 0116 13H6a1 1 0 00-1 1v3a1 1 0 11-2 0V6z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {priorityLabels[demandeItem.priority] || demandeItem.priority}
                </div>
              </div>

              {/* Client Information (only if mission is OPEN) */}
              {demandeItem.mission_status === 'OPEN' && (
                <>
                  {demandeItem.client_name && (
                    <div className="bg-gray-50 p-3 rounded-md">
                      <span className="block text-xs font-medium text-gray-600 mb-1">Client</span>
                      <p className="text-gray-900 font-medium text-sm">{demandeItem.client_name}</p>
                    </div>
                  )}
                  {demandeItem.client_sector && (
                    <div className="bg-gray-50 p-3 rounded-md">
                      <span className="block text-xs font-medium text-gray-600 mb-1">Secteur</span>
                      <p className="text-gray-900 font-medium text-sm">
                        {demandeItem.client_sector}
                      </p>
                    </div>
                  )}
                  {demandeItem.client_address && (
                    <div className="bg-gray-50 p-3 rounded-md lg:col-span-3">
                      <span className="block text-xs font-medium text-gray-600 mb-1">Adresse</span>
                      <p className="text-gray-900 font-medium text-sm">
                        {demandeItem.client_address}
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Portage Information */}
          {demandeItem.wants_portage && (
            <div className="space-y-3">
              <div className="flex items-center space-x-2 mb-3">
                <div className="w-6 h-6 bg-green-100 rounded-md flex items-center justify-center">
                  <svg
                    className="w-3 h-3 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-800">Portage salarial</h3>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-md p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-green-800 font-medium text-sm">
                    Le freelance souhaite du portage
                  </span>
                </div>

                {demandeItem.portages && demandeItem.portages.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs text-green-700 mb-2 font-medium">
                      Sociétés de portage sélectionnées :
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {demandeItem.portages.map((portage: PortageInfo) => (
                        <span
                          key={portage.portage?.id || portage.id}
                          className="inline-flex items-center px-2 py-1 bg-white border border-green-200 text-green-800 rounded-md text-xs font-medium"
                        >
                          <div className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1"></div>
                          {portage.portage?.name || portage.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Options */}
          {demandeItem.options && demandeItem.options.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center space-x-2 mb-3">
                <div className="w-6 h-6 bg-purple-100 rounded-md flex items-center justify-center">
                  <svg
                    className="w-3 h-3 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-800">Options demandées</h3>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-md p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {(demandeItem.options ?? []).map((option: OptionInfo) => (
                    <div
                      key={option.id}
                      className="bg-white border border-purple-100 rounded-md p-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-purple-500 rounded-full flex-shrink-0"></div>
                          <span className="font-medium text-gray-900 text-sm">
                            {option.platformService?.data_label || option.platformService?.label}
                          </span>
                        </div>
                        <OptionInfoTooltip option={option} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FreelanceRequestDetails;
