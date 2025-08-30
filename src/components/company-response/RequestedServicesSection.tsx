import type React from 'react';

import CollapsibleRow from '@/components/settings/CollapsibleRow';
import type { CompanyService, ServiceResponse } from '@/types/company-response';
import type { OptionInfo } from '@/types/demande';

import ServiceCard from './ServiceCard';

interface RequestedServicesSectionProps {
  company_services: CompanyService[];
  freelance_request_options: OptionInfo[];
  responses: Record<number, ServiceResponse>;
  onToggle: (serviceId: number, available: boolean) => void;
  onFeeChange: (serviceId: number, fee: string) => void;
  onCommentChange: (serviceId: number, comment: string) => void;
}

const RequestedServicesSection: React.FC<RequestedServicesSectionProps> = ({
  company_services,
  freelance_request_options,
  responses,
  onToggle,
  onFeeChange,
  onCommentChange,
}) => {
  const requestedServices = company_services.filter(service => {
    return freelance_request_options.some(
      option => option.platformService.id === service.service.id
    );
  });

  return (
    <CollapsibleRow title="Services Demandés par le Freelancer" defaultOpen={true}>
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-lg">
        <div className="bg-emerald-50 dark:bg-emerald-900/20 border-b border-emerald-200 dark:border-emerald-700 px-6 py-3">
          <p className="text-sm text-emerald-800 dark:text-emerald-200 font-medium">
            Ces services ont été spécifiquement demandés. Cochez ceux que vous pouvez fournir et
            définissez vos tarifs.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="py-2 px-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 w-2/5">
                  Service
                </th>
                <th className="py-2 px-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 w-1/5">
                  Données supplémentaires demandées
                </th>
                <th className="py-2 px-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 w-1/6">
                  Frais de gestion (%)
                  <span className="text-red-500 ml-1">*</span>
                </th>
                <th className="py-2 px-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 w-1/4">
                  Commentaire / Conditions
                </th>
              </tr>
            </thead>
            <tbody>
              {requestedServices.map(service => {
                const requestedOption = freelance_request_options.find(
                  option => option.platformService.id === service.service.id
                );

                return (
                  <ServiceCard
                    key={service.service.id}
                    service={service}
                    response={responses[service.service.id]}
                    isRequested={true}
                    requestedOption={requestedOption}
                    onToggle={onToggle}
                    onFeeChange={onFeeChange}
                    onCommentChange={onCommentChange}
                  />
                );
              })}
              {requestedServices.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="py-8 px-6 text-center text-slate-500 dark:text-slate-400"
                  >
                    Aucun service spécifiquement demandé
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

export default RequestedServicesSection;