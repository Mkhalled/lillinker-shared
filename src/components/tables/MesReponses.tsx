'use client';
import { useState, useEffect } from 'react';

import { FreelanceRequestDetails } from '../details/FreelanceRequestDetails';
import NewRequest from '../new-request/NewRequest';

type CompanyResponse = {
  id: number;
  request_id: number;
  company_id: number;
  response_data: {
    services: Array<{
      comment: string;
      service_id: number;
      is_available: boolean;
      service_name: string;
      management_fee: number;
      service_description: string;
    }>;
    frais_de_gestion: {
      value: string;
      manual: boolean;
    };
    selected_organismes: Array<{
      label: string;
      organisme_id: number;
      total_patronal: number;
      total_salarial: number;
    }>;
  };
  created_at: string;
  updated_at: string;
  company: {
    pseudonyme?: string;
  };
};

type FreelanceRequest = {
  id: number;
  freelance_id: number;
  mission_status: string;
  client_name?: string;
  client_address?: string;
  client_sector?: string;
  priority: string;
  tjm: number;
  want_salaried: boolean;
  salary?: number;
  start_date?: string;
  days: number;
  wants_portage: boolean;
  created_at: string;
  responses: CompanyResponse[];
};

type MesReponsesProps = {
  requestId: number;
};

const MesReponses = ({ requestId }: MesReponsesProps) => {
  const [requestData, setRequestData] = useState<FreelanceRequest | null>(null);
  const [selectedDemande, setSelectedDemande] = useState<any | null>(null);
  const [showNewRequest, setShowNewRequest] = useState(false);
  const [loading, setLoading] = useState(true);

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

  const calculateMetrics = (response: CompanyResponse, tjm: number, days: number) => {
    // Chiffre d'affaires par mois
    const chiffreAffaires = tjm * days;
    
    // Frais de gestion (percentage from response_data)
    const fraisGestionPercent = parseFloat(response.response_data.frais_de_gestion.value) || 0;
    const fraisGestionAmount = (chiffreAffaires * fraisGestionPercent) / 100;
    
    // Total charges patronales (sum from selected_organismes)
    const totalPatronalPercent = response.response_data.selected_organismes?.reduce(
      (sum, org) => sum + org.total_patronal, 0
    ) || 0;
    const totalPatronalAmount = (chiffreAffaires * totalPatronalPercent) / 100;

    // Total charges salariales (sum from selected_organismes)
    const totalSalarialPercent = response.response_data.selected_organismes?.reduce(
      (sum, org) => sum + org.total_salarial, 0
    ) || 0;
    const totalSalarialAmount = (chiffreAffaires * totalSalarialPercent) / 100;

    // Total charges professionnelles (sum of all services management_fee)
    const totalChargesProPercent = response.response_data.services?.reduce(
      (sum, service) => sum + service.management_fee, 0
    ) || 0;
    const totalChargesProAmount = (chiffreAffaires * totalChargesProPercent) / 100;
    
    // Rest après déductions: CA - frais gestion - frais pro - (patronal + salarial)
    const restChiffreAffaires = chiffreAffaires - fraisGestionAmount - totalChargesProAmount - (totalPatronalAmount + totalSalarialAmount);

    // Percentage reçu par l'utilisateur: rest / CA
    const percentageRecu = chiffreAffaires > 0 ? (restChiffreAffaires / chiffreAffaires) * 100 : 0;

    return {
      chiffreAffaires,
      fraisGestionPercent,
      totalPatronalPercent,
      totalSalarialPercent,
      totalChargesProPercent,
      restChiffreAffaires,
      percentageRecu
    };
  };

  if (selectedDemande) {
    return (
      <FreelanceRequestDetails
        demandeItem={selectedDemande}
        onClose={() => setSelectedDemande(null)}
      />
    );
  }

  if (showNewRequest) {
    return <NewRequest onClose={() => setShowNewRequest(false)} />;
  }

  if (loading) {
    return (
      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="flex justify-center items-center py-8">
          <div className="text-gray-500 dark:text-gray-400">Chargement...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
      {/* Header with New Request Button */}
      <div className="flex justify-between items-center px-5 pt-6 pb-2 sm:px-7.5">
        <h4 className="text-xl font-semibold text-black dark:text-white">Mes Réponses</h4>
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
                  Chiffre d'Affaires
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
                  Reste CA
                </th>
                <th className="min-w-[100px] px-4 py-4 font-medium text-black dark:text-white">
                  % Reçu
                </th>
                <th className="px-4 py-4 font-medium text-black dark:text-white">Actions</th>
              </tr>
            </thead>
            <tbody>
              {requestData?.responses && requestData.responses.length > 0 ? (
                requestData.responses.map(response => {
                  const metrics = calculateMetrics(response, requestData.tjm, requestData.days);
                  
                  return (
                    <tr key={response.id}>
                      <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                        {response.company?.pseudonyme || 'Non défini'}
                      </td>
                      <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                        {metrics.chiffreAffaires.toFixed(2)} €
                      </td>
                      <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                        {metrics.fraisGestionPercent.toFixed(1)}%
                      </td>
                      <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                        {metrics.totalPatronalPercent.toFixed(1)}%
                      </td>
                      <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                        {metrics.totalSalarialPercent.toFixed(1)}%
                      </td>
                      <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                        {metrics.totalChargesProPercent.toFixed(1)}%
                      </td>
                      <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                        <span className={`font-medium ${metrics.restChiffreAffaires > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {metrics.restChiffreAffaires.toFixed(2)} €
                        </span>
                      </td>
                      <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                        <span className={`font-medium ${metrics.percentageRecu > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {metrics.percentageRecu.toFixed(1)}%
                        </span>
                      </td>
                      <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                        <div className="flex items-center space-x-3.5">
                          <button
                            className="group"
                            title="Voir les détails"
                            onClick={() => setSelectedDemande(response)}
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
                  <td colSpan={9} className="text-center py-4 text-gray-500 dark:text-gray-400">
                    {requestData ? 'Aucune réponse trouvée.' : 'Aucune donnée disponible.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
    </div>
  );
};

export default MesReponses;