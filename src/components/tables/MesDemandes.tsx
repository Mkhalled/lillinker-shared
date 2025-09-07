'use client';
import { useState } from 'react';

import { demande } from '@/types/demande';

import { FreelanceRequestDetails } from '../details/FreelanceRequestDetails';
import NewRequest from '../new-request/NewRequest';

import MesReponses from './MesReponses';

type PaginationProps = {
  currentPage: number;
  pageSize: number;
  totalPages: number;
};

type MesDemandesProps = {
  demandeData: demande[];
  pagination: PaginationProps;
  onPageChange?: (page: number) => void;
};

const MesDemandes = ({ demandeData, pagination, onPageChange }: MesDemandesProps) => {
  const [selectedDemande, setSelectedDemande] = useState<demande | null>(null);
  const [selectedResponse, setSelectedResponse] = useState<number>(-1);
  const [showNewRequest, setShowNewRequest] = useState(false);

  const handlePageChange = (page: number) => {
    if (onPageChange && page >= 1 && page <= pagination.totalPages) {
      onPageChange(page);
    }
  };

  const generatePageNumbers = () => {
    const pages = [];
    const { currentPage, totalPages } = pagination;

    // Always show first page
    if (totalPages > 0) pages.push(1);

    // Show pages around current page
    const start = Math.max(2, currentPage - 2);
    const end = Math.min(totalPages - 1, currentPage + 2);

    // Add ellipsis if there's a gap
    if (start > 2) pages.push('...');

    // Add middle pages
    for (let i = start; i <= end; i++) {
      if (i !== 1 && i !== totalPages) pages.push(i);
    }

    // Add ellipsis if there's a gap
    if (end < totalPages - 1) pages.push('...');

    // Always show last page
    if (totalPages > 1) pages.push(totalPages);

    return pages;
  };
  // show request details
  if (selectedDemande) {
    return (
      <FreelanceRequestDetails
        demandeItem={selectedDemande}
        onClose={() => setSelectedDemande(null)}
      />
    );
  }
  // show request responses
  if (selectedResponse !== -1) {
    // Find the selected request data
    const selectedRequest = demandeData.find(demande => demande.id === selectedResponse);

    return (
      <div className="space-y-4">
        {/* Request Info Cards */}
        {selectedRequest && (
          <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark p-5">
            {/* Header with Back Button */}
            <div className="flex justify-between">
              {/* Cards with more width */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* TJM Card */}
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-100 dark:border-green-800/30 text-center">
                  <span className="block text-sm font-medium text-green-600 dark:text-green-400 mb-2">
                    Taux Journalier Moyen (TJM)
                  </span>
                  <p className="text-2xl font-bold text-green-700 dark:text-green-400">
                    {selectedRequest.tjm}€
                  </p>
                </div>

                {/* Days Card */}
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800/30 text-center">
                  <span className="block text-sm font-medium text-blue-600 dark:text-blue-400 mb-2">
                    Jours travaillés
                  </span>
                  <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                    {selectedRequest.days}
                  </p>
                </div>

                {/* Total CA Card */}
                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-100 dark:border-purple-800/30 text-center">
                  <span className="block text-sm font-medium text-purple-600 dark:text-purple-400 mb-2">
                    Chiffre d&apos;Affaires Total
                  </span>
                  <p className="text-2xl font-bold text-purple-700 dark:text-purple-400">
                    {(selectedRequest.tjm * selectedRequest.days).toLocaleString('fr-FR')}€
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedResponse(-1)}
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 h-10 "
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                Retour aux demandes
              </button>
            </div>
          </div>
        )}

        {/* Responses Table */}
        <MesReponses requestId={selectedResponse} />
      </div>
    );
  }
  // show new form
  if (showNewRequest) {
    return <NewRequest onClose={() => setShowNewRequest(false)} />;
  }

  return (
    <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
      {/* Header with New Request Button */}
      <div className="flex justify-between items-center px-5 pt-6 pb-2 sm:px-7.5">
        <h4 className="text-xl font-semibold text-black dark:text-white">Mes demandes</h4>
        <button
          onClick={() => setShowNewRequest(true)}
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-center font-medium text-white hover:bg-opacity-90 lg:px-6 xl:px-8"
        >
          <svg
            className="mr-2 h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nouvelle demande
        </button>
      </div>

      {/* Table Container */}
      <div className="px-5 pb-2.5 pt-2 sm:px-7.5 xl:pb-1">
        <div className="max-w-full overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-2 text-left dark:bg-meta-4">
                <th className="min-w-[120px] px-4 py-4 font-medium text-black dark:text-white">
                  TJM
                </th>
                <th className="min-w-[150px] px-4 py-4 font-medium text-black dark:text-white">
                  Date
                </th>
                <th className="min-w-[100px] px-4 py-4 font-medium text-black dark:text-white">
                  Priorité
                </th>
                <th className="min-w-[120px] px-4 py-4 font-medium text-black dark:text-white">
                  Status
                </th>
                <th className="min-w-[120px] px-4 py-4 font-medium text-black dark:text-white">
                  Reponses
                </th>
                <th className="px-4 py-4 font-medium text-black dark:text-white">Actions</th>
              </tr>
            </thead>
            <tbody>
              {demandeData && demandeData.length > 0 ? (
                demandeData.map(demandeItem => (
                  <tr key={demandeItem.id}>
                    <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                      {demandeItem.tjm} €
                    </td>
                    <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                      {new Date(demandeItem.created_at)
                        .toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: 'short',
                          year: '2-digit',
                        })
                        .replace('.', '')}
                    </td>
                    <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                      <span
                        className={`inline-flex rounded-full bg-opacity-10 px-3 py-1 text-sm font-medium ${demandeItem.priority === 'LOW' ? 'bg-success text-success' : demandeItem.priority === 'HIGH' ? 'bg-danger text-danger' : 'bg-warning text-warning'}`}
                      >
                        {demandeItem.priority}
                      </span>
                    </td>
                    <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                      <span
                        className={`inline-flex rounded-full bg-opacity-10 px-3 py-1 text-sm font-medium ${demandeItem.mission_status === 'OPEN' ? 'bg-success text-success' : demandeItem.mission_status === 'PENDING' ? 'bg-danger text-danger' : 'bg-warning text-warning'}`}
                      >
                        {demandeItem.mission_status}
                      </span>
                    </td>
                    <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                      {demandeItem.responses?.length}
                    </td>
                    <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                      <div className="flex items-center space-x-3.5">
                        <button
                          className="group"
                          title="Voir les détails"
                          onClick={() => setSelectedDemande(demandeItem)}
                        >
                          <svg
                            className="fill-current group-hover:text-blue-500"
                            width="18"
                            height="18"
                            viewBox="0 0 18 18"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M8.99981 14.8219C3.43106 14.8219 0.674805 9.50624 0.562305 9.28124C0.47793 9.11249 0.47793 8.88749 0.562305 8.71874C0.674805 8.49374 3.43106 3.20624 8.99981 3.20624C14.5686 3.20624 17.3248 8.49374 17.4373 8.71874C17.5217 8.88749 17.5217 9.11249 17.4373 9.28124C17.3248 9.50624 14.5686 14.8219 8.99981 14.8219ZM1.85605 8.99999C2.4748 10.0406 4.89356 13.5562 8.99981 13.5562C13.1061 13.5562 15.5248 10.0406 16.1436 8.99999C15.5248 7.95936 13.1061 4.44374 8.99981 4.44374C4.89356 4.44374 2.4748 7.95936 1.85605 8.99999Z"
                              fill=""
                            />
                            <path
                              d="M9 11.3906C7.67812 11.3906 6.60938 10.3219 6.60938 9C6.60938 7.67813 7.67812 6.60938 9 6.60938C10.3219 6.60938 11.3906 7.67813 11.3906 9C11.3906 10.3219 10.3219 11.3906 9 11.3906ZM9 7.875C8.38125 7.875 7.875 8.38125 7.875 9C7.875 9.61875 8.38125 10.125 9 10.125C9.61875 10.125 10.125 9.61875 10.125 9C10.125 8.38125 9.61875 7.875 9 7.875Z"
                              fill=""
                            />
                          </svg>
                        </button>
                        <button className="group" title="Archiver">
                          <svg
                            className="fill-current group-hover:text-yellow-500"
                            width="18"
                            height="18"
                            viewBox="0 0 18 18"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <rect
                              x="3"
                              y="7"
                              width="12"
                              height="8"
                              rx="2"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              fill="none"
                            />
                            <path
                              d="M6 10h6"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                            />
                            <rect
                              x="2"
                              y="3"
                              width="14"
                              height="3"
                              rx="1.5"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              fill="none"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() => setSelectedResponse(demandeItem.id)}
                          className="group"
                          title="Voir les réponses"
                        >
                          <svg
                            className="fill-current group-hover:text-green-500"
                            width="18"
                            height="18"
                            viewBox="0 0 18 18"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M2 4.5A2.5 2.5 0 0 1 4.5 2h9A2.5 2.5 0 0 1 16 4.5v9A2.5 2.5 0 0 1 13.5 16h-9A2.5 2.5 0 0 1 2 13.5v-9Z"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              fill="none"
                            />
                            <path
                              d="M3 5l6 5 6-5"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              fill="none"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-4 text-gray-500 dark:text-gray-400">
                    Aucune demande trouvée.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="border-t border-stroke bg-gray-50 px-4 py-3 sm:px-6 dark:border-strokedark dark:bg-gray-800/50">
          <div className="flex items-center justify-between">
            {/* Results Info */}
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-strokedark dark:bg-boxdark dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Précédent
              </button>
              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-strokedark dark:bg-boxdark dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Suivant
              </button>
            </div>

            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Affichage{' '}
                  <span className="font-medium">
                    {(pagination.currentPage - 1) * pagination.pageSize + 1}
                  </span>{' '}
                  à{' '}
                  <span className="font-medium">
                    {Math.min(pagination.currentPage * pagination.pageSize, demandeData.length)}
                  </span>{' '}
                  sur <span className="font-medium">{demandeData.length}</span> résultats
                </p>
              </div>
              <div>
                <nav
                  className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                  aria-label="Pagination"
                >
                  {/* Previous Button */}
                  <button
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={pagination.currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-strokedark dark:bg-boxdark dark:text-gray-400 dark:hover:bg-gray-700"
                  >
                    <span className="sr-only">Précédent</span>
                    <svg
                      className="h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>

                  {/* Page Numbers */}
                  {generatePageNumbers().map((page, index) => (
                    <span key={index}>
                      {page === '...' ? (
                        <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 dark:border-strokedark dark:bg-boxdark dark:text-gray-300">
                          ...
                        </span>
                      ) : (
                        <button
                          onClick={() => handlePageChange(page as number)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            page === pagination.currentPage
                              ? 'z-10 bg-blue-50 border-blue-500 text-blue-600 dark:bg-blue-900/50 dark:border-blue-500 dark:text-blue-400'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50 dark:border-strokedark dark:bg-boxdark dark:text-gray-400 dark:hover:bg-gray-700'
                          }`}
                        >
                          {page}
                        </button>
                      )}
                    </span>
                  ))}

                  {/* Next Button */}
                  <button
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={pagination.currentPage === pagination.totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-strokedark dark:bg-boxdark dark:text-gray-400 dark:hover:bg-gray-700"
                  >
                    <span className="sr-only">Suivant</span>
                    <svg
                      className="h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MesDemandes;
