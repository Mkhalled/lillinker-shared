"use client"

import type React from "react"
import type { ServiceResponse } from "@/types/company-response"

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
  const getBorderStyle = () => {
    if (response.is_available) {
      return "border-emerald-200 ring-2 ring-emerald-100 dark:border-emerald-700 dark:ring-emerald-900/30"
    }
    if (isRequested) {
      return "border-blue-200 dark:border-blue-700"
    }
    return "border-gray-200 dark:border-gray-600"
  }

  return (
    <div
      className={`bg-white dark:bg-gray-800 border rounded-lg p-6 transition-all hover:shadow-sm ${getBorderStyle()}`}
    >
      <div className="flex items-start space-x-4 mb-4">
        <input
          type="checkbox"
          checked={response.is_available || false}
          onChange={(e) => onToggle(service.service.id, e.target.checked)}
          className="w-5 h-5 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500 mt-1"
        />
        <div className="flex-1">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{service.service.label}</h4>

          {isRequested && (
            <div className="flex items-center space-x-2 mb-3">
              <span className="bg-blue-100 text-blue-700 text-xs px-3 py-1 rounded-full font-medium">
                Demandé par le freelancer
              </span>
              {requestedOption?.is_required && (
                <span className="bg-red-100 text-red-700 text-xs px-3 py-1 rounded-full font-medium">Requis</span>
              )}
            </div>
          )}

          <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
            {service.service.description || "Aucune description"}
          </p>

          {isRequested && requestedOption?.response_data && (
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800/30">
              <div className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-3">
                Données supplémentaires demandées:
              </div>
              <div className="space-y-2">
                {Object.entries(requestedOption.response_data as Record<string, any>).map(([key, value]) => (
                  <div
                    key={key}
                    className="flex items-center justify-between py-2 px-3 bg-white dark:bg-gray-800 rounded-md text-xs"
                  >
                    <span className="font-medium text-gray-700 dark:text-gray-300 capitalize">
                      {key.replace(/[_-]/g, " ")}:
                    </span>
                    <span className="text-gray-600 dark:text-gray-400">
                      {typeof value === "object" ? JSON.stringify(value) : String(value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {response.is_available && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 pt-6 border-t border-gray-200 dark:border-gray-600">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Frais de gestion (%)
              <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="100"
              value={response.management_fee || 0}
              onChange={(e) => onFeeChange(service.service.id, e.target.value)}
              className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Commentaire / Conditions
            </label>
            <textarea
              rows={3}
              value={response.comment || ""}
              onChange={(e) => onCommentChange(service.service.id, e.target.value)}
              placeholder="Détails, conditions particulières, délais..."
              className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none transition-all"
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default ServiceCard
