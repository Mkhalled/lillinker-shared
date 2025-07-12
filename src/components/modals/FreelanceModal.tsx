"use client"

import { useState } from "react"
import { Button } from "../ui/button/Button"
import { ChevronLeft, ChevronRight, CheckCircle, X } from "lucide-react"

// Mock service options from companies
const mockServiceOptions = [
  {
    id: 1,
    label: "Assurance RC Pro",
    description: "Assurance responsabilité civile professionnelle",
    requiresData: false,
    companyName: "PortagePro",
  },
  {
    id: 2,
    label: "Formation comptabilité",
    description: "Formation aux bases de la comptabilité freelance",
    requiresData: true,
    dataType: "text",
    dataLabel: "Niveau actuel",
    dataDescription: "Décrivez votre niveau actuel en comptabilité",
  },
  {
    id: 3,
    label: "Mutuelle santé",
    description: "Complémentaire santé adaptée aux freelances",
    requiresData: true,
    dataType: "choice",
    dataLabel: "Situation familiale",
    dataDescription: "Sélectionnez votre situation",
    choices: ["Célibataire", "En couple", "Avec enfants"],
  },
  {
    id: 4,
    label: "Accompagnement juridique",
    description: "Support juridique pour vos contrats",
    requiresData: false,
  },
]

interface FreelanceModalProps {
  onClose: () => void
}

