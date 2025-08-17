import type React from 'react';

import { StyledCheckbox } from '@/components/form/StyledCheckbox';
import CollapsibleRow from '@/components/settings/CollapsibleRow';
import type { OrganismeWithCotisations } from '@/types/organisme';

interface OrganismesSectionProps {
  organismes: OrganismeWithCotisations[];
  selectedOrganismes: number[];
  onOrganismeChange: (organismeId: number) => (e: React.ChangeEvent<HTMLInputElement>) => void;
  calculateOrganismeTotals: (organisme: OrganismeWithCotisations) => {
    totalPatronal: number;
    totalSalarial: number;
  };
}

const OrganismesSection: React.FC<OrganismesSectionProps> = ({
  organismes,
  selectedOrganismes,
  onOrganismeChange,
  calculateOrganismeTotals,
}) => {
  if (organismes.length === 0) {
    return null;
  }

  return (
    <CollapsibleRow title="Organismes et Cotisations" defaultOpen={false}>
      <div className="space-y-6">
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="py-2 px-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300">
                    Organisme
                  </th>
                  <th className="py-2 px-3 text-center text-xs font-medium text-gray-600 dark:text-gray-300">
                    Total Patronal (%)
                  </th>
                  <th className="py-2 px-3 text-center text-xs font-medium text-gray-600 dark:text-gray-300">
                    Total Salarial (%)
                  </th>
                </tr>
              </thead>
              <tbody>
                {organismes.map(organisme => {
                  const { totalPatronal, totalSalarial } = calculateOrganismeTotals(organisme);
                  const isSelected = selectedOrganismes.includes(organisme.id);

                  return (
                    <tr
                      key={organisme.id}
                      className={`border-b border-slate-200 dark:border-slate-700 ${isSelected ? 'bg-indigo-50 dark:bg-indigo-900/10' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'} transition-all duration-200`}
                    >
                      <td className="py-2 px-3">
                        <div className="flex items-center space-x-3">
                          <StyledCheckbox
                            id={`organisme-${organisme.id}`}
                            checked={isSelected}
                            onChange={onOrganismeChange(organisme.id)}
                            size="md"
                            className="flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-slate-900 dark:text-white text-sm mb-1">
                              {organisme.label}
                            </h4>
                          </div>
                        </div>
                      </td>
                      <td className="py-2 px-3 text-center">
                        <span className="text-gray-900 dark:text-gray-100 font-medium text-xs">
                          {totalPatronal.toFixed(2)}%
                        </span>
                      </td>
                      <td className="py-2 px-3 text-center">
                        <span className="text-gray-900 dark:text-gray-100 font-medium text-xs">
                          {totalSalarial.toFixed(2)}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </CollapsibleRow>
  );
};

export default OrganismesSection;
