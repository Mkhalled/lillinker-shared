'use client';

import { Plus } from 'lucide-react';
import { useState, useEffect } from 'react';

import { useModalData } from '../../hooks/useModalData';
import { EmailValidationInput, useEmailValidation } from '../form/EmailValidationInput';
import { SiretValidationInput } from '../form/SiretValidationInput';
import ServiceInfoTooltip from '../ServiceInfoTooltip';
import { Button } from '../ui/button/Button';
import { CollapsibleSection } from '../ui/CollapsibleSection';

import AddServiceModal from './AddServiceModal';
import { ModalWrapper } from './ModalWrapper';
import { SuccessStep } from './SuccessStep';

interface NewService {
  id: string;
  label: string;
  description: string;
  requiresData: boolean;
  dataType: string;
  dataLabel: string;
  dataDescription: string;
  choices: string[];
}

interface CompanyFormData {
  // Step 1: General info
  companyName: string;
  siret: string;
  description: string;
  isPortage: "yes" | "no";
  
  // Step 2: Consultants and fees
  consultantCount: string;
  managementFeeRate: string;

  // Step 3: Metiers selection
  selectedMetiers: string[];

  // Step 4: Admin info
  adminFirstName: string;
  adminLastName: string;
  adminEmail: string;
  adminPhone: string;

  // Step 5: Services selection and creation
  selectedPlatformServices: string[];
  selectedPortages: string[];
  newServices: NewService[];
}


interface CompanyModalProps {
  onClose: () => void
}

