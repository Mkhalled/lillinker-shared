import type React from 'react';

import CollapsibleRow from '@/components/settings/CollapsibleRow';
import type { CompanyService, ServiceResponse } from '@/types/company-response';
import type { OptionInfo } from '@/types/demande';

import ServiceCard from './ServiceCard';

interface BonusServicesSectionProps {
  company_services: CompanyService[];
  freelance_request_options: OptionInfo[];
  responses: Record<number, ServiceResponse>;
  onToggle: (serviceId: number, available: boolean) => void;
  onFeeChange: (serviceId: number, fee: string) => void;
  onCommentChange: (serviceId: number, comment: string) => void;
}

const BonusServicesSection: React.FC<BonusServicesSectionProps> = ({
  company_services,
  freelance_request_options,
  responses,
  onToggle,
  onFeeChange,
  onCommentChange,
}) => {
  const bonusServices = company_services.filter(service => {
    return !freelance_request_options.some(
      option => option.platformService.id === service.service.id
    );
  });

  return (
    <CollapsibleRow title="Services Supplémentaires (Bonus)" defaultOpen={false}>
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-lg">
        <div className="bg-indigo-50 dark:bg-indigo-900/20 border-b border-indigo-200 dark:border-indigo-700 px-6 py-3">
          <p className="text-sm text-indigo-800 dark:text-indigo-200 font-medium">
            Proposez des services supplémentaires pour enrichir votre offre et vous démarquer.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="py-2 px-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300">
                  Service
                </th>
                <th className="py-2 px-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300">
                  Commentaire / Conditions
                </th>
              </tr>
            </thead>
            <tbody>
              {bonusServices.map(service => (
                <ServiceCard
                  key={service.service.id}
                  service={service}
                  response={responses[service.service.id]}
                  isRequested={false}
                  onToggle={onToggle}
                  onFeeChange={onFeeChange}
                  onCommentChange={onCommentChange}
                />
              ))}
              {bonusServices.length === 0 && (
                <tr>
                  <td
                    colSpan={2}
                    className="py-8 px-6 text-center text-slate-500 dark:text-slate-400"
                  >
                    Aucun service supplémentaire disponible
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </CollapsibleRow>
  );
};

export default BonusServicesSection;
