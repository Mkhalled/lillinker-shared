"use client"
import { Send, X, Trash2 } from "lucide-react"
import type React from "react"
import { useState, useEffect } from "react"

import { StyledCheckbox } from "@/components/form/StyledCheckbox"
import SimpleModal from "@/components/modals/SimpleModal"
import CollapsibleRow from "@/components/settings/CollapsibleRow"
import type { CompanyResponseData, ServiceResponse } from "@/types/company-response"

import RequestedServices from "./RequestedServices"
import RequestOverview from "./RequestOverview"
import ServiceCard from "./ServiceCard"


interface CompanyResponseProps {
  requestId: number
  onClose: () => void
}

interface ModalState {
  isOpen: boolean
  type: 'success' | 'error' | 'info'
  title: string
  message: string
  onConfirm?: () => void
}

const CompanyResponse: React.FC<CompanyResponseProps> = ({ requestId, onClose }) => {
  const [responseData, setResponseData] = useState<CompanyResponseData | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [responses, setResponses] = useState<Record<number, ServiceResponse>>({})
  const [selectedOrganismes, setSelectedOrganismes] = useState<number[]>([])
  const [isUpdating, setIsUpdating] = useState(false)
  const [modal, setModal] = useState<ModalState>({
    isOpen: false,
    type: 'info',
    title: '',
    message: ''
  })

  const showModal = (type: 'success' | 'error' | 'info', title: string, message: string, onConfirm?: () => void) => {
    setModal({ isOpen: true, type, title, message, onConfirm })
  }

  const closeModal = () => {
    setModal({ isOpen: false, type: 'info', title: '', message: '' })
  }

  useEffect(() => {
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

        // Check if existing response exists
        if (data.existing_response && data.existing_response.length > 0) {
          setIsUpdating(true)
          
          // Pre-populate form with existing response data
          const existingResponses: Record<number, ServiceResponse> = {}
          const existingSelectedOrganismes: number[] = []
          
          data.existing_response.forEach((existingResp: { 
            platform_service_id: number; 
            response_data?: Record<string, string | number | boolean>; 
            management_fees?: number;
            platformService: { label: string; description?: string | null };
            organismes?: { organisme_id: number }[]
          }) => {
            const responseData = existingResp.response_data || {}
            
            existingResponses[existingResp.platform_service_id] = {
              service_id: existingResp.platform_service_id,
              service_name: existingResp.platformService.label,
              service_description: existingResp.platformService.description || "",
              is_available: true, // If it exists, it was available
              management_fee: existingResp.management_fees || 8.5,
              comment: (typeof responseData.comment === 'string' ? responseData.comment : "") || "",
            }
            
            // Extract selected organismes from existing response
            if (existingResp.organismes && existingResp.organismes.length > 0) {
              existingResp.organismes.forEach((org: { organisme_id: number }) => {
                if (!existingSelectedOrganismes.includes(org.organisme_id)) {
                  existingSelectedOrganismes.push(org.organisme_id)
                }
              })
            }
          })

        // Fill in services that weren't in the existing response
        data.company_services.forEach((service: { 
          service: { id: number; label: string; description?: string | null } 
        }) => {
          if (!existingResponses[service.service.id]) {
            existingResponses[service.service.id] = {
              service_id: service.service.id,
              service_name: service.service.label,
              service_description: service.service.description || "",
              is_available: false,
              management_fee: 8.5,
              comment: "",
            }
          }
        })
        
        setResponses(existingResponses)
        setSelectedOrganismes(existingSelectedOrganismes)
      } else {
        // Initialize responses state - start with all services unchecked
        const initialResponses: Record<number, ServiceResponse> = {}
        data.company_services.forEach((service: { 
          service: { id: number; label: string; description?: string | null } 
        }) => {
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
        setIsUpdating(false)
      }
    } catch (error) {
      console.error("Error fetching response data:", error)
    } finally {
      setLoading(false)
    }
    }
    
    fetchResponseData()
  }, [requestId])

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

  const calculateOrganismeTotals = (organisme: {
    cotisations: Array<{
      pourcentage_patronal?: number | null;
      pourcentage_salarial?: number | null;
    }>
  }) => {
    let totalPatronal = 0
    let totalSalarial = 0
    
    organisme.cotisations.forEach((cotisation: {
      pourcentage_patronal?: number | null;
      pourcentage_salarial?: number | null;
    }) => {
      if (cotisation.pourcentage_patronal) {
        totalPatronal += Number.parseFloat(cotisation.pourcentage_patronal.toString()) || 0
      }
      if (cotisation.pourcentage_salarial) {
        totalSalarial += Number.parseFloat(cotisation.pourcentage_salarial.toString()) || 0
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

      // Use PUT for updates, POST for new responses
      const method = isUpdating ? "PUT" : "POST"
      const response = await fetch(`/api/company/response/${requestId}`, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Failed to ${isUpdating ? 'update' : 'submit'} response`)
      }

      // Success - show success modal
      showModal(
        'success',
        'Succès!',
        `Votre réponse a été ${isUpdating ? 'mise à jour' : 'envoyée'} avec succès.`,
        () => {
          closeModal()
          onClose()
        }
      )
    } catch (error) {
      console.error(`Error ${isUpdating ? 'updating' : 'submitting'} response:`, error)
      const actionText = isUpdating ? 'mise à jour' : 'envoi'
      showModal(
        'error',
        'Erreur',
        error instanceof Error ? error.message : `Erreur lors du ${actionText} de la réponse. Veuillez réessayer.`
      )
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!isUpdating) return

    showModal(
      'info',
      'Confirmer la suppression',
      'Êtes-vous sûr de vouloir supprimer cette réponse ? Cette action est irréversible.',
      async () => {
        try {
          closeModal()
          setDeleting(true)

          const response = await fetch(`/api/company/response/${requestId}`, {
            method: "DELETE",
          })

          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || 'Failed to delete response')
          }

          // Success - show success modal
          showModal(
            'success',
            'Réponse supprimée',
            'Votre réponse a été supprimée avec succès.',
            () => {
              closeModal()
              onClose()
            }
          )
        } catch (error) {
          console.error('Error deleting response:', error)
          showModal(
            'error',
            'Erreur',
            error instanceof Error ? error.message : 'Erreur lors de la suppression. Veuillez réessayer.'
          )
        } finally {
          setDeleting(false)
        }
      }
    )
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
          {/* Flash Message for Existing Response */}
          {isUpdating && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-blue-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                    Réponse déjà envoyée
                  </h3>
                  <p className="mt-1 text-sm text-blue-700 dark:text-blue-300">
                    Vous avez déjà répondu à cette demande. Vous pouvez modifier votre réponse et la mettre à jour.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Request Overview */}
          <RequestOverview freelanceRequest={freelance_request} />

          {/* Requested Services */}
          <RequestedServices options={freelance_request.options.map(option => ({
            ...option,
            response_data: option.response_data as Record<string, string | number | boolean | null>
          }))} />

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
          <div className="flex justify-between items-center pt-6 border-t border-slate-200 dark:border-slate-700">
            {/* Left side - Delete button (only when updating) */}
            <div>
              {isUpdating && (
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="inline-flex items-center px-4 py-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all font-semibold border border-red-300 dark:border-red-600 hover:border-red-400 dark:hover:border-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deleting ? (
                    <>
                      <div className="w-4 h-4 mr-2 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                      Suppression...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Supprimer
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Right side - Cancel and Submit buttons */}
            <div className="flex space-x-4">
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
                    {isUpdating ? 'Mise à jour en cours...' : 'Envoi en cours...'}
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5 mr-3" />
                    {isUpdating ? 'Mettre à jour la réponse' : 'Envoyer la réponse'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Simple Modal */}
      <SimpleModal
        isOpen={modal.isOpen}
        onClose={closeModal}
        type={modal.type}
        title={modal.title}
        message={modal.message}
        onConfirm={modal.onConfirm}
        confirmText={modal.onConfirm ? 'Confirmer' : 'OK'}
      />
    </div>
  )
}

export default CompanyResponse