export default function FreelanceModal({ onClose }: FreelanceModalProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    // Step 1: Personal info
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    profession: "",

    // Step 2: Mission info
    hasMission: "",
    clientName: "",
    clientAddress: "",
    clientSector: "",

    // Step 3: Services
    selectedServices: [] as number[],
    serviceData: {} as Record<number, string>,

    // Step 4: Priority
    priority: "",
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

  const handleServiceToggle = (serviceId: number) => {
    setFormData((prev) => ({
      ...prev,
      selectedServices: prev.selectedServices.includes(serviceId)
        ? prev.selectedServices.filter((id) => id !== serviceId)
        : [...prev.selectedServices, serviceId],
    }))
  }

  const handleServiceDataChange = (serviceId: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      serviceData: { ...prev.serviceData, [serviceId]: value },
    }))
  }

  const handleComplete = () => {
    // Just show completion message
    setCurrentStep(5)
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Prénom *</label>
                <input
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.firstName}
                  onChange={(e) => setFormData((prev) => ({ ...prev, firstName: e.target.value }))}
                  placeholder="Jean"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Nom *</label>
                <input
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.lastName}
                  onChange={(e) => setFormData((prev) => ({ ...prev, lastName: e.target.value }))}
                  placeholder="Dupont"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Email *</label>
              <input
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                placeholder="jean.dupont@email.com"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Téléphone *</label>
              <input
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.phone}
                onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                placeholder="06 12 34 56 78"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Métier *</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.profession}
                onChange={(e) => setFormData((prev) => ({ ...prev, profession: e.target.value }))}
              >
                <option value="">Sélectionnez votre métier</option>
                <option value="developer">Développeur</option>
                <option value="designer">Designer</option>
                <option value="consultant">Consultant</option>
                <option value="marketing">Marketing</option>
                <option value="writer">Rédacteur</option>
                <option value="other">Autre</option>
              </select>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-4">
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700">Avez-vous une mission actuellement ? *</label>
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="hasMission"
                    value="no"
                    checked={formData.hasMission === "no"}
                    onChange={(e) => setFormData((prev) => ({ ...prev, hasMission: e.target.value }))}
                    className="text-blue-600"
                  />
                  <span>Non, je suis en recherche</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="hasMission"
                    value="searching"
                    checked={formData.hasMission === "searching"}
                    onChange={(e) => setFormData((prev) => ({ ...prev, hasMission: e.target.value }))}
                    className="text-blue-600"
                  />
                  <span>En cours de recherche</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="hasMission"
                    value="yes"
                    checked={formData.hasMission === "yes"}
                    onChange={(e) => setFormData((prev) => ({ ...prev, hasMission: e.target.value }))}
                    className="text-blue-600"
                  />
                  <span>Oui, j'ai une mission en cours</span>
                </label>
              </div>
            </div>

            {formData.hasMission === "yes" && (
              <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Nom du client</label>
                  <input
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.clientName}
                    onChange={(e) => setFormData((prev) => ({ ...prev, clientName: e.target.value }))}
                    placeholder="Nom de l'entreprise"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Adresse du client</label>
                  <input
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.clientAddress}
                    onChange={(e) => setFormData((prev) => ({ ...prev, clientAddress: e.target.value }))}
                    placeholder="Adresse complète"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Secteur d'activité</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.clientSector}
                    onChange={(e) => setFormData((prev) => ({ ...prev, clientSector: e.target.value }))}
                  >
                    <option value="">Sélectionnez le secteur</option>
                    <option value="tech">Technologie</option>
                    <option value="finance">Finance</option>
                    <option value="retail">Commerce</option>
                    <option value="healthcare">Santé</option>
                    <option value="education">Éducation</option>
                    <option value="other">Autre</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        )

      case 3:
        return (
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-3">Sélectionnez les services qui vous intéressent :</h3>
              <div className="space-y-3">
                {mockServiceOptions.map((service) => (
                  <div key={service.id} className="border rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        id={`service-${service.id}`}
                        checked={formData.selectedServices.includes(service.id)}
                        onChange={() => handleServiceToggle(service.id)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <label htmlFor={`service-${service.id}`} className="font-medium cursor-pointer">
                          {service.label}
                        </label>
                        <p className="text-sm text-gray-600 mt-1">{service.description}</p>

                        {formData.selectedServices.includes(service.id) && service.requiresData && (
                          <div className="mt-3 space-y-2">
                            <label className="text-sm font-medium">{service.dataLabel}</label>
                            {service.dataType === "text" && (
                              <textarea
                                placeholder={service.dataDescription}
                                value={formData.serviceData[service.id] || ""}
                                onChange={(e) => handleServiceDataChange(service.id, e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                rows={3}
                              />
                            )}
                            {service.dataType === "choice" && service.choices && (
                              <select
                                value={formData.serviceData[service.id] || ""}
                                onChange={(e) => handleServiceDataChange(service.id, e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              >
                                <option value="">{service.dataDescription}</option>
                                {service.choices.map((choice) => (
                                  <option key={choice} value={choice}>
                                    {choice}
                                  </option>
                                ))}
                              </select>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-4">
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700">Quelle est la priorité de votre demande ? *</label>
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="priority"
                    value="urgent"
                    checked={formData.priority === "urgent"}
                    onChange={(e) => setFormData((prev) => ({ ...prev, priority: e.target.value }))}
                    className="text-blue-600"
                  />
                  <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
                  <span>Urgent - J'ai besoin d'une réponse rapidement</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="priority"
                    value="medium"
                    checked={formData.priority === "medium"}
                    onChange={(e) => setFormData((prev) => ({ ...prev, priority: e.target.value }))}
                    className="text-blue-600"
                  />
                  <span className="w-3 h-3 bg-orange-500 rounded-full mr-2"></span>
                  <span>Moyen - Dans les prochaines semaines</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="priority"
                    value="low"
                    checked={formData.priority === "low"}
                    onChange={(e) => setFormData((prev) => ({ ...prev, priority: e.target.value }))}
                    className="text-blue-600"
                  />
                  <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                  <span>Non prioritaire - Je me renseigne</span>
                </label>
              </div>
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-6 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
            <div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">Merci pour votre demande !</h3>
              <p className="text-gray-600 mb-4">
                Nous avons bien reçu vos informations. Notre équipe va analyser votre profil et vous contacter dans les plus brefs délais.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
                <h4 className="font-medium text-blue-900 mb-2">Prochaines étapes :</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Analyse de votre profil par notre équipe</li>
                  <li>• Mise en relation avec les sociétés de portage adaptées</li>
                  <li>• Contact sous 24-48h selon la priorité indiquée</li>
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
        return "Informations personnelles"
      case 2:
        return "Informations sur la mission"
      case 3:
        return "Services souhaités"
      case 4:
        return "Priorité de la demande"
      case 5:
        return "Demande envoyée"
      default:
        return ""
    }
  }

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.firstName && formData.lastName && formData.email && formData.phone && formData.profession
      case 2:
        return (
          formData.hasMission &&
          (formData.hasMission !== "yes" || (formData.clientName && formData.clientAddress && formData.clientSector))
        )
      case 3:
        return true // Optional step
      case 4:
        return formData.priority
      case 5:
        return true
      default:
        return false
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
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
              {currentStep === 1 && "Renseignez vos informations de base"}
              {currentStep === 2 && "Parlez-nous de votre situation actuelle"}
              {currentStep === 3 && "Choisissez les services qui vous intéressent"}
              {currentStep === 4 && "Définissez l'urgence de votre demande"}
              {currentStep === 5 && "Votre demande a été transmise"}
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

              {currentStep < 4 ? (
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
                  <span>Envoyer ma demande</span>
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