import { User } from "lucide-react"
import type React from "react"

import type { RequestOverviewProps } from "@/types/company-response"

const RequestOverview: React.FC<RequestOverviewProps> = ({ freelanceRequest }) => {
  const getPriorityStyles = (priority: string) => {
    switch (priority) {
      case "HIGH":
        return "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/30"
      case "MEDIUM":
        return "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800/30"
      default:
        return "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800/30"
    }
  }

  const getStatusStyles = (status: string) => {
    return status === "OPEN"
      ? "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800/30"
      : "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800/30"
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 mb-4">
        <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-md flex items-center justify-center">
          <User className="w-3 h-3 text-blue-600 dark:text-blue-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Informations de la demande</h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Freelancer */}
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800/30">
          <span className="block text-xs font-medium text-blue-600 dark:text-blue-400 mb-2">Freelancer</span>
          <p className="text-sm font-bold text-blue-700 dark:text-blue-400">
            {freelanceRequest.freelance?.user.first_name} {freelanceRequest.freelance?.user.last_name}
          </p>
        </div>

        {/* TJM */}
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-100 dark:border-green-800/30">
          <span className="block text-xs font-medium text-green-600 dark:text-green-400 mb-2">TJM</span>
          <p className="text-lg font-bold text-green-700 dark:text-green-400">{freelanceRequest.tjm}€</p>
        </div>

        {/* Days */}
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800/30">
          <span className="block text-xs font-medium text-blue-600 dark:text-blue-400 mb-2">Jours</span>
          <p className="text-lg font-bold text-blue-700 dark:text-blue-400">{freelanceRequest.days}</p>
        </div>

        {/* Priority */}
        <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-600">
          <span className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Priorité</span>
          <div
            className={`inline-flex items-center px-3 py-1 rounded-md border font-medium text-sm ${getPriorityStyles(freelanceRequest.priority)}`}
          >
            <svg className="w-3 h-3 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 8l2.55 3.4A1 1 0 0116 13H6a1 1 0 00-1 1v3a1 1 0 11-2 0V6z"
                clipRule="evenodd"
              />
            </svg>
            {freelanceRequest.priority}
          </div>
        </div>

        {/* Status */}
        <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-600">
          <span className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Statut</span>
          <div
            className={`inline-flex items-center px-3 py-1 rounded-md border font-medium text-sm ${getStatusStyles(freelanceRequest.mission_status)}`}
          >
            <div className="w-1.5 h-1.5 rounded-full bg-current mr-2"></div>
            {freelanceRequest.mission_status}
          </div>
        </div>

        {/* Client Information */}
        {freelanceRequest.client_name && (
          <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg border border-gray-100 dark:border-gray-600">
            <span className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Client</span>
            <p className="text-gray-900 dark:text-gray-100 font-medium text-sm">{freelanceRequest.client_name}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default RequestOverview
