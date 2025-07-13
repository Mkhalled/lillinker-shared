'use client';

import { ChevronLeft, ChevronRight, CheckCircle, Plus, Trash2, X, Building2 } from 'lucide-react';
import { useState, useEffect } from 'react';


import { Button } from '../ui/button/Button';

interface PlatformService {
  id: number
  label: string
  description: string | null
  data_type: string
  requires_data: boolean
  data_label: string
  data_description: string | null
  choices: any
  user: {
    first_name: string
    last_name: string
    ownedCompany: {
      name: string
    } | null
  }
}

interface CompanyModalProps {
  onClose: () => void
}

const CompanyModal = ({ onClose }: CompanyModalProps) => {
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [platformServices, setPlatformServices] = useState<PlatformService[]>([])
  const [formData, setFormData] = useState({
    // Step 1: General info
    companyName: "",
    siret: "",
    description: "",
    // Step 2: Consultants and fees
    consultantCount: "",
    managementFeeRate: "",

    // Step 3: Admin info
    adminFirstName: "",
    adminLastName: "",
    adminEmail: "",
    adminPhone: "",

    // Step 4: Services selection and creation
    selectedPlatformServices: [] as string[],
    newServices: [] as Array<{
      id: string
      label: string
      description: string
      requiresData: boolean
      dataType: string
      dataLabel: string
      dataDescription: string
      choices: string[]
    }>
  })

  const totalSteps = 5

  // Fetch platform services when component mounts
  useEffect(() => {
    const fetchPlatformServices = async () => {
      try {
        const response = await fetch('/api/platform-services')
        if (response.ok) {
          const data = await response.json()
          setPlatformServices(data.data || [])
        }
      } catch (error) {
        console.error('Failed to fetch platform services:', error)
      }
    }

    fetchPlatformServices()
  }, [])

  const handleNext = () => {
    if (currentStep === 4) {
      handleComplete()
    } else if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const toggleServiceSelection = (serviceId: number) => {
    const serviceIdStr = serviceId.toString()
    setFormData(prev => ({
      ...prev,
      selectedPlatformServices: prev.selectedPlatformServices.includes(serviceIdStr)
        ? prev.selectedPlatformServices.filter(id => id !== serviceIdStr)
        : [...prev.selectedPlatformServices, serviceIdStr]
    }))
  }

  const addNewService = () => {
    const newService = {
      id: Date.now().toString(),
      label: "",
      description: "",
      requiresData: false,
      dataType: "TEXT",
      dataLabel: "",
      dataDescription: "",
      choices: [] as string[]
    }
    setFormData(prev => ({
      ...prev,
      newServices: [...prev.newServices, newService]
    }))
  }

  const updateNewService = (serviceId: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      newServices: prev.newServices.map(service =>
        service.id === serviceId ? { ...service, [field]: value } : service
      )
    }))
  }

  const removeNewService = (serviceId: string) => {
    setFormData(prev => ({
      ...prev,
      newServices: prev.newServices.filter(service => service.id !== serviceId)
    }))
  }

  const addChoiceToNewService = (serviceId: string) => {
    setFormData(prev => ({
      ...prev,
      newServices: prev.newServices.map(service =>
        service.id === serviceId 
          ? { ...service, choices: [...service.choices, ""] }
          : service
      )
    }))
  }

  const updateNewServiceChoice = (serviceId: string, choiceIndex: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      newServices: prev.newServices.map(service =>
        service.id === serviceId
          ? {
              ...service,
              choices: service.choices.map((choice, index) => 
                index === choiceIndex ? value : choice
              )
            }
          : service
      )
    }))
  }

  const removeNewServiceChoice = (serviceId: string, choiceIndex: number) => {
    setFormData(prev => ({
      ...prev,
      newServices: prev.newServices.map(service =>
        service.id === serviceId
          ? {
              ...service,
              choices: service.choices.filter((_, index) => index !== choiceIndex)
            }
          : service
      )
    }))
  }

  const handleComplete = async () => {
    if (currentStep === 4) {
      setIsLoading(true)
      setError(null)
      
      try {
        // Step 1: Initial registration (create user)
        const signupResponse = await fetch('/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            first_name: formData.adminFirstName,
            last_name: formData.adminLastName,
            email: formData.adminEmail,
            role: "COMPANY",
            phone_number: formData.adminPhone,
          }),
        })

        if (!signupResponse.ok) {
          const errorData = await signupResponse.json()
          throw new Error(errorData.error || 'Registration failed')
        }

        const signupData = await signupResponse.json()

        // Step 2: Company onboarding
        const onboardingData = {
          userId: signupData.userId,
          company_name: formData.companyName,
          company_description: formData.description,
          siret: formData.siret,
          consultant_count: parseInt(formData.consultantCount),
          management_fees: parseFloat(formData.managementFeeRate),
          selected_services: formData.selectedPlatformServices.map(id => parseInt(id)),
          new_services: formData.newServices.filter(service => service.label.trim() !== '').map(service => ({
            service_label: service.label,
            service_description: service.description,
            data_type: service.dataType,
            requires_data: service.requiresData,
            data_label: service.dataLabel,
            data_description: service.dataDescription,
            choices: service.choices.filter(choice => choice.trim() !== ''),
          })),
        }

        const onboardingResponse = await fetch('/api/auth/onboarding/company', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(onboardingData),
        })

        if (!onboardingResponse.ok) {
          const errorData = await onboardingResponse.json()
          throw new Error(errorData.error || 'Company onboarding failed')
        }

        setCurrentStep(5)
      } catch (error) {
        console.error('Registration error:', error)
        setError(error instanceof Error ? error.message : 'Une erreur est survenue')
      } finally {
        setIsLoading(false)
      }
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Nom de la société *</label>
              <input
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.companyName}
                onChange={(e) => setFormData((prev) => ({ ...prev, companyName: e.target.value }))}
                placeholder="Ma Société de Portage"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">SIRET *</label>
              <input
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.siret}
                onChange={(e) => setFormData((prev) => ({ ...prev, siret: e.target.value }))}
                placeholder="12345678901234"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Description de la société *</label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Décrivez votre société de portage salarial..."
                rows={4}
                required
              />
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Nombre actuel de consultants portés *</label>
              <input
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                type="number"
                value={formData.consultantCount}
                onChange={(e) => setFormData((prev) => ({ ...prev, consultantCount: e.target.value }))}
                placeholder="50"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Taux de frais de gestion (%) *</label>
              <input
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                type="number"
                step="0.1"
                value={formData.managementFeeRate}
                onChange={(e) => setFormData((prev) => ({ ...prev, managementFeeRate: e.target.value }))}
                placeholder="8.5"
                required
              />
              <p className="text-sm text-gray-600">Taux standard appliqué sur le chiffre d'affaires</p>
            </div>
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Fonctionnalité future</h4>
              <p className="text-sm text-blue-800">
                Bientôt, vous pourrez définir des paliers de frais selon le TJM (Taux Journalier Moyen) pour proposer
                des tarifs dégressifs.
              </p>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Prénom de l'administrateur *</label>
                <input
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.adminFirstName}
                  onChange={(e) => setFormData((prev) => ({ ...prev, adminFirstName: e.target.value }))}
                  placeholder="Marie"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Nom de l'administrateur *</label>
                <input
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.adminLastName}
                  onChange={(e) => setFormData((prev) => ({ ...prev, adminLastName: e.target.value }))}
                  placeholder="Martin"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Email de l'administrateur *</label>
              <input
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                type="email"
                value={formData.adminEmail}
                onChange={(e) => setFormData((prev) => ({ ...prev, adminEmail: e.target.value }))}
                placeholder="marie.martin@societe.com"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Téléphone de l'administrateur *</label>
              <input
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.adminPhone}
                onChange={(e) => setFormData((prev) => ({ ...prev, adminPhone: e.target.value }))}
                placeholder="01 23 45 67 89"
                required
              />
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-4">Sélection des services</h3>
              <p className="text-gray-600 mb-6">
                Choisissez les services existants sur la plateforme ou créez un nouveau service personnalisé.
              </p>
            </div>

            {/* Existing Platform Services */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Services disponibles sur la plateforme</h4>
              {platformServices.length === 0 ? (
                <div className="text-center py-8 text-gray-500 border border-gray-200 rounded-lg">
                  <Building2 className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                  <p>Aucun service disponible pour le moment</p>
                </div>
              ) : (
                <div className="max-h-60 overflow-y-auto space-y-2 border border-gray-200 rounded-lg p-4">
                  {platformServices.map((service) => (
                    <div
                      key={service.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        formData.selectedPlatformServices.includes(service.id.toString())
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => toggleServiceSelection(service.id)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h5 className="font-medium text-gray-900">{service.label}</h5>
                          {service.description && (
                            <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                          )}
                          <div className="flex items-center gap-4 mt-2">
                            <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                              {service.data_type}
                            </span>
                            {service.requires_data && (
                              <span className="text-xs px-2 py-1 bg-orange-100 text-orange-600 rounded">
                                Données requises
                              </span>
                            )}
                          </div>
                          {service.user.ownedCompany && (
                            <p className="text-xs text-gray-500 mt-1">
                              Par {service.user.ownedCompany.name}
                            </p>
                          )}
                        </div>
                        <div className="ml-3">
                          <input
                            type="checkbox"
                            checked={formData.selectedPlatformServices.includes(service.id.toString())}
                            onChange={() => toggleServiceSelection(service.id)}
                            className="h-4 w-4 text-blue-600 rounded"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Create New Service Section */}
            <div className="border-t pt-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium text-gray-900">Créer des nouveaux services</h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addNewService}
                  className="flex items-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Nouveau service</span>
                </Button>
              </div>

              {formData.newServices.length === 0 ? (
                <div className="text-center py-6 text-gray-500 border border-gray-200 rounded-lg bg-gray-50">
                  <p className="text-sm">Aucun nouveau service créé. Cliquez sur "Nouveau service" pour en ajouter un.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {formData.newServices.map((service, index) => (
                    <div key={service.id} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                      <div className="flex items-start justify-between mb-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Nouveau service {index + 1}
                        </span>
                        <button
                          onClick={() => removeNewService(service.id)}
                          className="text-red-600 hover:text-red-700 p-1"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Libellé du service *</label>
                            <input
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              value={service.label}
                              onChange={(e) => updateNewService(service.id, "label", e.target.value)}
                              placeholder="Ex: Assurance RC Pro"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Description</label>
                            <input
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              value={service.description}
                              onChange={(e) => updateNewService(service.id, "description", e.target.value)}
                              placeholder="Description du service"
                            />
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`requires-data-${service.id}`}
                            checked={service.requiresData}
                            onChange={(e) => updateNewService(service.id, "requiresData", e.target.checked)}
                          />
                          <label htmlFor={`requires-data-${service.id}`} className="text-sm text-gray-700">
                            Ce service nécessite des données du consultant
                          </label>
                        </div>

                        {service.requiresData && (
                          <div className="pl-6 space-y-4 border-l-2 border-gray-200">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Type de données</label>
                                <select
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  value={service.dataType}
                                  onChange={(e) => updateNewService(service.id, "dataType", e.target.value)}
                                >
                                  <option value="TEXT">Texte libre</option>
                                  <option value="NUMBER">Numérique</option>
                                  <option value="RADIO">Choix unique</option>
                                  <option value="SELECT">Choix multiple</option>
                                </select>
                              </div>
                              <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Label du champ</label>
                                <input
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  value={service.dataLabel}
                                  onChange={(e) => updateNewService(service.id, "dataLabel", e.target.value)}
                                  placeholder="Ex: Niveau d'expérience"
                                />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-gray-700">Description du champ</label>
                              <input
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={service.dataDescription}
                                onChange={(e) => updateNewService(service.id, "dataDescription", e.target.value)}
                                placeholder="Instructions pour le freelance"
                              />
                            </div>

                            {(service.dataType === "RADIO" || service.dataType === "SELECT") && (
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <label className="text-sm font-medium text-gray-700">Valeurs possibles</label>
                                  <button
                                    type="button"
                                    onClick={() => addChoiceToNewService(service.id)}
                                    className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm"
                                  >
                                    <Plus className="h-4 w-4" />
                                    <span>Ajouter</span>
                                  </button>
                                </div>
                                {service.choices.map((choice, choiceIndex) => (
                                  <div key={choiceIndex} className="flex items-center space-x-2">
                                    <input
                                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                      value={choice}
                                      onChange={(e) => updateNewServiceChoice(service.id, choiceIndex, e.target.value)}
                                      placeholder={`Option ${choiceIndex + 1}`}
                                    />
                                    <button
                                      type="button"
                                      onClick={() => removeNewServiceChoice(service.id, choiceIndex)}
                                      className="text-red-600 hover:text-red-700 p-1"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Selection Summary */}
            {(formData.selectedPlatformServices.length > 0 || formData.newServices.length > 0) && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h5 className="font-medium text-blue-900 mb-2">Résumé de votre sélection</h5>
                <div className="space-y-1 text-sm text-blue-800">
                  {formData.selectedPlatformServices.length > 0 && (
                    <p>• {formData.selectedPlatformServices.length} service(s) sélectionné(s) sur la plateforme</p>
                  )}
                  {formData.newServices.length > 0 && (
                    <p>• {formData.newServices.length} nouveau(x) service(s) à créer</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )

      case 5:
        return (
          <div className="space-y-6 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
            <div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">Vérifiez votre adresse email !</h3>
              <p className="text-gray-600 mb-4">
              Un email de vérification a été envoyé à <strong>{formData.adminEmail}</strong>. 
              Cliquez sur le lien dans l'email pour vérifier votre adresse et définir votre mot de passe.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
              <h4 className="font-medium text-blue-900 mb-2">Prochaines étapes :</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Vérifiez votre boîte email (y compris les spams)</li>
                <li>• Cliquez sur le lien de vérification</li>
                <li>• Définissez votre mot de passe</li>
                <li>• Attendez la validation par notre équipe (2-3 jours ouvrés)</li>
                <li>• Accès complet à la plateforme après validation</li>
              </ul>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  const getStepTitle = () => {
    switch (currentStep) {
      case 1:
        return "Informations générales"
      case 2:
        return "Consultants et frais de gestion"
      case 3:
        return "Informations de l'administrateur"
      case 4:
        return "Services et options"
      case 5:
        return "Demande envoyée"
      default:
        return ""
    }
  }

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.companyName && formData.siret && formData.description
      case 2:
        return formData.consultantCount && formData.managementFeeRate
      case 3:
        return formData.adminFirstName && formData.adminLastName && formData.adminEmail && formData.adminPhone
      case 4:
        const hasSelectedServices = formData.selectedPlatformServices.length > 0
        const hasValidNewServices = formData.newServices.some(service => 
          service.label.trim() !== "" &&
          (!service.requiresData || 
           (service.dataLabel.trim() !== "" && service.dataType.trim() !== ""))
        )
        return hasSelectedServices || hasValidNewServices 
      case 5:
        return true
      default:
        return false
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">L</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Lillinker</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                Étape {currentStep} sur {totalSteps}
              </span>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          <div className="mb-6">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{getStepTitle()}</h2>
            <p className="text-gray-600">
              {currentStep === 1 && "Présentez votre société de portage salarial"}
              {currentStep === 2 && "Informations sur vos consultants et tarifs"}
              {currentStep === 3 && "Coordonnées de l'administrateur du compte"}
              {currentStep === 4 && "Définissez les services que vous proposez"}
              {currentStep === 6 && "Votre demande a été transmise"}
            </p>
          </div>

          <div className="mb-8">
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}
            {renderStep()}
          </div>

          {currentStep < 5 && (
            <div className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={handlePrevious} 
                disabled={currentStep === 1 || isLoading}
                className="flex items-center space-x-2"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Précédent</span>
              </Button>

              {currentStep < 4 ? (
                <Button 
                  onClick={handleNext} 
                  disabled={!isStepValid() || isLoading}
                  className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <span>Suivant</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button 
                  onClick={handleComplete}
                  disabled={!isStepValid() || isLoading}
                  className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Inscription en cours...</span>
                    </>
                  ) : (
                    <>
                      <span>Finaliser l'inscription</span>
                      <CheckCircle className="h-4 w-4" />
                    </>
                  )}
                </Button>
              )}
            </div>
          )}

          {currentStep === 5 && (
            <div className="flex justify-center">
              <Button 
                onClick={onClose}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8"
              >
                Fermer
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompanyModal;