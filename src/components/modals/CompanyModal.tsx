'use client';

import { Plus, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';

import { useModalData } from '../../hooks/useModalData';
import { EmailValidationInput, useEmailValidation } from '../form/EmailValidationInput';
import ServiceInfoTooltip from '../ServiceInfoTooltip';
import { Button } from '../ui/button/Button';
import { CollapsibleSection } from '../ui/CollapsibleSection';

import { ModalWrapper } from './ModalWrapper';
import { SuccessStep } from './SuccessStep';


interface CompanyModalProps {
  onClose: () => void
}

const CompanyModal = ({ onClose }: CompanyModalProps) => {
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { platformServices, metiers, portages, error: dataError } = useModalData()
  const { isValidBusinessEmail } = useEmailValidation()
  const [formData, setFormData] = useState({
    // Step 1: General info
    companyName: "",
    siret: "",
    description: "",
    isPortage: "", // "yes" or "no"
    
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
    selectedMetiers: [] as string[], // Add metiers selection
    selectedPortages: [] as string[], // Add portages selection
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

  // Set data error if there's a fetching error
  useEffect(() => {
    if (dataError) {
      setError(dataError)
    }
  }, [dataError])

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

  const toggleMetierSelection = (metierId: number) => {
    const metierIdStr = metierId.toString()
    setFormData(prev => ({
      ...prev,
      selectedMetiers: prev.selectedMetiers.includes(metierIdStr)
        ? prev.selectedMetiers.filter(id => id !== metierIdStr)
        : [...prev.selectedMetiers, metierIdStr]
    }))
  }

  const togglePortageSelection = (portageId: number) => {
    const portageIdStr = portageId.toString()
    setFormData(prev => ({
      ...prev,
      selectedPortages: prev.selectedPortages.includes(portageIdStr)
        ? prev.selectedPortages.filter(id => id !== portageIdStr)
        : [...prev.selectedPortages, portageIdStr]
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

  const updateNewService = (serviceId: string, field: string, value: string | boolean) => {
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
          is_portage: formData.isPortage === "yes",
          selected_services: formData.selectedPlatformServices.map(id => parseInt(id)),
          selected_metiers: formData.selectedMetiers.map(id => parseInt(id)), // Add metiers
          selected_portages: formData.isPortage === "yes" ? formData.selectedPortages.map(id => parseInt(id)) : [], // Add portages
          // Send all new services as array
          new_services: formData.newServices
            .filter(service => service.label.trim() !== '')
            .map(service => ({
              service_label: service.label,
              service_description: service.description,
              data_type: service.dataType,
              requires_data: service.requiresData,
              data_label: service.dataLabel,
              data_description: service.dataDescription,
              choices: service.choices.filter(choice => choice.trim() !== ''),
            }))
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
              <label className="text-sm font-medium text-gray-700" htmlFor="nom">Nom de la société *</label>
              <input
              id='nom'
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.companyName}
                onChange={(e) => setFormData((prev) => ({ ...prev, companyName: e.target.value }))}
                placeholder="Ma Société de Portage"
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="siret" className="text-sm font-medium text-gray-700">SIRET *</label>
              <input
              id='siret'
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.siret}
                onChange={(e) => setFormData((prev) => ({ ...prev, siret: e.target.value }))}
                placeholder="12345678901234"
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="desc" className="text-sm font-medium text-gray-700">Description de la société *</label>
              <textarea
              id='desc'
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Décrivez votre société de portage salarial..."
                rows={4}
                required
              />
            </div>

            {/* Portage Company Question */}
            <div className="space-y-3">
              <label htmlFor="portage" className="text-sm font-medium text-gray-700">Êtes-vous une société de portage salarial ? *</label>
              <div id="portage" className="space-y-3">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="isPortage"
                    value="yes"
                    checked={formData.isPortage === "yes"}
                    onChange={(e) => setFormData((prev) => ({ ...prev, isPortage: e.target.value }))}
                    className="text-blue-600"
                  />
                  <span className="text-gray-700">Oui, nous sommes une société de portage salarial</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="isPortage"
                    value="no"
                    checked={formData.isPortage === "no"}
                    onChange={(e) => setFormData((prev) => ({ ...prev, isPortage: e.target.value }))}
                    className="text-blue-600"
                  />
                  <span className="text-gray-700">Non, nous ne sommes pas une société de portage</span>
                </label>
              </div>
            </div>

            {/* Portages Selection - Only show if company is portage */}
            {formData.isPortage === "yes" && (
              <CollapsibleSection
                title="Services de portage proposés *"
                description="Sélectionnez les services de portage que votre société propose"
                items={portages}
                selectedItems={formData.selectedPortages}
                onToggleItem={togglePortageSelection}
                getItemId={(portage) => portage.id}
                renderItem={(portage, isSelected) => (
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <span className="text-sm text-gray-700 font-medium">{portage.name}</span>
                      {portage.description && (
                        <p className="text-xs text-gray-500 mt-1">{portage.description}</p>
                      )}
                    </div>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => togglePortageSelection(portage.id)}
                      className="h-4 w-4 text-blue-600 rounded"
                    />
                  </div>
                )}
                loadingText="Chargement des services de portage..."
                emptyStateText="Aucun service de portage disponible"
                showItemCount={true}
              />
            )}
          </div>
        )

      case 2:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="consu" className="text-sm font-medium text-gray-700">Nombre actuel de consultants portés *</label>
              <input
              id='consu'
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                type="number"
                value={formData.consultantCount}
                onChange={(e) => setFormData((prev) => ({ ...prev, consultantCount: e.target.value }))}
                placeholder="50"
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="fees" className="text-sm font-medium text-gray-700">Taux de frais de gestion (%) *</label>
              <input
              id='fees'
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              type="range"
              step="0.1"
              min="0"
              max="20"
              value={formData.managementFeeRate}
              onChange={(e) => setFormData((prev) => ({ ...prev, managementFeeRate: e.target.value }))}
              placeholder="8.5"
              required
              />
              <div className="flex justify-between items-center">
              <p className="text-sm text-gray-600">Taux standard appliqué sur le chiffre d&apos;affaires</p>
              <span className="text-sm font-medium text-gray-900">{formData.managementFeeRate}%</span>
              </div>
            </div>

            {/* Metiers Selection */}
            <CollapsibleSection
              title="Métiers supportés *"
              description="Sélectionnez les métiers que votre société de portage prend en charge"
              items={metiers}
              selectedItems={formData.selectedMetiers}
              onToggleItem={toggleMetierSelection}
              getItemId={(metier) => metier.id}
              renderItem={(metier, isSelected) => (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-700 font-medium">{metier.name}</span>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleMetierSelection(metier.id)}
                    className="h-4 w-4 text-blue-600 rounded"
                  />
                </div>
              )}
              loadingText="Chargement des métiers..."
              emptyStateText="Aucun métier disponible"
              showItemCount={true}
            />
          </div>
        )

      case 3:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="prenom" className="text-sm font-medium text-gray-700">Prénom de l&apos;administrateur *</label>
                <input
                id='prenom'
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.adminFirstName}
                  onChange={(e) => setFormData((prev) => ({ ...prev, adminFirstName: e.target.value }))}
                  placeholder="Marie"
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium text-gray-700">Nom de l&apos;administrateur *</label>
                <input
                id='name'
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.adminLastName}
                  onChange={(e) => setFormData((prev) => ({ ...prev, adminLastName: e.target.value }))}
                  placeholder="Martin"
                  required
                />
              </div>
            </div>
            <EmailValidationInput
              email={formData.adminEmail}
              onEmailChange={(email) => setFormData((prev) => ({ ...prev, adminEmail: email }))}
              label="Email de l'administrateur *"
              placeholder="marie.martin@societe.com"
              id="admin-email"
            />
            <div className="space-y-2">
              <label htmlFor="phone" className="text-sm font-medium text-gray-700">Téléphone de l&apos;administrateur *</label>
              <input
              id='phone'
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

            {/* Existing Platform Services */}
            <CollapsibleSection
              title="Services disponibles sur la plateforme"
              items={platformServices}
              selectedItems={formData.selectedPlatformServices}
              onToggleItem={toggleServiceSelection}
              getItemId={(service) => service.id}
              renderItem={(service, isSelected) => (
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h5 className="font-medium text-gray-900">{service.label}</h5>
                      <div onClick={(e) => e.stopPropagation()}>
                        <ServiceInfoTooltip service={service} />
                      </div>
                    </div>
                    {service.user?.ownedCompany && (
                      <p className="text-xs text-gray-500 mt-1">
                        Par {service.user.ownedCompany.name}
                      </p>
                    )}
                  </div>
                  <div className="ml-3">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleServiceSelection(service.id)}
                      className="h-4 w-4 text-blue-600 rounded"
                    />
                  </div>
                </div>
              )}
              loadingText="Aucun service disponible pour le moment"
              emptyStateText="Aucun service disponible pour le moment"
              showItemCount={true}
            />

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
                            <label htmlFor="service" className="text-sm font-medium text-gray-700">Libellé du service *</label>
                            <input
                            id='service'
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              value={service.label}
                              onChange={(e) => updateNewService(service.id, "label", e.target.value)}
                              placeholder="Ex: Assurance RC Pro"
                            />
                          </div>
                          <div className="space-y-2">
                            <label htmlFor="description" className="text-sm font-medium text-gray-700">Description</label>
                            <input
                            id='description'
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
                                <label htmlFor="type" className="text-sm font-medium text-gray-700">Type de données</label>
                                <select
                                id='type'
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
                                <label htmlFor="label" className="text-sm font-medium text-gray-700">Label du champ</label>
                                <input
                                id='label'
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  value={service.dataLabel}
                                  onChange={(e) => updateNewService(service.id, "dataLabel", e.target.value)}
                                  placeholder="Ex: Niveau d'expérience"
                                />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <label htmlFor="champ" className="text-sm font-medium text-gray-700">Description du champ</label>
                              <input
                              id='champ'
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={service.dataDescription}
                                onChange={(e) => updateNewService(service.id, "dataDescription", e.target.value)}
                                placeholder="Instructions pour le freelance"
                              />
                            </div>

                            {(service.dataType === "RADIO" || service.dataType === "SELECT") && (
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <label htmlFor="value" className="text-sm font-medium text-gray-700">Valeurs possibles</label>
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
                                    id='value'
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
            </div>
          </div>
        )

      case 5:
        return <SuccessStep email={formData.adminEmail} />

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

  const getStepDescription = () => {
    switch (currentStep) {
      case 1:
        return "Présentez votre société de portage salarial"
      case 2:
        return "Informations sur vos consultants et tarifs"
      case 3:
        return "Coordonnées de l'administrateur du compte"
      case 4:
        return "Définissez les services que vous proposez"
      case 5:
        return "Votre demande a été transmise"
      default:
        return ""
    }
  }

  const isStepValid = () => {
    switch (currentStep) {
      case 1: {
        const basicValid = formData.companyName && formData.siret && formData.description && formData.isPortage;
        if (formData.isPortage === "yes") {
          return basicValid && formData.selectedPortages.length > 0;
        }
        return basicValid;
      }
      case 2:
        return formData.consultantCount && formData.managementFeeRate && formData.selectedMetiers.length > 0
      case 3:
        return formData.adminFirstName && 
               formData.adminLastName && 
               formData.adminEmail && 
               formData.adminPhone &&
               isValidBusinessEmail(formData.adminEmail)
      case 4:
       {
         const hasSelectedServices = formData.selectedPlatformServices.length > 0
        const hasValidNewServices = formData.newServices.some(service => 
          service.label.trim() !== "" &&
          (!service.requiresData || 
           (service.dataLabel.trim() !== "" && service.dataType.trim() !== ""))
        )
        return hasSelectedServices || hasValidNewServices 
       }
      case 5:
        return true
      default:
        return false
    }
  }

  return (
    <ModalWrapper
      onClose={onClose}
      title="Lillinker"
      currentStep={currentStep}
      totalSteps={totalSteps}
      stepTitle={getStepTitle()}
      stepDescription={getStepDescription()}
      onNext={handleNext}
      onPrevious={handlePrevious}
      onComplete={handleComplete}
      isStepValid={isStepValid() as boolean}
      isLoading={isLoading}
      error={error}
      showNavigation={currentStep < 5}
      completeButtonText="Finaliser l'inscription"
      nextButtonText="Suivant"
    >
      {renderStep()}
    </ModalWrapper>
  );
};

export default CompanyModal;