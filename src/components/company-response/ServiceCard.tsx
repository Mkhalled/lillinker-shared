'use client';
import { CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';

import InputField from '@/components/form/input/InputField';
import TextAreaField from '@/components/form/input/TextAreaField';
import { StyledCheckbox } from '@/components/form/StyledCheckbox';
import type { ServiceResponse } from '@/types/company-response';

interface ServiceCardProps {
  service: {
    service: {
      id: number;
      label: string;
      description?: string | null;
      status: string;
    };
  };
  response: ServiceResponse;
  isRequested: boolean;
  requestedOption?: {
    id: number;
    freelance_request_id: number;
    service_option_id: number;
    is_required: boolean;
    response_data?: Record<string, unknown>;
    platformService?: {
      id: number;
      label: string;
      description?: string | null;
      data_type: string;
      requires_data: boolean;
      data_label?: string;
      data_description?: string | null;
      choices?: string[] | null;
    };
  };
  onToggle: (serviceId: number, isAvailable: boolean) => void;
  onFeeChange: (serviceId: number, fee: string) => void;
  onCommentChange: (serviceId: number, comment: string) => void;
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
  const hasAdditionalData =
    isRequested && requestedOption?.platformService?.requires_data && requestedOption.response_data;

  // For bonus services, show simplified layout
  if (!isRequested) {
    return (
      <tr
        className={`border-b border-slate-200 dark:border-slate-700 ${
          isPending
            ? 'bg-slate-100 dark:bg-slate-800/50 opacity-75'
            : response.is_available
              ? 'bg-emerald-50 dark:bg-emerald-900/10'
              : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
        } transition-all duration-200`}
      >
        {/* Service Info */}
        <td className="py-4 px-3">
          <div className="flex items-center space-x-3">
            <StyledCheckbox
              checked={response.is_available || false}
              onChange={e => onToggle(service.service.id, e.target.checked)}
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
                {response.is_available && !isPending && (
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
          {response.is_available && !isPending ? (
            <div className="w-full">
              <TextAreaField
                rows={2}
                value={response.comment || ''}
                onChange={e => onCommentChange(service.service.id, e.target.value)}
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
            : response.is_available
              ? 'bg-emerald-50 dark:bg-emerald-900/10'
              : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
        } transition-all duration-200`}
      >
        {/* Checkbox + Service Label */}
        <td className="py-4 px-3">
          <div className="flex items-center space-x-3">
            <StyledCheckbox
              checked={response.is_available || false}
              onChange={e => onToggle(service.service.id, e.target.checked)}
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
                {response.is_available && !isPending && (
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
                  {requestedOption?.platformService?.data_label}
                </span>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Réponse:{' '}
                  {(() => {
                    if (!requestedOption.response_data) return '-';
                    const firstEntry = Object.entries(requestedOption.response_data)[0];
                    if (!firstEntry) return '-';
                    const [, value] = firstEntry;
                    if (Array.isArray(value)) return value.join(', ');
                    if (typeof value === 'object' && value !== null) {
                      const objValue = value as Record<string, unknown>;
                      return String(
                        objValue.label ||
                          objValue.name ||
                          objValue.value ||
                          JSON.stringify(objValue)
                      );
                    }
                    return String(value);
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
          {response.is_available && !isPending ? (
            <div className="w-20">
              <InputField
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={response.management_fee || 0}
                onChange={e => onFeeChange(service.service.id, e.target.value)}
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
          {response.is_available && !isPending ? (
            <div className="w-full">
              <TextAreaField
                rows={2}
                value={response.comment || ''}
                onChange={e => onCommentChange(service.service.id, e.target.value)}
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

              <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-600 p-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Data Label & Description */}
                  <div>
                    <h6 className="text-xs font-medium text-slate-900 dark:text-slate-100 mb-1">
                      Question posée
                    </h6>
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-2">
                      <p className="text-xs font-semibold text-blue-900 dark:text-blue-100">
                        {requestedOption?.platformService?.data_label}
                      </p>
                      {requestedOption?.platformService?.data_description && (
                        <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                          {requestedOption.platformService.data_description}
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
                        Object.entries(requestedOption.response_data).map(([key, value]) => {
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
                            <p
                              key={key}
                              className="text-xs font-medium text-emerald-900 dark:text-emerald-100"
                            >
                              {displayValue}
                            </p>
                          );
                        })}
                    </div>
                  </div>
                </div>

                {/* Available Choices */}
                {requestedOption?.platformService?.choices &&
                  (requestedOption.platformService.data_type === 'SELECT' ||
                    requestedOption.platformService.data_type === 'RADIO') && (
                    <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-600">
                      <h6 className="text-xs font-medium text-slate-900 dark:text-slate-100 mb-1">
                        Choix disponibles
                      </h6>
                      <div className="flex flex-wrap gap-1">
                        {requestedOption.platformService.choices.map(
                          (choice: string, index: number) => (
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
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

export default ServiceCard;
