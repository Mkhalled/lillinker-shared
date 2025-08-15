"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Send, X } from "lucide-react"
import type { CompanyResponseData, ServiceResponse } from "@/types/company-response"
import CollapsibleRow from "@/components/settings/CollapsibleRow"
import RequestOverview from "./RequestOverview"
import RequestedServices from "./RequestedServices"
import ServiceCard from "./ServiceCard"
import { StyledCheckbox } from "@/components/form/StyledCheckbox"


interface CompanyResponseProps {
  requestId: number
  onClose: () => void
}

const CompanyResponse: React.FC<CompanyResponseProps> = ({ requestId, onClose }) => {
  const [responseData, setResponseData] = useState<CompanyResponseData | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [responses, setResponses] = useState<Record<number, ServiceResponse>>({})
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
    setSelectedOrganismes((prev) => {
      const newSelection = prev.includes(organismeId) 
        ? prev.filter((id) => id !== organismeId) 
        : [...prev, organismeId]
      return newSelection
    })
  }

  const handleOrganismeChange = (organismeId: number) => {
    return (_e: React.ChangeEvent<HTMLInputElement>) => {
      handleOrganismeToggle(organismeId)
    }
  }

  const calculateOrganismeTotals = (organisme: any) => {
    let totalPatronal = 0
    let totalSalarial = 0
    
    organisme.cotisations.forEach((cotisation: any) => {
      if (cotisation.pourcentage_patronal) {
        totalPatronal += Number.parseFloat(cotisation.pourcentage_patronal) || 0
      }
      if (cotisation.pourcentage_salarial) {
        totalSalarial += Number.parseFloat(cotisation.pourcentage_salarial) || 0
      }
    })

    return { totalPatronal, totalSalarial }
  }

  const handleSubmit = async () => {
    try {
      setSubmitting(true)

      // Prepare cotisation details for selected organismes - only save totals
      const selectedOrganismeDetails =
        responseData?.organismes
          .filter((organisme) => selectedOrganismes.includes(organisme.id))
          .map((organisme) => {
            const { totalPatronal, totalSalarial } = calculateOrganismeTotals(organisme)
            return {
              organisme_id: organisme.id,
              label: organisme.label,
              total_patronal: totalPatronal,
              total_salarial: totalSalarial,
            }
          }) || []

      const submitData = {
        services: Object.values(responses),
        selected_organismes: selectedOrganismeDetails,
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
      <div className="w-full flex items-center justify-center py-24">
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              <div className="w-12 h-12 border-4 border-slate-200 dark:border-slate-700 rounded-full"></div>
              <div className="absolute top-0 left-0 w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          </div>
          <p className="text-slate-600 dark:text-slate-400 font-medium">Chargement des données de la demande...</p>
        </div>
      </div>
    )
  }

  if (!responseData) {
    return (
      <div className="w-full flex items-center justify-center py-24">
        <div className="text-center space-y-6">
          <div className="w-16 h-16 mx-auto bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
            <X className="w-8 h-8 text-slate-400" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">Demande introuvable</h3>
            <p className="text-slate-600 dark:text-slate-400">Les données de cette demande ne sont plus disponibles.</p>
          </div>
          <button
            onClick={onClose}
            className="inline-flex items-center px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Retour
          </button>
        </div>
      </div>
    )
  }

  const { freelance_request, company_services, organismes } = responseData

  return (
    <div className="w-full mt-10">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden backdrop-blur-sm">
        {/* Header */}
        <div className="bg-[var(--primary-color)] dark:bg-blue-700 px-6 py-4 relative">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white mb-1">Réponse à la demande</h2>
              <p className="text-blue-100 dark:text-blue-200 text-sm">
                Proposer vos services au freelancer
              </p>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="text-white hover:text-blue-200 dark:hover:text-blue-300 transition-colors duration-200 p-1 rounded-md hover:bg-white/10"
                aria-label="Fermer les détails"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Request Overview */}
          <RequestOverview freelanceRequest={freelance_request} />

          {/* Requested Services */}
          <RequestedServices options={freelance_request.options} />

          {/* Available Services */}
          <CollapsibleRow title="Vos Services Disponibles" defaultOpen={true}>
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-lg">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-600 dark:text-gray-300">
                        Service
                      </th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-600 dark:text-gray-300">
                        Données supplémentaires demandées
                      </th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-600 dark:text-gray-300">
                        Frais de gestion (%)
                        <span className="text-red-500 ml-1">*</span>
                      </th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-600 dark:text-gray-300">
                        Commentaire / Conditions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
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
                  </tbody>
                </table>
              </div>
            </div>
          </CollapsibleRow>

          {/* Organismes Section */}
          {organismes.length > 0 && (
            <CollapsibleRow title="Organismes et Cotisations" defaultOpen={false}>
              <div className="space-y-6">
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-lg">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th className="py-3 px-4 text-left text-sm font-medium text-gray-600 dark:text-gray-300">
                            Organisme
                          </th>
                          <th className="py-3 px-4 text-center text-sm font-medium text-gray-600 dark:text-gray-300">
                            Total Patronal (%)
                          </th>
                          <th className="py-3 px-4 text-center text-sm font-medium text-gray-600 dark:text-gray-300">
                            Total Salarial (%)
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {organismes.map((organisme) => {
                          const { totalPatronal, totalSalarial } = calculateOrganismeTotals(organisme)
                          const isSelected = selectedOrganismes.includes(organisme.id)
                          
                          return (
                            <tr 
                              key={organisme.id}
                              className={`border-b border-slate-200 dark:border-slate-700 ${isSelected ? 'bg-indigo-50 dark:bg-indigo-900/10' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'} transition-all duration-200`}
                            >
                              <td className="py-6 px-6">
                                <div className="flex items-center space-x-4">
                                  <StyledCheckbox
                                    id={`organisme-${organisme.id}`}
                                    checked={isSelected}
                                    onChange={handleOrganismeChange(organisme.id)}
                                    size="md"
                                    className="flex-shrink-0"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-semibold text-slate-900 dark:text-white text-base mb-1">
                                      {organisme.label}
                                    </h4>
                                  </div>
                                </div>
                              </td>
                              <td className="py-6 px-6 text-center">
                                <span className="text-gray-900 dark:text-gray-100 font-medium">
                                  {totalPatronal.toFixed(2)}%
                                </span>
                              </td>
                              <td className="py-6 px-6 text-center">
                                <span className="text-gray-900 dark:text-gray-100 font-medium">
                                  {totalSalarial.toFixed(2)}%
                                </span>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </CollapsibleRow>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-slate-200 dark:border-slate-700">
            <button
              onClick={onClose}
              className="inline-flex items-center px-6 py-3 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-all font-semibold border border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500"
            >
              Annuler
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="inline-flex items-center px-6 py-3 text-white rounded-lg transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
              style={{ backgroundColor: 'var(--primary-color)' }}
            >
              {submitting ? (
                <>
                  <div className="w-5 h-5 mr-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Envoi en cours...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5 mr-3" />
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
