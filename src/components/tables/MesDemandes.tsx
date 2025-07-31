'use client';
import { useState } from 'react';

import { demande } from '@/types/demande';

import { FreelanceRequestDetails } from '../details/FreelanceRequestDetails';

type MesDemandesProps = {
  demandeData: demande[];
};
const MesDemandes = ({ demandeData }: MesDemandesProps) => {
  const [selectedDemande, setSelectedDemande] = useState<demande | null>(null);

  if (selectedDemande) {
    return <FreelanceRequestDetails demandeItem={selectedDemande} />;
  }

  return (
    <div className="rounded-sm border border-stroke bg-white px-5 pb-2.5 pt-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
      <div className="max-w-full overflow-x-auto">
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-gray-2 text-left dark:bg-meta-4">
              <th className="min-w-[80px] px-4 py-4 font-medium text-black dark:text-white">ID</th>
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
                    {demandeItem.id}
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
                    {demandeItem.responses.length}
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
                      <button className="group" title="Voir les réponses">
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
                <td colSpan={7} className="text-center py-4">
                  Aucune demande trouvée.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MesDemandes;
