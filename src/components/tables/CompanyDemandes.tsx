'use client';
import { useState } from 'react';

import { demande } from '@/types/demande';

import CompanyResponse from '../company-response/CompanyResponse';

type PaginationProps = {
  currentPage: number;
  pageSize: number;
  totalPages: number;
};

type CompanyDemandesProps = {
  demandeData: demande[];
  pagination: PaginationProps;
  onPageChange?: (page: number) => void;
  onSortChange?: (sortOrder: 'newest' | 'oldest') => void;
  onDateFilter?: (date: string) => void;
  sortOrder?: 'newest' | 'oldest';
  selectedDate?: string;
  loading?: boolean;
};

const CompanyDemandes = ({
  demandeData,
  pagination,
  onPageChange,
  onSortChange,
  onDateFilter,
  sortOrder = 'newest',
  selectedDate = '',
  loading = false,
}: CompanyDemandesProps) => {
  const [responseRequestId, setResponseRequestId] = useState<number | null>(null);

  const handlePageChange = (page: number) => {
    if (onPageChange && page >= 1 && page <= pagination.totalPages) {
      onPageChange(page);
    }
  };

  const handleSortChange = (newSortOrder: 'newest' | 'oldest') => {
    if (onSortChange) {
      onSortChange(newSortOrder);
    }
  };

  const handleDateChange = (date: string) => {
    if (onDateFilter) {
      onDateFilter(date);
    }
  };

  const clearDateFilter = () => {
    if (onDateFilter) {
      onDateFilter('');
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

  if (responseRequestId) {
    return (
      <CompanyResponse requestId={responseRequestId} onClose={() => setResponseRequestId(null)} />
    );
  }
  return (
    <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
      {/* Filters Section */}
      <div className="border-b border-stroke px-5 py-4 dark:border-strokedark">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Sort Filter */}
          <div className="flex items-center gap-2">
            <label htmlFor="sortDate" className="text-sm font-medium text-black dark:text-white">
              Trier par:
            </label>
            <select
              value={sortOrder}
              id="sortDate"
              onChange={e => handleSortChange(e.target.value as 'newest' | 'oldest')}
              disabled={loading}
              className="rounded border border-stroke bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed dark:border-strokedark dark:bg-boxdark dark:text-white"
            >
              <option value="newest">Plus récent</option>
              <option value="oldest">Plus ancien</option>
            </select>
          </div>

          {/* Date Filter */}
          <div className="flex items-center gap-2">
            <label htmlFor="filterDate" className="text-sm font-medium text-black dark:text-white">
              Filtrer par date:
            </label>
            <input
              id="filterDate"
              type="date"
              value={selectedDate}
              onChange={e => handleDateChange(e.target.value)}
              disabled={loading}
              max={new Date().toISOString().split('T')[0]}
              className="rounded border border-stroke bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed dark:border-strokedark dark:bg-boxdark dark:text-white"
            />
            {selectedDate && (
              <button
                onClick={clearDateFilter}
                disabled={loading}
                className="text-sm text-red-500 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed dark:text-red-400 dark:hover:text-red-300"
                title="Effacer le filtre de date"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="px-5 pb-2.5 pt-6 sm:px-7.5 xl:pb-1">
        <div className="max-w-full overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-2 text-left dark:bg-meta-4">
                <th className="min-w-[100px] px-4 py-4 font-medium text-black dark:text-white">
                  Pseudonyme
                </th>
                <th className="min-w-[120px] px-4 py-4 font-medium text-black dark:text-white">
                  TJM
                </th>
                <th className="min-w-[150px] px-4 py-4 font-medium text-black dark:text-white">
                  <div className="flex items-center gap-2">
                    Date
                    <button
                      onClick={() => handleSortChange(sortOrder === 'newest' ? 'oldest' : 'newest')}
                      disabled={loading}
                      className="text-gray-500 hover:text-black disabled:opacity-50 disabled:cursor-not-allowed dark:text-gray-400 dark:hover:text-white"
                      title="Trier par date"
                    >
                      <svg
                        className={`h-4 w-4 transition-transform ${sortOrder === 'oldest' ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>
                  </div>
                </th>
                <th className="min-w-[100px] px-4 py-4 font-medium text-black dark:text-white">
                  Priorité
                </th>
                <th className="min-w-[120px] px-4 py-4 font-medium text-black dark:text-white">
                  Status
                </th>
                <th className="px-4 py-4 font-medium text-black dark:text-white">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                // Loading skeleton rows
                Array.from({ length: 5 }).map((_, index) => (
                  <tr key={`skeleton-${index}`}>
                    <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                      <div className="h-4 bg-gray-200 rounded animate-pulse dark:bg-gray-700"></div>
                    </td>
                    <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                      <div className="h-4 bg-gray-200 rounded animate-pulse dark:bg-gray-700"></div>
                    </td>
                    <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                      <div className="h-4 bg-gray-200 rounded animate-pulse dark:bg-gray-700"></div>
                    </td>
                    <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                      <div className="h-6 w-16 bg-gray-200 rounded-full animate-pulse dark:bg-gray-700"></div>
                    </td>
                    <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                      <div className="h-6 w-16 bg-gray-200 rounded-full animate-pulse dark:bg-gray-700"></div>
                    </td>
                    <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                      <div className="flex items-center space-x-3.5">
                        <div className="h-5 w-5 bg-gray-200 rounded animate-pulse dark:bg-gray-700"></div>
                        <div className="h-5 w-5 bg-gray-200 rounded animate-pulse dark:bg-gray-700"></div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : demandeData && demandeData.length > 0 ? (
                demandeData.map(demandeItem => (
                  <tr key={demandeItem.id}>
                    <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                      {demandeItem.freelance?.user ? (
                        <span className="font-medium">
                          {demandeItem.freelance.user.first_name.charAt(0).toUpperCase()}
                          {demandeItem.freelance.user.last_name.charAt(0).toUpperCase()}
                        </span>
                      ) : (
                        <span className="text-gray-400">--</span>
                      )}
                    </td>
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
                      <div className="flex items-center space-x-3.5">
                        {/* Archiver/Decliner Button */}
                        <button
                          className="group hover:bg-red-50 p-1.5 rounded-full transition-colors dark:hover:bg-red-900/20"
                          title="Archiver / Décliner l'offre"
                        >
                          <svg
                            className="w-5 h-5 text-gray-500 group-hover:text-red-600 transition-colors"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                        {/* Reply Button */}
                        <button
                          className="group hover:bg-blue-50 p-1.5 rounded-full transition-colors dark:hover:bg-blue-900/20"
                          title="Répondre à la demande"
                          onClick={() => setResponseRequestId(demandeItem.id)}
                        >
                          <svg
                            className="w-5 h-5 text-gray-500 group-hover:text-blue-600 transition-colors"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                            />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-gray-500 dark:text-gray-400">
                    {selectedDate
                      ? 'Aucune demande trouvée pour cette date.'
                      : 'Aucune demande trouvée.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && !loading && (
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

export default CompanyDemandes;
