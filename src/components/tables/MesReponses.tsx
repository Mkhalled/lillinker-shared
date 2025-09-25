'use client';
import { useState, useEffect } from 'react';

import { ExistingCompanyResponse } from '@/types/company-response';
import { FreelanceRequest } from '@/types/freelance';

import ReponseSkeleton from '../common/skeleton/Reponses';
import ResponseDetails from '../details/ResponseDetails';

type MesReponsesProps = {
  requestId: number;
};

const MesReponses = ({ requestId }: MesReponsesProps) => {
  const [requestData, setRequestData] = useState<FreelanceRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedResponse, setSelectedResponse] = useState<ExistingCompanyResponse | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const pageSize = 5; // 5 responses per page

  const handleViewDetails = (response: ExistingCompanyResponse) => {
    setSelectedResponse(response);
    setShowDetails(true);
  };

  const handleBackToList = () => {
    setShowDetails(false);
    setSelectedResponse(null);
  };

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
    
    // Get social contribution rates
    const totalPatronalPercent =
      response.response_data.selected_organismes?.reduce(
        (sum, org) => sum + org.total_patronal,
        0
      ) || 0;
    const totalSalarialPercent =
      response.response_data.selected_organismes?.reduce(
        (sum, org) => sum + org.total_salarial,
        0
      ) || 0;
    
    // Professional charges
    const totalChargesProAmount =
      response.response_data.services?.reduce((sum, service) => sum + service.charge_pro, 0) || 0;

    // French portage calculation: CA - Management fees = remaining amount
    const remainingAfterManagement = chiffreAffaires - fraisGestionAmount;
    
    // Calculate gross salary: remaining / (1 + employer rate%)
    const employerRateDecimal = totalPatronalPercent / 100;
    const grossSalary = remainingAfterManagement / (1 + employerRateDecimal);
    
    // Calculate actual patronal charges from gross salary
    const totalPatronalAmount = grossSalary * employerRateDecimal;
    
    // Calculate employee social contributions from gross salary
    const totalSalarialAmount = (grossSalary * totalSalarialPercent) / 100;
    
    // Net salary after employee contributions
    const netSalary = grossSalary - totalSalarialAmount;
    
    // Total charges (employer + employee)
    const totalCharges = totalPatronalAmount + totalSalarialAmount;
    
    // Final amount received (net salary + professional services)
    const restCANet = netSalary + totalChargesProAmount;
    const percentageRecu = chiffreAffaires > 0 ? (restCANet / chiffreAffaires) * 100 : 0;

    return {
      chiffreAffaires,
      fraisGestionPercent,
      totalPatronalPercent,
      totalSalarialPercent,
      fraisGestionAmount,
      totalPatronalAmount,
      totalSalarialAmount,
      totalChargesProAmount,
      totalCharges,
      restCANet,
      percentageRecu,
      grossSalary,
      netSalary,
      // Additional properties for ResponseDetails modal
      brutSalary: grossSalary,
      chargesPatronales: totalPatronalAmount,
      chargesSalariales: totalSalarialAmount,
      netBeforeServices: netSalary,
      selectedServicesTotal: totalChargesProAmount,
      netFinal: restCANet,
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
          ? metricsB.restCANet - metricsA.restCANet
          : metricsA.restCANet - metricsB.restCANet;
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

  // Show details page if a response is selected
  if (showDetails && selectedResponse && requestData) {
    return (
      <ResponseDetails
        response={selectedResponse}
        metrics={calculateMetrics(
          selectedResponse,
          parseFloat(requestData.tjm),
          parseInt(requestData.days)
        )}
        requestData={{
          tjm: parseFloat(requestData.tjm),
          days: parseInt(requestData.days),
        }}
        onBack={handleBackToList}
      />
    );
  }

  return (
    <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
      {/* Header with New Request Button */}
      <div className="flex flex-col space-y-3 px-5 pt-6 pb-2 sm:px-7.5 sm:flex-row sm:justify-between sm:items-center sm:space-y-0">
        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4">
          <h4 className="text-xl font-semibold text-black dark:text-white">
            Mes Réponses ({totalResponses})
          </h4>
        </div>
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
                <th className="min-w-[120px] px-4 py-4 font-medium text-black dark:text-white">
                  Frais de Gestion
                </th>
                <th className="min-w-[140px] px-4 py-4 font-medium text-black dark:text-white">
                  Total Charges
                </th>
                <th className="min-w-[120px] px-4 py-4 font-medium text-black dark:text-white">
                  <button onClick={handleSort} className="flex items-center gap-1">
                    Reste CA + <br /> Charges Pro
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
                        {metrics.fraisGestionAmount.toFixed(2)} €
                      </td>
                      <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                        {metrics.totalCharges.toFixed(2)} €
                      </td>
                      <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                        <span
                          className={`font-medium ${metrics.restCANet > 0 ? 'text-green-600' : 'text-red-600'}`}
                        >
                          {metrics.restCANet.toFixed(2)} €
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
                            <button
                          className="group"
                          title="Voir les détails"
                          onClick={() => handleViewDetails(response)}
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
                  <td colSpan={6} className="text-center py-4 text-gray-500 dark:text-gray-400">
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
