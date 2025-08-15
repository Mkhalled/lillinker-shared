import type React from "react"

import OptionInfoTooltip from "@/components/details/OptionInfoTooltip"

interface RequestedServicesProps {
  options: Array<{
    id: number;
    freelance_request_id: number;
    service_option_id: number;
    is_required: boolean;
    response_data: Record<string, string | number | boolean | null>;
    platformService: {
      id: number;
      label: string;
      description?: string | null;
      data_type: string;
      requires_data: boolean;
    };
  }>
}

const RequestedServices: React.FC<RequestedServicesProps> = ({ options }) => {
  if (!options || options.length === 0) return null

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 mb-4">
        <div className="w-6 h-6 bg-purple-100 dark:bg-purple-900/30 rounded-md flex items-center justify-center">
          <svg
            className="w-3 h-3 text-purple-600 dark:text-purple-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012 2v2M7 7h10"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Services demandés</h3>
      </div>

      <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800/30 rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {options.map((option) => (
            <div
              key={option.id}
              className="bg-white dark:bg-gray-800 border border-purple-100 dark:border-purple-700/50 rounded-lg p-4 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-purple-500 dark:bg-purple-400 rounded-full flex-shrink-0"></div>
                  <span className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                    {option.platformService?.label}
                  </span>
                  {option.is_required && (
                    <span className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full font-medium">Requis</span>
                  )}
                </div>
                <OptionInfoTooltip option={option} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default RequestedServices
