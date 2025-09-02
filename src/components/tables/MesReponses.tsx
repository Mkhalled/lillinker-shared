'use client';
import { useState, useEffect } from 'react';

import { ExistingCompanyResponse } from '@/types/company-response';
import { FreelanceRequest } from '@/types/freelance';

import ReponseSkeleton from '../common/skeleton/Reponses';

type MesReponsesProps = {
  requestId: number;
};

const MesReponses = ({ requestId }: MesReponsesProps) => {
  const [requestData, setRequestData] = useState<FreelanceRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const pageSize = 5; // 5 responses per page

  useEffect(() => {
    const fetchRequestData = async () => {
      try {
        const response = await fetch(`/api/freelance/responses?id=${requestId}`);
        if (response.ok) {
          const data = await response.json();
          setRequestData(data);
        }
      } catch (error) {
        console.error('Error fetching request data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (requestId) {
      fetchRequestData();
    }
  }, [requestId]);

  const calculateMetrics = (response: ExistingCompanyResponse, tjm: number, days: number) => {
    const chiffreAffaires = tjm * days;
    const fraisGestionPercent = response.response_data.frais_de_gestion.value || 0;
    const fraisGestionAmount = (chiffreAffaires * fraisGestionPercent) / 100;
    const totalPatronalPercent =
      response.response_data.selected_organismes?.reduce(
        (sum, org) => sum + org.total_patronal,
        0
      ) || 0;
    const totalPatronalAmount = (chiffreAffaires * totalPatronalPercent) / 100;
    const totalSalarialPercent =
      response.response_data.selected_organismes?.reduce(
        (sum, org) => sum + org.total_salarial,
        0
      ) || 0;
    const totalSalarialAmount = (chiffreAffaires * totalSalarialPercent) / 100;
    const totalChargesProAmount =
      response.response_data.services?.reduce((sum, service) => sum + service.charge_pro, 0) ||
      0;
    const restChiffreAffaires =
      chiffreAffaires -
      fraisGestionAmount -
      (totalPatronalAmount + totalSalarialAmount) +
      totalChargesProAmount;
    const percentageRecu = chiffreAffaires > 0 ? (restChiffreAffaires / chiffreAffaires) * 100 : 0;

    return {
      chiffreAffaires,
      fraisGestionPercent,
      totalPatronalPercent,
      totalSalarialPercent,
      fraisGestionAmount,
      totalPatronalAmount,
      totalSalarialAmount,
      totalChargesProAmount,
      restChiffreAffaires,
      percentageRecu,
    };
  };

  // Sorting and Pagination
  const sortedResponses = requestData?.responses
    ? [...requestData.responses].sort((a, b) => {
        const metricsA = calculateMetrics(
          a,
          parseFloat(requestData!.tjm),
          parseInt(requestData!.days)
        );
        const metricsB = calculateMetrics(
          b,
          parseFloat(requestData!.tjm),
          parseInt(requestData!.days)
        );
        return sortOrder === 'desc'
          ? metricsB.restChiffreAffaires - metricsA.restChiffreAffaires
          : metricsA.restChiffreAffaires - metricsB.restChiffreAffaires;
      })
    : [];

  const totalResponses = sortedResponses.length;
  const totalPages = Math.ceil(totalResponses / pageSize);
  const paginatedResponses = sortedResponses.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleSort = () => {
    setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    setCurrentPage(1); // Reset to first page when sorting changes
  };

  const generatePageNumbers = () => {
    const pages = [];
    if (totalPages > 0) pages.push(1);
    const start = Math.max(2, currentPage - 2);
    const end = Math.min(totalPages - 1, currentPage + 2);
    if (start > 2) pages.push('...');
    for (let i = start; i <= end; i++) {
      if (i !== 1 && i !== totalPages) pages.push(i);
    }
    if (end < totalPages - 1) pages.push('...');
    if (totalPages > 1) pages.push(totalPages);
    return pages;
  };

  if (loading) {
    return <ReponseSkeleton />;
  }

  return (
    <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
      {/* Header with New Request Button */}
      <div className="flex justify-between items-center px-5 pt-6 pb-2 sm:px-7.5">
        <h4 className="text-xl font-semibold text-black dark:text-white">Mes Réponses</h4>
        <button className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-center font-medium text-white hover:bg-opacity-90 lg:px-6 xl:px-8">
          <svg
            className="mr-2 h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Télécharger les réponses
        </button>
      </div>

      {/* Table Container */}
      <div className="px-5 pb-2.5 pt-2 sm:px-7.5 xl:pb-1">
        <div className="max-w-full overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-2 text-left dark:bg-meta-4">
                <th className="min-w-[120px] px-4 py-4 font-medium text-black dark:text-white">
                  Pseudonyme
                </th>
                <th className="min-w-[150px] px-4 py-4 font-medium text-black dark:text-white">
                  Chiffre d&apos;Affaires
                </th>
                <th className="min-w-[120px] px-4 py-4 font-medium text-black dark:text-white">
                  Frais de Gestion
                </th>
                <th className="min-w-[120px] px-4 py-4 font-medium text-black dark:text-white">
                  Total Patronal
                </th>
                <th className="min-w-[120px] px-4 py-4 font-medium text-black dark:text-white">
                  Total Salarial
                </th>
                <th className="min-w-[140px] px-4 py-4 font-medium text-black dark:text-white">
                  Charges Pro.
                </th>
                <th className="min-w-[120px] px-4 py-4 font-medium text-black dark:text-white">
                  <button onClick={handleSort} className="flex items-center gap-1">
                    Reste CA
                    <svg
                      className={`w-4 h-4 transform ${sortOrder === 'asc' ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 14l-7 7m0 0l-7-7m7 7V3"
                      />
                    </svg>
                  </button>
                </th>
                <th className="min-w-[100px] px-4 py-4 font-medium text-black dark:text-white">
                  % Reçu
                </th>
                <th className="px-4 py-4 font-medium text-black dark:text-white">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedResponses.length > 0 ? (
                paginatedResponses.map(response => {
                  const metrics = calculateMetrics(
                    response,
                    parseFloat(requestData!.tjm),
                    parseInt(requestData!.days)
                  );

                  return (
                    <tr key={response.id}>
                      <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                        {response.company?.name.slice(0, 3).toUpperCase()}
                      </td>
                      <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                        {metrics.chiffreAffaires.toFixed(2)} €
                      </td>
                      <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                        {metrics.fraisGestionAmount.toFixed(2)} €
                      </td>
                      <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                        {metrics.totalPatronalAmount.toFixed(2)} €
                      </td>
                      <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                        {metrics.totalSalarialAmount.toFixed(2)} €
                      </td>
                      <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                        {metrics.totalChargesProAmount.toFixed(2)} €
                      </td>
                      <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                        <span
                          className={`font-medium ${metrics.restChiffreAffaires > 0 ? 'text-green-600' : 'text-red-600'}`}
                        >
                          {metrics.restChiffreAffaires.toFixed(2)} €
                        </span>
                      </td>
                      <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                        <span
                          className={`font-medium ${metrics.percentageRecu > 0 ? 'text-green-600' : 'text-red-600'}`}
                        >
                          {metrics.percentageRecu.toFixed(1)}%
                        </span>
                      </td>
                      <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                        <div className="flex items-center space-x-3.5">
                          <button className="group" title="Télécharger PDF">
                            <svg
                              className="fill-current group-hover:text-green-500"
                              width="18"
                              height="18"
                              viewBox="0 0 18 18"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M9 1.5v9m0 0L6 7.5m3 3.5 3-3.5M2.25 12.75v2.25c0 1.24 1.01 2.25 2.25 2.25h9c1.24 0 2.25-1.01 2.25-2.25v-2.25"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                fill="none"
                              />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={9} className="text-center py-4 text-gray-500 dark:text-gray-400">
                    {requestData ? 'Aucune réponse trouvée.' : 'Aucune donnée disponible.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="border-t border-stroke bg-gray-50 px-4 py-3 sm:px-6 dark:border-strokedark dark:bg-gray-800/50">
          <div className="flex items-center justify-between">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-strokedark dark:bg-boxdark dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Précédent
              </button>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-strokedark dark:bg-boxdark dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Suivant
              </button>
            </div>

            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Affichage <span className="font-medium">{(currentPage - 1) * pageSize + 1}</span>{' '}
                  à{' '}
                  <span className="font-medium">
                    {Math.min(currentPage * pageSize, totalResponses)}
                  </span>{' '}
                  sur <span className="font-matter">{totalResponses}</span> résultats
                </p>
              </div>
              <div>
                <nav
                  className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                  aria-label="Pagination"
                >
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
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
                            page === currentPage
                              ? 'z-10 bg-blue-50 border-blue-500 text-blue-600 dark:bg-blue-900/50 dark:border-blue-500 dark:text-blue-400'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50 dark:border-strokedark dark:bg-boxdark dark:text-gray-400 dark:hover:bg-gray-700'
                          }`}
                        >
                          {page}
                        </button>
                      )}
                    </span>
                  ))}

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
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

export default MesReponses;
