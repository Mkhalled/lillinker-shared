'use client';
import { CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';

import InputField from '@/components/form/input/InputField';
import TextAreaField from '@/components/form/input/TextAreaField';
import { StyledCheckbox } from '@/components/form/StyledCheckbox';
import type { CompanyService, ServiceResponse } from '@/types/company-response'; 
import { OptionInfo } from '@/types/demande';

interface ServiceCardProps {
  service: CompanyService;
  response: ServiceResponse;
  isRequested: boolean;
  requestedOption?:OptionInfo
  onToggle: (companyServiceId: number, isActive: boolean) => void;
  onFeeChange: (companyServiceId: number, fee: string) => void; 
  onCommentChange: (companyServiceId: number, comment: string) => void; 
}

const ServiceCard: React.FC<ServiceCardProps> = ({
  service,
  response, 
  isRequested,
  requestedOption,
  onToggle,
  onFeeChange,
  onCommentChange,
}) => {
  const isPending = service.service.status === 'PENDING';
  const [showDetails, setShowDetails] = useState(false);

  // Extract relevant response data for this specific service from the overall company response
  const serviceResponseData = (response.response_data as any)?.services?.[service.id] || {};
  const isServiceAvailable = serviceResponseData.is_available || false;
  const managementFee = serviceResponseData.management_fee || '';
  const comment = serviceResponseData.comment || '';

  const hasAdditionalData =
    isRequested &&
    requestedOption?.platformService?.dataFields &&
    requestedOption.platformService.dataFields.length > 0 &&
    requestedOption.response_data;

  // For bonus services, show simplified layout
  if (!isRequested) {
    return (
      <tr
        className={`border-b border-slate-200 dark:border-slate-700 ${
          isPending
            ? 'bg-slate-100 dark:bg-slate-800/50 opacity-75'
            : isServiceAvailable
              ? 'bg-emerald-50 dark:bg-emerald-900/10'
              : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
        } transition-all duration-200`}
      >
        {/* Service Info */}
        <td className="py-4 px-3">
          <div className="flex items-center space-x-3">
            <StyledCheckbox
              checked={isServiceAvailable}
              onChange={e => onToggle(service.id, e.target.checked)} // Use service.id (CompanyService.id)
              disabled={isPending}
              size="md"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <h4
                  className={`font-medium text-sm ${
                    isPending
                      ? 'text-slate-400 dark:text-slate-500'
                      : 'text-slate-900 dark:text-white'
                  }`}
                >
                  {service.service.label}
                </h4>
                {isPending && (
                  <span className="inline-flex items-center bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 text-xs px-2 py-1 rounded-full font-medium">
                    En attente
                  </span>
                )}
                {isServiceAvailable && !isPending && (
                  <CheckCircle className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                )}
                <span className="inline-flex items-center bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 text-xs px-2 py-1 rounded-full font-medium">
                  Bonus
                </span>
              </div>
              {service.service.description && (
                <p
                  className={`text-xs leading-relaxed ${
                    isPending
                      ? 'text-slate-400 dark:text-slate-500'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {service.service.description}
                </p>
              )}
            </div>
          </div>
        </td>

        {/* Comment only for bonus services */}
        <td className="py-4 px-3">
          {isServiceAvailable && !isPending ? (
            <div className="w-full">
              <TextAreaField
                rows={2}
                value={comment}
                onChange={e => onCommentChange(service.id, e.target.value)} // Use service.id
                placeholder="Décrivez ce service bonus..."
                className="text-xs"
              />
            </div>
          ) : (
            <span className="text-slate-400 dark:text-slate-500 text-xs">-</span>
          )}
        </td>
      </tr>
    );
  }

  // For requested services, show full layout with expandable details
  return (
    <>
      <tr
        className={`border-b border-slate-200 dark:border-slate-700 ${
          isPending
            ? 'bg-slate-100 dark:bg-slate-800/50 opacity-75'
            : isServiceAvailable
              ? 'bg-emerald-50 dark:bg-emerald-900/10'
              : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
        } transition-all duration-200`}
      >
        {/* Checkbox + Service Label */}
        <td className="py-4 px-3">
          <div className="flex items-center space-x-3">
            <StyledCheckbox
              checked={isServiceAvailable}
              onChange={e => onToggle(service.id, e.target.checked)} // Use service.id
              disabled={isPending}
              size="md"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <h4
                  className={`font-medium text-sm ${
                    isPending
                      ? 'text-slate-400 dark:text-slate-500'
                      : 'text-slate-900 dark:text-white'
                  }`}
                >
                  {service.service.label}
                </h4>
                {isPending && (
                  <span className="inline-flex items-center bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 text-xs px-2 py-1 rounded-full font-medium">
                    En attente
                  </span>
                )}
                {isServiceAvailable && !isPending && (
                  <CheckCircle className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                )}
                <span className="inline-flex items-center bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300 text-xs px-2 py-1 rounded-full font-medium">
                  Demandé
                </span>
                {requestedOption?.is_required && (
                  <span className="inline-flex items-center bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 text-xs px-2 py-1 rounded-full font-medium">
                    Requis
                  </span>
                )}
              </div>
              {service.service.description && (
                <p
                  className={`text-xs leading-relaxed ${
                    isPending
                      ? 'text-slate-400 dark:text-slate-500'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {service.service.description}
                </p>
              )}
            </div>
          </div>
        </td>

        {/* Simplified Data Summary with Expand Button */}
        <td className="py-2 px-3">
          {hasAdditionalData ? (
            <div className="flex items-center space-x-2">
              <div className="flex-1">
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  {requestedOption?.platformService?.dataFields[0]?.label || 'Donnée Requise'}
                </span>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Réponse:{' '}
                  {(() => {
                    if (!requestedOption.response_data) return '-';
                    // Assuming response_data structure might be { dataFieldId: value } or similar
                    // For simplicity, taking the first value if it's an object, or direct value
                    const firstEntry = Object.values(requestedOption.response_data)[0];
                    if (!firstEntry) return '-';
                    if (Array.isArray(firstEntry)) return firstEntry.join(', ');
                    if (typeof firstEntry === 'object' && firstEntry !== null) {
                      const objValue = firstEntry as Record<string, unknown>;
                      return String(
                        objValue.label ||
                          objValue.name ||
                          objValue.value ||
                          JSON.stringify(objValue)
                      );
                    }
                    return String(firstEntry);
                  })()}
                </div>
              </div>
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                aria-label={showDetails ? 'Masquer les détails' : 'Voir les détails'}
              >
                {showDetails ? (
                  <ChevronUp className="w-3 h-3 text-slate-600 dark:text-slate-400" />
                ) : (
                  <ChevronDown className="w-3 h-3 text-slate-600 dark:text-slate-400" />
                )}
              </button>
            </div>
          ) : (
            <span className="text-slate-400 dark:text-slate-500 text-sm">
              Aucune donnée requise
            </span>
          )}
        </td>

        {/* Frais de gestion */}
        <td className="py-2 px-3">
          {isServiceAvailable && !isPending ? (
            <div className="w-20">
              <InputField
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={managementFee}
                onChange={e => onFeeChange(service.id, e.target.value)} // Use service.id
                placeholder="8.5"
                className="text-center text-xs"
              />
            </div>
          ) : (
            <span className="text-slate-400 dark:text-slate-500 text-xs">-</span>
          )}
        </td>

        {/* Commentaire / Conditions */}
        <td className="py-2 px-3">
          {isServiceAvailable && !isPending ? (
            <div className="w-full">
              <TextAreaField
                rows={2}
                value={comment}
                onChange={e => onCommentChange(service.id, e.target.value)} // Use service.id
                placeholder="Conditions, délais..."
                className="text-xs"
              />
            </div>
          ) : (
            <span className="text-slate-400 dark:text-slate-500 text-xs">-</span>
          )}
        </td>
      </tr>

      {/* Expandable Details Row */}
      {showDetails && hasAdditionalData && (
        <tr className="border-b border-slate-200 dark:border-slate-700">
          <td colSpan={4} className="px-3 py-2 bg-slate-50 dark:bg-slate-800/50">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <h5 className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                  Détails des données demandées
                </h5>
              </div>

              {requestedOption?.platformService?.dataFields.map(dataField => (
                <div key={dataField.id} className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-600 p-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Data Label & Description */}
                    <div>
                      <h6 className="text-xs font-medium text-slate-900 dark:text-slate-100 mb-1">
                        Question posée
                      </h6>
                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-2">
                        <p className="text-xs font-semibold text-blue-900 dark:text-blue-100">
                          {dataField.label}
                        </p>
                        {dataField.description && (
                          <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                            {dataField.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Freelancer's Response */}
                    <div>
                      <h6 className="text-xs font-medium text-slate-900 dark:text-slate-100 mb-1">
                        Réponse du freelancer
                      </h6>
                      <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-2">
                        {requestedOption.response_data &&
                          (requestedOption.response_data as any)?.[dataField.id] !== undefined ? (
                            (() => {
                              const value = (requestedOption.response_data as any)[dataField.id];
                              let displayValue = '';
                              if (Array.isArray(value)) {
                                displayValue = value.join(', ');
                              } else if (typeof value === 'object' && value !== null) {
                                const objectValue = value as Record<string, unknown>;
                                displayValue = String(
                                  objectValue.label ||
                                    objectValue.name ||
                                    objectValue.value ||
                                    JSON.stringify(objectValue)
                                );
                              } else {
                                displayValue = String(value);
                              }
                              return (
                                <p className="text-xs font-medium text-emerald-900 dark:text-emerald-100">
                                  {displayValue}
                                </p>
                              );
                            })()
                          ) : (
                            <p className="text-xs text-slate-400 dark:text-slate-500">Pas de réponse fournie</p>
                          )}
                      </div>
                    </div>
                  </div>

                  {/* Available Choices */}
                  {dataField.choices &&
                    (dataField.data_type === 'SELECT' ||
                      dataField.data_type === 'RADIO') && (
                      <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-600">
                        <h6 className="text-xs font-medium text-slate-900 dark:text-slate-100 mb-1">
                          Choix disponibles
                        </h6>
                        <div className="flex flex-wrap gap-1">
                          {(dataField.choices as string[]).map((choice: string, index: number) => (
                              <span
                                key={index}
                                className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-2 py-1 rounded-full border"
                              >
                                {choice}
                              </span>
                            )
                          )}
                        </div>
                      </div>
                    )}
                </div>
              ))}
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

export default ServiceCard;