const CompanyModal = ({ onClose }: CompanyModalProps) => {
  // Initialize currentStep with localStorage data if available
  const [currentStep, setCurrentStep] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedStep = localStorage.getItem('company-modal-step')
      if (savedStep) {
        const step = parseInt(savedStep, 10)
        if (step >= 1 && step <= 7) {
          return step
        }
      }
    }
    return 1
  })
  
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { platformServices, metiers, portages, error: dataError } = useModalData()
  const { isValidBusinessEmail, checkEmailExists } = useEmailValidation()
  const [isAddServiceModalOpen, setIsAddServiceModalOpen] = useState(false)
  const [emailExists, setEmailExists] = useState(false)
  
  // Initialize formData with localStorage data if available
  const [formData, setFormData] = useState<CompanyFormData>(() => {
    if (typeof window !== 'undefined') {
      const savedData = localStorage.getItem('company-modal-data')
      if (savedData) {
        try {
          return JSON.parse(savedData)
        } catch (error) {
          console.error('Error parsing saved form data:', error)
        }
      }
    }
    
    return {
      // Step 1: General info
      companyName: "",
      siret: "",
      description: "",
      isPortage: "no", // "yes" or "no"
      
      // Step 2: Consultants and fees
      consultantCount: "",
      managementFeeRate: "",

      // Step 3: Metiers selection
      selectedMetiers: [] as string[], // Add metiers selection

      // Step 4: Admin info
      adminFirstName: "",
      adminLastName: "",
      adminEmail: "",
      adminPhone: "",

      // Step 5: Services selection and creation
      selectedPlatformServices: [] as string[],
      selectedPortages: [] as string[], // Add portages selection
      newServices: [] as NewService[]
    }
  })

  const totalSteps = 7

  // Save form data to localStorage whenever formData changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('company-modal-data', JSON.stringify(formData))
    }
  }, [formData])

  // Save current step to localStorage whenever currentStep changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('company-modal-step', currentStep.toString())
    }
  }, [currentStep])

  // Check email existence when admin email changes
  useEffect(() => {
    const checkEmail = async () => {
      if (!formData.adminEmail || !isValidBusinessEmail(formData.adminEmail)) {
        setEmailExists(false)
        return
      }

      try {
        const exists = await checkEmailExists(formData.adminEmail)
        setEmailExists(exists)
      } catch (error) {
        console.error('Error checking email existence:', error)
        setEmailExists(false)
      }
    }

    // Debounce the email check
    const timeoutId = setTimeout(checkEmail, 500)
    return () => clearTimeout(timeoutId)
  }, [formData.adminEmail, isValidBusinessEmail, checkEmailExists])

  // Clear localStorage on successful completion
  const clearLocalStorage = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('company-modal-data')
      localStorage.removeItem('company-modal-step')
    }
  }

  // Set data error if there's a fetching error
  useEffect(() => {
    if (dataError) {
      setError(dataError)
    }
  }, [dataError])

  const handleNext = () => {
    if (currentStep === 6) {
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
    setFormData((prev: CompanyFormData) => ({
      ...prev,
      selectedPlatformServices: prev.selectedPlatformServices.includes(serviceIdStr)
        ? prev.selectedPlatformServices.filter((id: string) => id !== serviceIdStr)
        : [...prev.selectedPlatformServices, serviceIdStr]
    }))
  }

  const toggleMetierSelection = (metierId: number) => {
    const metierIdStr = metierId.toString()
    setFormData((prev: CompanyFormData) => ({
      ...prev,
      selectedMetiers: prev.selectedMetiers.includes(metierIdStr)
        ? prev.selectedMetiers.filter((id: string) => id !== metierIdStr)
        : [...prev.selectedMetiers, metierIdStr]
    }))
  }

  const togglePortageSelection = (portageId: number) => {
    const portageIdStr = portageId.toString()
    setFormData((prev: CompanyFormData) => ({
      ...prev,
      selectedPortages: prev.selectedPortages.includes(portageIdStr)
        ? prev.selectedPortages.filter((id: string) => id !== portageIdStr)
        : [...prev.selectedPortages, portageIdStr]
    }))
  }

  const addNewService = () => {
    setIsAddServiceModalOpen(true)
  }

  const handleAddService = (newService: NewService) => {
    setFormData((prev: CompanyFormData) => ({
      ...prev,
      newServices: [...prev.newServices, newService]
    }))
  }

  const handleComplete = async () => {
    if (currentStep === 6) {
      setIsLoading(true)
      setError(null)
      
      try {
        // Get the most up-to-date form data from localStorage
        let currentFormData = formData
        if (typeof window !== 'undefined') {
          const savedData = localStorage.getItem('company-modal-data')
          if (savedData) {
            try {
              currentFormData = JSON.parse(savedData)
            } catch (error) {
              console.error('Error parsing saved form data during submission:', error)
            }
          }
        }

        // Step 1: Initial registration (create user)
        const signupResponse = await fetch('/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            first_name: currentFormData.adminFirstName,
            last_name: currentFormData.adminLastName,
            email: currentFormData.adminEmail,
            role: "COMPANY",
            phone_number: currentFormData.adminPhone,
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
          company_name: currentFormData.companyName,
          company_description: currentFormData.description,
          siret: currentFormData.siret,
          consultant_count: parseInt(currentFormData.consultantCount),
          management_fees: parseFloat(currentFormData.managementFeeRate),
          is_portage: currentFormData.isPortage === "yes",
          selected_services: currentFormData.selectedPlatformServices.map((id: string) => parseInt(id)),
          selected_metiers: currentFormData.selectedMetiers.map((id: string) => parseInt(id)), // Add metiers
          selected_portages: currentFormData.isPortage === "yes" ? currentFormData.selectedPortages.map((id: string) => parseInt(id)) : [], // Add portages
          // Send all new services as array
          new_services: currentFormData.newServices
            .filter((service: NewService) => service.label.trim() !== '')
            .map((service: NewService) => ({
              service_label: service.label,
              service_description: service.description,
              data_type: service.dataType,
              requires_data: service.requiresData,
              data_label: service.dataLabel,
              data_description: service.dataDescription,
              choices: service.choices.filter((choice: string) => choice.trim() !== ''),
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

        // Clear localStorage on successful completion
        clearLocalStorage()
        setCurrentStep(7)
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700" htmlFor="nom">Nom de la société *</label>
                <input
                id='nom'
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.companyName}
                  onChange={(e) => setFormData((prev: CompanyFormData) => ({ ...prev, companyName: e.target.value }))}
                  placeholder="Ma Société de Portage"
                  required
                />
              </div>
              <SiretValidationInput 
                siret={formData.siret}
                onSiretChange={(siret) => setFormData((prev: CompanyFormData) => ({ ...prev, siret }))}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="desc" className="text-sm font-medium text-gray-700">Description de la société *</label>
              <textarea
              id='desc'
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.description}
                onChange={(e) => setFormData((prev: CompanyFormData) => ({ ...prev, description: e.target.value }))}
                placeholder="Décrivez votre société de portage salarial..."
                rows={4}
                required
              />
            </div>

            {/* Portage Company Question */}
            <div className="space-y-3">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isPortage === "yes"}
                  onChange={(e) => setFormData((prev: CompanyFormData) => ({ ...prev, isPortage: e.target.checked ? "yes" : "no" }))}
                  className="text-blue-600"
                />
                <span className="text-sm font-medium text-gray-700">Nous sommes une société de portage salarial</span>
              </label>
            </div>

            {/* Portages Selection - Only show if company is portage */}
            {formData.isPortage === "yes" && (
              <div className="space-y-3">
                <h1 className="text-sm font-medium text-gray-700">Services de portage proposés *</h1>
                <div className="grid grid-cols-3 gap-3">
                  {portages.map((portage) => (
                    <label key={portage.id} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.selectedPortages.includes(portage.id.toString())}
                        onChange={() => togglePortageSelection(portage.id)}
                        className="text-blue-600 rounded"
                      />
                      <span className="text-sm text-gray-700">{portage.name}</span>
                    </label>
                  ))}
                </div>
              </div>
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
                onChange={(e) => setFormData((prev: CompanyFormData) => ({ ...prev, consultantCount: e.target.value }))}
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
              onChange={(e) => setFormData((prev: CompanyFormData) => ({ ...prev, managementFeeRate: e.target.value }))}
              placeholder="8.5"
              required
              />
              <div className="flex justify-between items-center">
              <p className="text-sm text-gray-600">Taux standard appliqué sur le chiffre d&apos;affaires</p>
              <span className="text-sm font-medium text-gray-900">{formData.managementFeeRate}%</span>
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-4">
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
                    onChange={(e) => {
                      e.stopPropagation();
                      toggleMetierSelection(metier.id);
                    }}
                    onClick={(e) => e.stopPropagation()}
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

      case 4:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="prenom" className="text-sm font-medium text-gray-700">Prénom de l&apos;administrateur *</label>
                <input
                id='prenom'
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.adminFirstName}
                  onChange={(e) => setFormData((prev: CompanyFormData) => ({ ...prev, adminFirstName: e.target.value }))}
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
                  onChange={(e) => setFormData((prev: CompanyFormData) => ({ ...prev, adminLastName: e.target.value }))}
                  placeholder="Martin"
                  required
                />
              </div>
            </div>
            <EmailValidationInput
              email={formData.adminEmail}
              onEmailChange={(email) => setFormData((prev: CompanyFormData) => ({ ...prev, adminEmail: email }))}
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
                onChange={(e) => setFormData((prev: CompanyFormData) => ({ ...prev, adminPhone: e.target.value }))}
                placeholder="01 23 45 67 89"
                required
              />
            </div>
          </div>
        )

      case 5:
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
                <div>
                  <h4 className="font-medium text-gray-900">Créer des nouveaux services</h4>
                  {formData.newServices.length > 0 && (
                    <p className="text-sm text-gray-600 mt-1">
                      {formData.newServices.length} service{formData.newServices.length > 1 ? 's' : ''} créé{formData.newServices.length > 1 ? 's' : ''}
                    </p>
                  )}
                </div>
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

              {formData.newServices.length > 0 && (
                <div className="space-y-3">
                  {formData.newServices.map((service: NewService, index: number) => (
                    <div key={service.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              Nouveau
                            </span>
                          </div>
                          <h5 className="font-medium text-gray-900 mb-1">
                            {service.label || 'Service sans nom'}
                          </h5>
                        </div>
                        <button
                          onClick={() => {
                            setFormData((prev: CompanyFormData) => ({
                              ...prev,
                              newServices: prev.newServices.filter((_, i) => i !== index)
                            }))
                          }}
                          className="text-red-600 hover:text-red-700 text-sm font-medium ml-4 px-2 py-1 rounded hover:bg-red-50"
                        >
                          Supprimer
                        </button>
                      </div>
                    </div>
                  ))}
                  <div className="pt-2">
                    <button
                      onClick={() => setFormData((prev: CompanyFormData) => ({ ...prev, newServices: [] }))}
                      className="text-red-600 hover:text-red-700 text-sm font-medium hover:underline"
                    >
                      Tout supprimer ({formData.newServices.length} service{formData.newServices.length > 1 ? 's' : ''})
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )

      case 6:
        return (
          <div className="space-y-6">
            {/* Company Information */}
            <div className="border rounded-lg p-4 bg-gray-50">
              <h4 className="font-medium text-gray-900 mb-3">Informations de la société</h4>
              <div className="space-y-2 text-sm">
                <div><span className="font-medium">Nom:</span> {formData.companyName}</div>
                <div><span className="font-medium">SIRET:</span> {formData.siret}</div>
                <div><span className="font-medium">Type:</span> {formData.isPortage === "yes" ? "Société de portage salarial" : "Autre société"}</div>
                <div><span className="font-medium">Consultants:</span> {formData.consultantCount}</div>
                <div><span className="font-medium">Frais de gestion:</span> {formData.managementFeeRate}%</div>
              </div>
            </div>

            {/* Administrator Information */}
            <div className="border rounded-lg p-4 bg-gray-50">
              <h4 className="font-medium text-gray-900 mb-3">Administrateur</h4>
              <div className="space-y-2 text-sm">
                <div><span className="font-medium">Nom:</span> {formData.adminFirstName} {formData.adminLastName}</div>
                <div><span className="font-medium">Email:</span> {formData.adminEmail}</div>
                <div><span className="font-medium">Téléphone:</span> {formData.adminPhone}</div>
              </div>
            </div>

            {/* Métiers */}
            {formData.selectedMetiers.length > 0 && (
              <div className="border rounded-lg p-4 bg-gray-50">
                <h4 className="font-medium text-gray-900 mb-3">Métiers supportés ({formData.selectedMetiers.length})</h4>
                <div className="flex flex-wrap gap-2">
                  {formData.selectedMetiers.map((metierId: string) => {
                    const metier = metiers?.find(m => m.id.toString() === metierId)
                    return metier ? (
                      <span key={metierId} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {metier.name}
                      </span>
                    ) : null
                  })}
                </div>
              </div>
            )}

            {/* Portage Services */}
            {formData.isPortage === "yes" && formData.selectedPortages.length > 0 && (
              <div className="border rounded-lg p-4 bg-gray-50">
                <h4 className="font-medium text-gray-900 mb-3">Associations de portage ({formData.selectedPortages.length})</h4>
                <div className="space-y-3">
                  {formData.selectedPortages.map((portageId: string) => {
                    const portage = portages?.find(p => p.id.toString() === portageId)
                    return portage ? (
                      <div key={portageId} className="flex items-start space-x-3 p-3 bg-white rounded border">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {portage.name}
                        </span>
                        <div className="flex-1">
                          <p className="text-sm text-gray-600">{portage.description}</p>
                        </div>
                      </div>
                    ) : null
                  })}
                </div>
              </div>
            )}

            {/* Platform Services */}
            {formData.selectedPlatformServices.length > 0 && (
              <div className="border rounded-lg p-4 bg-gray-50">
                <h4 className="font-medium text-gray-900 mb-3">Services plateforme ({formData.selectedPlatformServices.length})</h4>
                <div className="space-y-3">
                  {formData.selectedPlatformServices.map((serviceId: string) => {
                    const service = platformServices?.find(s => s.id.toString() === serviceId)
                    return service ? (
                      <div key={serviceId} className="flex items-start space-x-3 p-3 bg-white rounded border">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          {service.label}
                        </span>
                        <div className="flex-1">
                          {service.description && (
                            <p className="text-sm text-gray-600">{service.description}</p>
                          )}
                          {service.user?.ownedCompany && (
                            <p className="text-xs text-gray-500 mt-1">
                              Créé par {service.user.ownedCompany.name}
                            </p>
                          )}
                        </div>
                      </div>
                    ) : null
                  })}
                </div>
              </div>
            )}

            {/* New Services */}
            {formData.newServices.filter((s: NewService) => s.label.trim() !== '').length > 0 && (
              <div className="border rounded-lg p-4 bg-gray-50">
                <h4 className="font-medium text-gray-900 mb-3">Nouveaux services ({formData.newServices.filter((s: NewService) => s.label.trim() !== '').length})</h4>
                <div className="space-y-4">
                  {formData.newServices.filter((s: NewService) => s.label.trim() !== '').map((service: NewService) => (
                    <div key={service.id} className="p-4 bg-white rounded border">
                      <div className="flex items-start justify-between mb-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                          Nouveau
                        </span>
                      </div>
                      <h5 className="font-medium text-gray-900 mb-1">{service.label}</h5>
                      {service.description && (
                        <p className="text-sm text-gray-600 mb-3">{service.description}</p>
                      )}
                      {service.requiresData && (
                        <div className="mt-3 p-3 bg-gray-50 rounded">
                          <p className="text-xs text-gray-600 mb-2">
                            <span className="font-medium">Données requises:</span> {service.dataType === 'TEXT' ? 'Texte libre' : service.dataType === 'NUMBER' ? 'Numérique' : service.dataType === 'RADIO' ? 'Choix unique' : 'Choix multiple'}
                          </p>
                          {service.dataLabel && (
                            <p className="text-xs text-gray-600 mb-1">
                              <span className="font-medium">Label:</span> {service.dataLabel}
                            </p>
                          )}
                          {service.dataDescription && (
                            <p className="text-xs text-gray-600 mb-1">
                              <span className="font-medium">Description:</span> {service.dataDescription}
                            </p>
                          )}
                          {service.choices && service.choices.filter((c: string) => c.trim() !== '').length > 0 && (
                            <div className="mt-2">
                              <p className="text-xs text-gray-600 font-medium mb-1">Options disponibles:</p>
                              <div className="flex flex-wrap gap-1">
                                {service.choices.filter((c: string) => c.trim() !== '').map((choice: string, index: number) => (
                                  <span key={index} className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-gray-200 text-gray-700">
                                    {choice}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )

      case 7:
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
        return "Métiers supportés"
      case 4:
        return "Informations de l'administrateur"
      case 5:
        return "Services et options"
      case 6:
        return "Récapitulatif"
      case 7:
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
        return "Sélectionnez les métiers que vous supportez"
      case 4:
        return "Coordonnées de l'administrateur du compte"
      case 5:
        return "Définissez les services que vous proposez"
      case 6:
        return "Vérifiez vos informations avant finalisation"
      case 7:
        return "Votre demande a été transmise"
      default:
        return ""
    }
  }

  const isStepValid = () => {
    switch (currentStep) {
      case 1: {
        const basicValid = formData.companyName && 
                          formData.siret && 
                          formData.description;
        if (formData.isPortage === "yes") {
          return basicValid && formData.selectedPortages.length > 0;
        }
        return basicValid;
      }
      case 2:
        return formData.consultantCount && formData.managementFeeRate
      case 3:
        return formData.selectedMetiers.length > 0
      case 4:
        return formData.adminFirstName && 
               formData.adminLastName && 
               formData.adminEmail && 
               formData.adminPhone &&
               isValidBusinessEmail(formData.adminEmail) &&
               !emailExists
      case 5:
       {
         const hasSelectedServices = formData.selectedPlatformServices.length > 0
        const hasValidNewServices = formData.newServices.some((service: NewService) => 
          service.label.trim() !== "" &&
          (!service.requiresData || 
           (service.dataLabel.trim() !== "" && service.dataType.trim() !== ""))
        )
        return hasSelectedServices || hasValidNewServices 
       }
      case 6:
        return true // Recap step is always valid
      case 7:
        return true
      default:
        return false
    }
  }

  return (
    <>
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
        showNavigation={currentStep < 7}
        completeButtonText="Finaliser l'inscription"
        nextButtonText="Suivant"
        completionStep={6} // Specify that completion happens on step 6
        onClearProgress={() => {
          clearLocalStorage()
          setCurrentStep(1)
          setFormData({
            companyName: "",
            siret: "",
            description: "",
            isPortage: "no",
            consultantCount: "",
            managementFeeRate: "",
            selectedMetiers: [],
            adminFirstName: "",
            adminLastName: "",
            adminEmail: "",
            adminPhone: "",
            selectedPlatformServices: [],
            selectedPortages: [],
            newServices: []
          })
        }}
      >
        {renderStep()}
      </ModalWrapper>

      <AddServiceModal
        isOpen={isAddServiceModalOpen}
        onClose={() => setIsAddServiceModalOpen(false)}
        onSave={handleAddService}
      />
    </>
  );
};

export default CompanyModal;