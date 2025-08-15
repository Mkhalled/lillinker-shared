"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { MessageSquare, Send, Loader, X } from "lucide-react"
import type { CompanyResponseData, ServiceResponse } from "@/types/company-response"
import { CompanyResponseService } from "@/services/CompanyResponseService"
import CollapsibleRow from "@/components/settings/CollapsibleRow"
import RequestOverview from "./RequestOverview"
import RequestedServices from "./RequestedServices"
import ServiceCard from "./ServiceCard"
import CotisationsSummary from "./CotisationsSummary"


interface CompanyResponseProps {
  requestId: number
  onClose: () => void
}

const CompanyResponse: React.FC<CompanyResponseProps> = ({ requestId, onClose }) => {
  const [responseData, setResponseData] = useState<CompanyResponseData | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [responses, setResponses] = useState<Record<number, ServiceResponse>>({})
  const [overallMessage, setOverallMessage] = useState("")
  const [selectedOrganismes, setSelectedOrganismes] = useState<number[]>([])

  useEffect(() => {
    fetchResponseData()
  }, [requestId])

  const fetchResponseData = async () => {
    try {
      setLoading(true)

      // Fetch response data
      const response = await fetch(`/api/company/response/${requestId}`)
      if (!response.ok) {
        throw new Error("Failed to fetch response data")
      }
      const data = await response.json()

      // Fetch company organismes separately
      const organismesResponse = await fetch("/api/company/admin/organismes")
      if (!organismesResponse.ok) {
        throw new Error("Failed to fetch organismes")
      }
      const organismesData = await organismesResponse.json()

      // Combine the data
      const combinedData = {
        ...data,
        organismes: organismesData.success ? organismesData.data : [],
      }

      setResponseData(combinedData)

      // Initialize responses state - start with all services unchecked
      const initialResponses: Record<number, ServiceResponse> = {}
      data.company_services.forEach((service: any) => {
        initialResponses[service.service.id] = {
          service_id: service.service.id,
          service_name: service.service.label,
          service_description: service.service.description || "",
          is_available: false, // Start unchecked - company decides what to offer
          management_fee: 8.5, // Default fee
          comment: "",
        }
      })
      setResponses(initialResponses)
    } catch (error) {
      console.error("Error fetching response data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleServiceToggle = (serviceId: number, isAvailable: boolean) => {
    setResponses((prev) => ({
      ...prev,
      [serviceId]: { ...prev[serviceId], is_available: isAvailable },
    }))
  }

  const handleFeeChange = (serviceId: number, fee: string) => {
    setResponses((prev) => ({
      ...prev,
      [serviceId]: { ...prev[serviceId], management_fee: Number.parseFloat(fee) || 0 },
    }))
  }

  const handleCommentChange = (serviceId: number, comment: string) => {
    setResponses((prev) => ({
      ...prev,
      [serviceId]: { ...prev[serviceId], comment },
    }))
  }

  const handleOrganismeToggle = (organismeId: number) => {
    setSelectedOrganismes((prev) =>
      prev.includes(organismeId) ? prev.filter((id) => id !== organismeId) : [...prev, organismeId],
    )
  }

  const calculateTotalCotisations = () => {
    if (!responseData) return { totalPatronal: 0, totalSalarial: 0, totalCombined: 0 }

    return CompanyResponseService.calculateTotalCotisations(responseData.organismes, selectedOrganismes)
  }

  const handleSubmit = async () => {
    try {
      setSubmitting(true)

      // Prepare cotisation details for selected organismes
      const selectedOrganismeDetails =
        responseData?.organismes
          .filter((organisme) => selectedOrganismes.includes(organisme.id))
          .map((organisme) => ({
            organisme_id: organisme.id,
            label: organisme.label,
            cotisations: organisme.cotisations.map((cotisation) => ({
              id: cotisation.id,
              label: cotisation.label,
              type: cotisation.type,
              pourcentage_patronal: cotisation.pourcentage_patronal,
              pourcentage_salarial: cotisation.pourcentage_salarial,
            })),
          })) || []

      const cotisationTotals = calculateTotalCotisations()

      const submitData = {
        services: Object.values(responses),
        selected_organismes: selectedOrganismeDetails,
        cotisation_summary: {
          total_patronal: cotisationTotals.totalPatronal,
          total_salarial: cotisationTotals.totalSalarial,
          total_combined: cotisationTotals.totalCombined,
        },
        overall_message: overallMessage,
      }

      const response = await fetch(`/api/company/response/${requestId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      })

      if (!response.ok) {
        throw new Error("Failed to submit response")
      }

      // Success - close the component
      onClose()
    } catch (error) {
      console.error("Error submitting response:", error)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="w-full flex items-center justify-center py-16">
        <div className="flex items-center space-x-3">
          <Loader className="w-6 h-6 animate-spin text-blue-600" />
          <span className="text-gray-600 dark:text-gray-400">Chargement des données de la demande...</span>
        </div>
      </div>
    )
  }

  if (!responseData) {
    return (
      <div className="w-full flex items-center justify-center py-16">
        <div className="text-center">
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">Demande introuvable</p>
          <button
            onClick={onClose}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Retour
          </button>
        </div>
      </div>
    )
  }

  const { freelance_request, company_services, organismes } = responseData
  const cotisationTotals = calculateTotalCotisations()

  return (
    <div className="w-full mt-8">
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-800 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 px-8 py-6 relative">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Réponse à la demande</h2>
              <p className="text-blue-100 dark:text-blue-200">Proposer vos services au freelancer</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-blue-200 dark:hover:text-blue-300 transition-colors duration-200 p-2 rounded-lg hover:bg-white/10"
              aria-label="Fermer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-8 space-y-8">
          {/* Request Overview */}
          <RequestOverview freelanceRequest={freelance_request} />

          {/* Requested Services */}
          <RequestedServices options={freelance_request.options} />

          {/* Available Services */}
          <CollapsibleRow title="Vos Services Disponibles" defaultOpen={true}>
            <div className="space-y-6">
              {company_services.map((service) => {
                const isRequested = freelance_request.options.some(
                  (option) => option.platformService.id === service.service.id,
                )
                const requestedOption = freelance_request.options.find(
                  (option) => option.platformService.id === service.service.id,
                )

                return (
                  <ServiceCard
                    key={service.service.id}
                    service={service}
                    response={responses[service.service.id]}
                    isRequested={isRequested}
                    requestedOption={requestedOption}
                    onToggle={handleServiceToggle}
                    onFeeChange={handleFeeChange}
                    onCommentChange={handleCommentChange}
                  />
                )
              })}
            </div>
          </CollapsibleRow>

          {/* Organismes Section */}
          {organismes.length > 0 && (
            <CollapsibleRow title="Organismes et Cotisations" defaultOpen={false}>
              <div className="space-y-6">
                <CotisationsSummary selectedCount={selectedOrganismes.length} totals={cotisationTotals} />

                <div className="space-y-4">
                  {organismes.map((organisme) => (
                    <div
                      key={organisme.id}
                      className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg p-6 hover:shadow-sm transition-shadow"
                    >
                      <div className="flex items-start space-x-4">
                        <input
                          type="checkbox"
                          id={`organisme-${organisme.id}`}
                          checked={selectedOrganismes.includes(organisme.id)}
                          onChange={() => handleOrganismeToggle(organisme.id)}
                          className="mt-1 w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                        />
                        <div className="flex-1">
                          <label
                            htmlFor={`organisme-${organisme.id}`}
                            className="block text-lg font-semibold text-gray-900 dark:text-white cursor-pointer mb-2"
                          >
                            {organisme.label}
                          </label>
                          {organisme.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{organisme.description}</p>
                          )}

                          {organisme.cotisations.length > 0 && (
                            <div className="space-y-3">
                              <div className="text-sm font-medium text-gray-800 dark:text-gray-300 flex items-center">
                                <svg className="w-4 h-4 mr-2 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4zM18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" />
                                </svg>
                                Cotisations associées
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {organisme.cotisations.map((cotisation) => (
                                  <div
                                    key={cotisation.id}
                                    className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600"
                                  >
                                    <div className="flex items-start justify-between mb-3">
                                      <div className="flex-1">
                                        <h5 className="text-sm font-medium text-gray-900 dark:text-white">
                                          {cotisation.label}
                                        </h5>
                                        {cotisation.description && (
                                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                            {cotisation.description}
                                          </p>
                                        )}
                                      </div>
                                      <div
                                        className={`px-2 py-1 rounded-full text-xs font-medium ml-3 ${
                                          cotisation.type === "PATRONAL"
                                            ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                                            : cotisation.type === "SALARIAL"
                                              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                              : "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
                                        }`}
                                      >
                                        {cotisation.type}
                                      </div>
                                    </div>

                                    <div className="flex space-x-3">
                                      {cotisation.pourcentage_patronal && (
                                        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border text-center flex-1">
                                          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Patronal</div>
                                          <div className="text-sm font-bold text-blue-700 dark:text-blue-400">
                                            {cotisation.pourcentage_patronal}%
                                          </div>
                                        </div>
                                      )}
                                      {cotisation.pourcentage_salarial && (
                                        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border text-center flex-1">
                                          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Salarial</div>
                                          <div className="text-sm font-bold text-green-700 dark:text-green-400">
                                            {cotisation.pourcentage_salarial}%
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CollapsibleRow>
          )}

          {/* Overall Message */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-md flex items-center justify-center">
                <MessageSquare className="w-3 h-3 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Message au Freelancer</h3>
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Message général de réponse
              </label>
              <textarea
                rows={5}
                value={overallMessage}
                onChange={(e) => setOverallMessage(e.target.value)}
                placeholder="Bonjour ! Nous sommes ravis de votre demande et pouvons vous accompagner sur ce projet..."
                className="w-full px-4 py-4 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-600">
            <button
              onClick={onClose}
              className="flex items-center px-6 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all font-medium"
            >
              Annuler
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {submitting ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Envoi en cours...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Envoyer la réponse
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CompanyResponse
