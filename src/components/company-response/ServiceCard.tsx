"use client"

import type React from "react"
import { CheckCircle } from "lucide-react"
import type { ServiceResponse } from "@/types/company-response"
import { StyledCheckbox } from "@/components/form/StyledCheckbox"
import InputField from "@/components/form/input/InputField"
import TextAreaField from "@/components/form/input/TextAreaField"

interface ServiceCardProps {
  service: any
  response: ServiceResponse
  isRequested: boolean
  requestedOption?: any
  onToggle: (serviceId: number, isAvailable: boolean) => void
  onFeeChange: (serviceId: number, fee: string) => void
  onCommentChange: (serviceId: number, comment: string) => void
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
  return (
    <tr className={`border-b border-slate-200 dark:border-slate-700 ${response.is_available ? 'bg-emerald-50 dark:bg-emerald-900/10' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'} transition-all duration-200`}>
      {/* Checkbox + Service Label */}
      <td className="py-6 px-6">
        <div className="flex items-center space-x-4">
          <StyledCheckbox
            checked={response.is_available || false}
            onChange={(e) => onToggle(service.service.id, e.target.checked)}
            size="md"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <h4 className="font-semibold text-slate-900 dark:text-white text-base">
                {service.service.label}
              </h4>
              {response.is_available && (
                <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              )}
              {isRequested && (
                <span className="inline-flex items-center bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300 text-xs px-2 py-1 rounded-full font-semibold">
                  Demandé
                </span>
              )}
              {requestedOption?.is_required && (
                <span className="inline-flex items-center bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 text-xs px-2 py-1 rounded-full font-semibold">
                  Requis
                </span>
              )}
            </div>
            {service.service.description && (
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {service.service.description}
              </p>
            )}
          </div>
        </div>
      </td>

      {/* Données supplémentaires demandées */}
      <td className="py-6 px-6">
        {isRequested && requestedOption?.response_data ? (
          <div className="space-y-2">
            {Object.entries(requestedOption.response_data as Record<string, any>).map(([key, value]) => {
              // Format the value properly
              let displayValue = '';
              if (Array.isArray(value)) {
                // If it's an array, join values with commas
                displayValue = value.join(', ');
              } else if (typeof value === 'object' && value !== null) {
                // If it's an object, try to extract meaningful values
                if (value.label || value.name || value.value) {
                  displayValue = value.label || value.name || value.value;
                } else {
                  // For other objects, join all values
                  displayValue = Object.values(value).filter(v => v != null).join(', ');
                }
              } else {
                // For primitive types, just convert to string
                displayValue = String(value);
              }

              return (
                <div
                  key={key}
                  className="flex items-center justify-between py-2 px-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg text-xs"
                >
                  <span className="font-semibold text-slate-700 dark:text-slate-300 capitalize">
                    {key.replace(/[_-]/g, " ")}
                  </span>
                  <span className="text-slate-600 dark:text-slate-400 font-medium">
                    {displayValue || '-'}
                  </span>
                </div>
              )
            })}
          </div>
        ) : (
          <span className="text-slate-400 dark:text-slate-500 text-sm">-</span>
        )}
      </td>

      {/* Frais de gestion */}
      <td className="py-6 px-6">
        {response.is_available ? (
          <div className="w-32">
            <InputField
              type="number"
              step="0.1"
              min="0"
              max="100"
              value={response.management_fee || 0}
              onChange={(e) => onFeeChange(service.service.id, e.target.value)}
              placeholder="8.5"
              className="text-center"
            />
          </div>
        ) : (
          <span className="text-slate-400 dark:text-slate-500 text-sm">-</span>
        )}
      </td>

      {/* Commentaire / Conditions */}
      <td className="py-6 px-6">
        {response.is_available ? (
          <div className="min-w-[200px]">
            <TextAreaField
              rows={2}
              value={response.comment || ""}
              onChange={(e) => onCommentChange(service.service.id, e.target.value)}
              placeholder="Conditions, délais, informations complémentaires..."
            />
          </div>
        ) : (
          <span className="text-slate-400 dark:text-slate-500 text-sm">-</span>
        )}
      </td>
    </tr>
  )
}

export default ServiceCard
