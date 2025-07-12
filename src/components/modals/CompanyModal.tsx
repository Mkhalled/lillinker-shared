"use client"

import { useState } from "react"
import { Button } from "../ui/button/Button"
import { ChevronLeft, ChevronRight, CheckCircle, Plus, Trash2, Upload, X } from "lucide-react"

interface CompanyModalProps {
  onClose: () => void
}

export default function CompanyModal({ onClose }: CompanyModalProps) {
  const [currentStep, setCurrentStep] = useState(1)
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

    // Step 4: Services and options
    services: [] as Array<{
      id: string
      label: string
      description: string
      requiresData: boolean
      dataType?: string
      dataLabel?: string
      dataDescription?: string
      choices?: string[]
    }>
  })

  const totalSteps = 5

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const addService = () => {
    const newService = {
      id: Date.now().toString(),
      label: "",
      description: "",
      requiresData: false,
    }
    setFormData((prev) => ({
      ...prev,
      services: [...prev.services, newService],
    }))
  }

  const updateService = (id: string, field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      services: prev.services.map((service) => (service.id === id ? { ...service, [field]: value } : service)),
    }))
  }

  const removeService = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      services: prev.services.filter((service) => service.id !== id),
    }))
  }

  const addChoice = (serviceId: string) => {
    setFormData((prev) => ({
      ...prev,
      services: prev.services.map((service) =>
        service.id === serviceId ? { ...service, choices: [...(service.choices || []), ""] } : service,
      ),
    }))
  }

  const updateChoice = (serviceId: string, choiceIndex: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      services: prev.services.map((service) =>
        service.id === serviceId
          ? {
              ...service,
              choices: service.choices?.map((choice, index) => (index === choiceIndex ? value : choice)),
            }
          : service,
      ),
    }))
  }

  const removeChoice = (serviceId: string, choiceIndex: number) => {
    setFormData((prev) => ({
      ...prev,
      services: prev.services.map((service) =>
        service.id === serviceId
          ? {
              ...service,
              choices: service.choices?.filter((_, index) => index !== choiceIndex),
            }
          : service,
      ),
    }))
  }

  const handleComplete = () => {
    setCurrentStep(5)
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
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Définition des services et options</h3>
              <Button 
                onClick={addService} 
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-2"
              >
                <Plus className="h-4 w-4" />
                <span>Ajouter un service</span>
              </Button>
            </div>

            {formData.services.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>Aucun service défini. Cliquez sur "Ajouter un service" pour commencer.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {formData.services.map((service, index) => (
                  <div key={service.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Service {index + 1}
                      </span>
                      <button
                        onClick={() => removeService(service.id)}
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
                            onChange={(e) => updateService(service.id, "label", e.target.value)}
                            placeholder="Ex: Assurance RC Pro"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700">Description *</label>
                          <input
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={service.description}
                            onChange={(e) => updateService(service.id, "description", e.target.value)}
                            placeholder="Description du service"
                          />
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`requires-data-${service.id}`}
                          checked={service.requiresData}
                          onChange={(e) => updateService(service.id, "requiresData", e.target.checked)}
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
                                value={service.dataType || ""}
                                onChange={(e) => updateService(service.id, "dataType", e.target.value)}
                              >
                                <option value="">Sélectionnez le type</option>
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
                                value={service.dataLabel || ""}
                                onChange={(e) => updateService(service.id, "dataLabel", e.target.value)}
                                placeholder="Ex: Niveau d'expérience"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Description du champ</label>
                            <input
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              value={service.dataDescription || ""}
                              onChange={(e) => updateService(service.id, "dataDescription", e.target.value)}
                              placeholder="Instructions pour le freelance"
                            />
                          </div>

                          {(service.dataType === "choice" || service.dataType === "multiple") && (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <label className="text-sm font-medium text-gray-700">Valeurs possibles</label>
                                <button
                                  type="button"
                                  onClick={() => addChoice(service.id)}
                                  className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm"
                                >
                                  <Plus className="h-4 w-4" />
                                  <span>Ajouter</span>
                                </button>
                              </div>
                              {service.choices?.map((choice, choiceIndex) => (
                                <div key={choiceIndex} className="flex items-center space-x-2">
                                  <input
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={choice}
                                    onChange={(e) => updateChoice(service.id, choiceIndex, e.target.value)}
                                    placeholder={`Option ${choiceIndex + 1}`}
                                  />
                                  <button
                                    type="button"
                                    onClick={() => removeChoice(service.id, choiceIndex)}
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
        )

      case 5:
        return (
          <div className="space-y-6 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
            <div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">Demande d'inscription envoyée !</h3>
              <p className="text-gray-600 mb-4">
                Nous avons bien reçu votre demande d'inscription. Notre équipe va examiner votre dossier et vous contacter rapidement.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
                <h4 className="font-medium text-blue-900 mb-2">Prochaines étapes :</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Vérification de vos informations par notre équipe</li>
                  <li>• Validation de votre société de portage</li>
                  <li>• Activation de votre compte sous 2-3 jours ouvrés</li>
                  <li>• Réception de vos identifiants de connexion par email</li>
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
        return true 
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
            {renderStep()}
          </div>

          {currentStep < 5 && (
            <div className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={handlePrevious} 
                disabled={currentStep === 1}
                className="flex items-center space-x-2"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Précédent</span>
              </Button>

              {currentStep < 3 ? (
                <Button 
                  onClick={handleNext} 
                  disabled={!isStepValid()}
                  className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <span>Suivant</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button 
                  onClick={handleComplete}
                  disabled={!isStepValid()}
                  className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <span>Finaliser l'inscription</span>
                  <CheckCircle className="h-4 w-4" />
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
  )
}