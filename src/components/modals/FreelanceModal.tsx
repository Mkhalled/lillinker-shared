'use client';

import { useState, useEffect } from 'react';

import { useModalData } from '../../hooks/useModalData';
import { BasicEmailInput } from '../form/BasicEmailInput';
import ServiceInfoTooltip from '../ServiceInfoTooltip';

import { ModalWrapper } from './ModalWrapper';
import { SuccessStep } from './SuccessStep';

interface SelectedService {
  serviceId: number;
  isRequired: boolean;
  responseData?: string;
}

interface FreelanceFormData {
  // Step 1: Personal info
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  metierId: number;

  // Step 2: Mission info
  hasMission: string;
  clientName: string;
  clientAddress: string;
  clientSector: string;
  tjm: string;
  days: string;
  wantsPortage: "yes" | "no";
  selectedPortages: string[];

  // Step 3: Services
  selectedServices: SelectedService[];
  newServices: string[];

  // Step 4: Priority
  priority: string;
}



interface FreelanceModalProps {
  onClose: () => void
}

const FreelanceModal = ({ onClose }: FreelanceModalProps) => {
  // Initialize currentStep with localStorage data if available
  const [currentStep, setCurrentStep] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedStep = localStorage.getItem('freelance-modal-step')
      if (savedStep) {
        const step = parseInt(savedStep, 10)
        if (step >= 1 && step <= 6) {
          return step
        }
      }
    }
    return 1
  })
  
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { platformServices, metiers, portages, error: dataError } = useModalData()
  
  // Basic email validation function
  const isValidEmail = (email: string): boolean => {
    const basicEmailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return basicEmailRegex.test(email);
  }
  
  const [summaryPage, setSummaryPage] = useState(0)
  
  // Initialize formData with localStorage data if available
  const [formData, setFormData] = useState<FreelanceFormData>(() => {
    if (typeof window !== 'undefined') {
      const savedData = localStorage.getItem('freelance-modal-data')
      if (savedData) {
        try {
          return JSON.parse(savedData)
        } catch (error) {
          console.error('Error parsing saved form data:', error)
        }
      }
    }
    
    return {
      // Step 1: Personal info
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      metierId: 0,

      // Step 2: Mission info
      hasMission: "",
      clientName: "",
      clientAddress: "",
      clientSector: "",
      tjm: "",
      days: "",
      wantsPortage: "no", // "yes" or "no"
      selectedPortages: [] as string[],

      // Step 3: Services
      selectedServices: [] as SelectedService[],
      newServices: [] as string[],

      // Step 4: Priority
      priority: "",
    }
  })

  const totalSteps = 6

  // Save form data to localStorage whenever formData changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('freelance-modal-data', JSON.stringify(formData))
    }
  }, [formData])

  // Save current step to localStorage whenever currentStep changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('freelance-modal-step', currentStep.toString())
    }
  }, [currentStep])

  // Clear localStorage on successful completion
  const clearLocalStorage = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('freelance-modal-data')
      localStorage.removeItem('freelance-modal-step')
    }
  }

  // Set data error if there's a fetching error
  useEffect(() => {
    if (dataError) {
      setError(dataError)
    }
  }, [dataError])

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
    setFormData((prev: FreelanceFormData) => {
      const existingServiceIndex = prev.selectedServices.findIndex((s: SelectedService) => s.serviceId === serviceId)
      
      if (existingServiceIndex >= 0) {
        // Remove service
        return {
          ...prev,
          selectedServices: prev.selectedServices.filter((s: SelectedService) => s.serviceId !== serviceId)
        }
      } else {
        // Add service
        return {
          ...prev,
          selectedServices: [...prev.selectedServices, { serviceId, isRequired: false }]
        }
      }
    })
  }

  const handleServiceRequiredChange = (serviceId: number, isRequired: boolean) => {
    setFormData((prev: FreelanceFormData) => ({
      ...prev,
      selectedServices: prev.selectedServices.map((s: SelectedService) => 
        s.serviceId === serviceId ? { ...s, isRequired } : s
      )
    }))
  }

  const handleServiceDataChange = (serviceId: number, value: string) => {
    setFormData((prev: FreelanceFormData) => ({
      ...prev,
      selectedServices: prev.selectedServices.map((s: SelectedService) => 
        s.serviceId === serviceId ? { ...s, responseData: value } : s
      )
    }))
  }

  const handlePortageToggle = (portageId: number) => {
    const portageIdStr = portageId.toString()
    setFormData((prev: FreelanceFormData) => ({
      ...prev,
      selectedPortages: prev.selectedPortages.includes(portageIdStr)
        ? prev.selectedPortages.filter((id: string) => id !== portageIdStr)
        : [...prev.selectedPortages, portageIdStr]
    }))
  }

  // Helper function to parse choices from service.choices
  const parseChoices = (choices: unknown) => {
    if (!choices) return [];
    if (typeof choices === 'string') {
      try {
        return JSON.parse(choices);
      } catch {
        return [choices];
      }
    }
    if (Array.isArray(choices)) return choices;
    return [];
  }

  // Handle multiple selections for SELECT type
  const handleMultipleSelectChange = (serviceId: number, option: string, isChecked: boolean) => {
    setFormData((prev: FreelanceFormData) => {
      const service = prev.selectedServices.find((s: SelectedService) => s.serviceId === serviceId)
      if (!service) return prev
      
      let currentSelections = service.responseData ? service.responseData.split(',').filter((s: string) => s.trim() !== '') : []
      
      if (isChecked) {
        if (!currentSelections.includes(option)) {
          currentSelections.push(option)
        }
      } else {
        currentSelections = currentSelections.filter((s: string) => s !== option)
      }
      
      return {
        ...prev,
        selectedServices: prev.selectedServices.map((s: SelectedService) => 
          s.serviceId === serviceId ? { ...s, responseData: currentSelections.join(',') } : s
        )
      }
    })
  }

  const handleComplete = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Get the most up-to-date form data from localStorage
      let currentFormData = formData
      if (typeof window !== 'undefined') {
        const savedData = localStorage.getItem('freelance-modal-data')
        if (savedData) {
          try {
            currentFormData = JSON.parse(savedData)
          } catch (error) {
            console.error('Error parsing saved form data during submission:', error)
          }
        }
      }

      // Step 1: Initial registration (create user) - same as CompanyModal
      const signupResponse = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          first_name: currentFormData.firstName,
          last_name: currentFormData.lastName,
          email: currentFormData.email,
          role: "FREELANCE",
          phone_number: currentFormData.phone,
        }),
      })

      if (!signupResponse.ok) {
        const errorData = await signupResponse.json()
        throw new Error(errorData.error || 'Registration failed')
      }

      const signupData = await signupResponse.json()
      // Step 2: Freelance onboarding - same pattern as CompanyModal
      const onboardingData = {
        userId: signupData.userId,
        metier_id: currentFormData.metierId,
        mission_status: currentFormData.hasMission === 'yes' ? 'OPEN' : 'PENDING',
        priority: currentFormData.priority === 'urgent' ? 'HIGH' : 
                 currentFormData.priority === 'medium' ? 'MEDIUM' : 'LOW',
        tjm: parseFloat(currentFormData.tjm) || 1, // Ensure minimum value of 1
        days: parseFloat(currentFormData.days) || 0.5, // Ensure minimum value of 0.5
        wants_portage: currentFormData.wantsPortage === "yes",
        selected_portages: currentFormData.wantsPortage === "yes" ? currentFormData.selectedPortages.map((id: string) => parseInt(id)) : [],
        selected_services: currentFormData.selectedServices,
        // Only include client fields if they have values
        ...(currentFormData.clientName && { client_name: currentFormData.clientName }),
        ...(currentFormData.clientAddress && { client_address: currentFormData.clientAddress }),
        ...(currentFormData.clientSector && { client_sector: currentFormData.clientSector }),
      }
      const onboardingResponse = await fetch('/api/auth/onboarding/freelance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(onboardingData),
      })
      if (!onboardingResponse.ok) {
        const errorData = await onboardingResponse.json()
        throw new Error(errorData.error || 'Freelance onboarding failed')
      }
      
      // Clear localStorage on successful completion
      clearLocalStorage()
      // Show success step
      setCurrentStep(6)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Une erreur est survenue')
    } finally {
      setIsLoading(false)
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="prenom" className="text-sm font-medium text-gray-700">Prénom *</label>
                <input
                id='prenom'
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.firstName}
                  onChange={(e) => setFormData((prev: FreelanceFormData) => ({ ...prev, firstName: e.target.value }))}
                  placeholder="Jean"
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="nom" className="text-sm font-medium text-gray-700">Nom *</label>
                <input
                id='nom'
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.lastName}
                  onChange={(e) => setFormData((prev: FreelanceFormData) => ({ ...prev, lastName: e.target.value }))}
                  placeholder="Dupont"
                  required
                />
              </div>
            </div>
            <BasicEmailInput
              email={formData.email}
              onEmailChange={(email) => setFormData((prev: FreelanceFormData) => ({ ...prev, email: email }))}
              label="Email *"
              placeholder="jean.dupont@email.com"
              id="freelance-email"
            />
            <div className="space-y-2">
              <label htmlFor="phone" className="text-sm font-medium text-gray-700">Téléphone *</label>
              <input
              id='phone'
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.phone}
                onChange={(e) => setFormData((prev: FreelanceFormData) => ({ ...prev, phone: e.target.value }))}
                placeholder="06 12 34 56 78"
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="metier" className="text-sm font-medium text-gray-700">Métier *</label>
              <select
                id='metier'
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.metierId}
                onChange={(e) => setFormData((prev: FreelanceFormData) => ({ ...prev, metierId: parseInt(e.target.value) }))}
              >
                <option value={0}>Sélectionnez votre métier</option>
                {metiers.map((metier) => (
                  <option key={metier.id} value={metier.id}>
                    {metier.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-4">
            <div className="space-y-3">
              <label htmlFor="mission" className="text-sm font-medium text-gray-700">Avez-vous une mission actuellement ? *</label>
              <div id='mission' className="flex flex-wrap gap-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="hasMission"
                    value="no"
                    checked={formData.hasMission === "no"}
                    onChange={(e) => setFormData((prev: FreelanceFormData) => ({ ...prev, hasMission: e.target.value }))}
                    className="text-blue-600"
                  />
                  <span className="text-gray-700">Non, je suis en recherche</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="hasMission"
                    value="searching"
                    checked={formData.hasMission === "searching"}
                    onChange={(e) => setFormData((prev: FreelanceFormData) => ({ ...prev, hasMission: e.target.value }))}
                    className="text-blue-600"
                  />
                  <span className="text-gray-700">En cours de recherche</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="hasMission"
                    value="yes"
                    checked={formData.hasMission === "yes"}
                    onChange={(e) => setFormData((prev: FreelanceFormData) => ({ ...prev, hasMission: e.target.value }))}
                    className="text-blue-600"
                  />
                  <span className="text-gray-700">Oui, j&apos;ai une mission en cours</span>
                </label>
              </div>
            </div>

            {formData.hasMission === "yes" && (
                <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
                <p className="text-sm text-gray-600 mb-3">
                  <em>Les informations client sont optionnelles mais peuvent aider à mieux vous accompagner.</em>
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                  <label htmlFor="client" className="text-sm font-medium text-gray-700">Nom du client</label>
                  <input
                  id='client'
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.clientName}
                    onChange={(e) => setFormData((prev: FreelanceFormData) => ({ ...prev, clientName: e.target.value }))}
                    placeholder="Nom de l'entreprise (optionnel)"
                  />
                  </div>
                  <div className="space-y-2">
                  <label htmlFor="address" className="text-sm font-medium text-gray-700">Adresse du client</label>
                  <input
                  id='address'
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.clientAddress}
                    onChange={(e) => setFormData((prev: FreelanceFormData) => ({ ...prev, clientAddress: e.target.value }))}
                    placeholder="Adresse complète (optionnel)"
                  />
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="field" className="text-sm font-medium text-gray-700">Secteur d&apos;activité</label>
                  <select
                    id='field'
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.clientSector}
                    onChange={(e) => setFormData((prev: FreelanceFormData) => ({ ...prev, clientSector: e.target.value }))}
                  >
                    <option value="">Sélectionnez le secteur (optionnel)</option>
                    {metiers.map((metier) => (
                      <option key={metier.id} value={metier.name}>
                        {metier.name}
                      </option>
                    ))}
                  </select>
                </div>
                </div>
            )}

            {/* TJM and Days - always shown */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="tjm" className="text-sm font-medium text-gray-700">TJM souhaité (€) *</label>
                <input
                id='tjm'
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.tjm}
                  onChange={(e) => setFormData((prev: FreelanceFormData) => ({ ...prev, tjm: e.target.value }))}
                  placeholder="500"
                  min="0"
                  step="10"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="day" className="text-sm font-medium text-gray-700">Nombre de jours par semaine *</label>
                <input
                id='day'
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.days}
                  onChange={(e) => setFormData((prev: FreelanceFormData) => ({ ...prev, days: e.target.value }))}
                  placeholder="5"
                  min="1"
                  max="7"
                  step="0.5"
                />
              </div>
            </div>

            {/* Portage Question */}
            <div className="space-y-3">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.wantsPortage === "yes"}
                  onChange={(e) => setFormData((prev: FreelanceFormData) => ({ ...prev, wantsPortage: e.target.checked ? "yes" : "no" }))}
                  className="text-blue-600"
                />
                <span className="text-sm font-medium text-gray-700">Je souhaite faire appel à une société de portage salarial</span>
              </label>
            </div>

            {/* Portages Selection - Only show if freelancer wants portage */}
            {formData.wantsPortage === "yes" && (
              <div className="space-y-3">
                <h1 className="text-sm font-medium text-gray-700">Services de portage souhaités *</h1>
                <div className="grid grid-cols-3 gap-3">
                  {portages.map((portage) => (
                    <label key={portage.id} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.selectedPortages.includes(portage.id.toString())}
                        onChange={() => handlePortageToggle(portage.id)}
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

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="font-medium mb-4">Sélectionnez les services qui vous intéressent</h3>
              
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-md text-blue-700 text-sm mb-4">
                <p><strong>Information :</strong> Si vous sélectionnez un service, vous devez obligatoirement remplir les données demandées (texte, choix, etc.)</p>
              </div>
              
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm mb-4">
                  {error}
                </div>
              )}

              {/* Services List - Scrollable */}
              <div className="space-y-4 max-h-60 overflow-y-auto">
                {platformServices.map((service) => {
                  const isSelected = formData.selectedServices.some((s: SelectedService) => s.serviceId === service.id)
                  const selectedService = formData.selectedServices.find((s: SelectedService) => s.serviceId === service.id)
                  const choices = parseChoices(service.choices)
                  
                  return (
                    <div key={service.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3 flex-1">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleServiceToggle(service.id)}
                              className="mt-1"
                              id={`service-${service.id}`}
                            />
                            <div className="flex-1">
                              <label htmlFor={`service-${service.id}`} className="font-medium cursor-pointer block">
                                {service.label}
                              </label>
                            </div>
                          </div>
                          
                          {/* Service Info Tooltip */}
                          <div onClick={(e) => e.stopPropagation()}>
                            <ServiceInfoTooltip service={service} />
                          </div>
                        </div>

                        {/* Required checkbox and data input for selected services */}
                        {isSelected && selectedService && (
                          <div className="mt-4 pl-4 border-l-2 border-blue-200" onClick={(e) => e.stopPropagation()}>
                            <label className="flex items-center space-x-2 mb-3">
                              <input
                                type="checkbox"
                                checked={selectedService?.isRequired || false}
                                onChange={(e) => handleServiceRequiredChange(service.id, e.target.checked)}
                                className="text-blue-600"
                              />
                              <span className="text-sm text-gray-700">Ce service est <strong>obligatoire</strong> pour moi</span>
                            </label>

                            {/* Data input for services that require data */}
                            {service.requires_data && (
                              <div className="space-y-3">
                                <div>
                                  <label className="text-sm font-medium text-gray-700 block">
                                    {service.data_label || 'Données requises'} <span className="text-red-500">*</span>
                                  </label>
                                  {service.data_description && (
                                    <p className="text-xs text-gray-500 mt-1">{service.data_description}</p>
                                  )}
                                </div>
                                
                                {/* TEXT input */}
                                {service.data_type === 'TEXT' && (
                                  <textarea
                                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 text-sm ${
                                      (!selectedService?.responseData || selectedService.responseData.trim() === '') 
                                        ? 'border-red-300 focus:ring-red-500' 
                                        : 'border-gray-300 focus:ring-blue-500'
                                    }`}
                                    value={selectedService?.responseData || ""}
                                    onChange={(e) => handleServiceDataChange(service.id, e.target.value)}
                                    placeholder="Saisissez votre réponse... (obligatoire)"
                                    rows={3}
                                    required
                                  />
                                )}
                                
                                {/* NUMBER input */}
                                {service.data_type === 'NUMBER' && (
                                  <input
                                    type="number"
                                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 text-sm ${
                                      (!selectedService?.responseData || selectedService.responseData.trim() === '') 
                                        ? 'border-red-300 focus:ring-red-500' 
                                        : 'border-gray-300 focus:ring-blue-500'
                                    }`}
                                    value={selectedService?.responseData || ""}
                                    onChange={(e) => handleServiceDataChange(service.id, e.target.value)}
                                    placeholder="Entrez un nombre... (obligatoire)"
                                    required
                                  />
                                )}
                                
                                {/* SELECT (multiple choice) */}
                                {service.data_type === 'SELECT' && choices.length > 0 && (
                                  <div className="space-y-2">
                                    <p className="text-xs text-gray-600">Sélectionnez une ou plusieurs options <span className="text-red-500">*</span> :</p>
                                    {choices.map((choice: string, index: number) => {
                                      const currentSelections = selectedService?.responseData ? 
                                        selectedService.responseData.split(',').filter((s: string) => s.trim() !== '') : []
                                      const isChecked = currentSelections.includes(choice)
                                      
                                      return (
                                        <label key={index} className="flex items-center space-x-2">
                                          <input
                                            type="checkbox"
                                            checked={isChecked}
                                            onChange={(e) => handleMultipleSelectChange(service.id, choice, e.target.checked)}
                                            className="text-blue-600"
                                          />
                                          <span className="text-sm text-gray-700">{choice}</span>
                                        </label>
                                      )
                                    })}
                                    {(!selectedService?.responseData || selectedService.responseData.trim() === '') && (
                                      <p className="text-xs text-red-500 mt-1">Veuillez sélectionner au moins une option.</p>
                                    )}
                                  </div>
                                )}
                                
                                {/* RADIO (single choice) */}
                                {service.data_type === 'RADIO' && choices.length > 0 && (
                                  <div className="space-y-2">
                                    <p className="text-xs text-gray-600">Sélectionnez une option <span className="text-red-500">*</span> :</p>
                                    {choices.map((choice: string, index: number) => (
                                      <label key={index} className="flex items-center space-x-2">
                                        <input
                                          type="radio"
                                          name={`service-${service.id}-radio`}
                                          value={choice}
                                          checked={selectedService?.responseData === choice}
                                          onChange={(e) => handleServiceDataChange(service.id, e.target.value)}
                                          className="text-blue-600"
                                        />
                                        <span className="text-sm text-gray-700">{choice}</span>
                                      </label>
                                    ))}
                                    {(!selectedService?.responseData || selectedService.responseData.trim() === '') && (
                                      <p className="text-xs text-red-500 mt-1">Veuillez sélectionner une option.</p>
                                    )}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-4">
              <div className="space-y-3">
                <label htmlFor="first" className="text-sm font-medium text-gray-700">Quelle est la priorité de votre demande ? *</label>
                <div id='first' className="space-y-3">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="priority"
                      value="urgent"
                      checked={formData.priority === "urgent"}
                      onChange={(e) => setFormData((prev: FreelanceFormData) => ({ ...prev, priority: e.target.value }))}
                      className="text-blue-600"
                    />
                    <span className="w-3 h-3 bg-red-500 rounded-full flex-shrink-0"></span>
                    <span className="text-gray-700">Urgent - J&apos;ai besoin d&apos;une réponse rapidement</span>
                  </label>
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="priority"
                      value="medium"
                      checked={formData.priority === "medium"}
                      onChange={(e) => setFormData((prev: FreelanceFormData) => ({ ...prev, priority: e.target.value }))}
                      className="text-blue-600"
                    />
                    <span className="w-3 h-3 bg-orange-500 rounded-full flex-shrink-0"></span>
                    <span className="text-gray-700">Moyen - Dans les prochaines semaines</span>
                  </label>
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="priority"
                      value="low"
                      checked={formData.priority === "low"}
                      onChange={(e) => setFormData((prev: FreelanceFormData) => ({ ...prev, priority: e.target.value }))}
                      className="text-blue-600"
                    />
                    <span className="w-3 h-3 bg-green-500 rounded-full flex-shrink-0"></span>
                    <span className="text-gray-700">Non prioritaire - Je me renseigne</span>
                  </label>
                </div>
              </div>
          </div>
        )

      case 5: {
         const summaryPages = [
          {
            title: "Informations personnelles",
            content: (
              <div className="border rounded-lg p-4 bg-gray-50">
                <h4 className="font-medium text-gray-900 mb-3">Informations personnelles</h4>
                <div className="space-y-2 text-sm">
                  <div><span className="font-medium">Nom:</span> {formData.lastName}</div>
                  <div><span className="font-medium">Prénom:</span> {formData.firstName}</div>
                  <div><span className="font-medium">Email:</span> {formData.email}</div>
                  <div><span className="font-medium">Téléphone:</span> {formData.phone}</div>
                  <div><span className="font-medium">Métier:</span> {metiers.find(m => m.id === formData.metierId)?.name}</div>
                </div>
              </div>
            )
          },
          {
            title: "Détails de la mission",
            content: (
              <div className="border rounded-lg p-4 bg-gray-50">
                <h4 className="font-medium text-gray-900 mb-3">Détails de la mission</h4>
                <div className="space-y-2 text-sm">
                  <div><span className="font-medium">Situation actuelle:</span> {
                    formData.hasMission === "yes" ? "J'ai une mission en cours" :
                    formData.hasMission === "searching" ? "En cours de recherche" :
                    formData.hasMission === "no" ? "Je suis en recherche" : formData.hasMission
                  }</div>
                  <div><span className="font-medium">TJM souhaité:</span> {formData.tjm}€</div>
                  <div><span className="font-medium">Nombre de jours par semaine:</span> {formData.days}</div>
                  {formData.clientName && <div><span className="font-medium">Nom du client:</span> {formData.clientName}</div>}
                  {formData.clientAddress && <div><span className="font-medium">Adresse du client:</span> {formData.clientAddress}</div>}
                  {formData.clientSector && <div><span className="font-medium">Secteur d&apos;activité:</span> {
                    formData.clientSector === "tech" ? "Technologie" :
                    formData.clientSector === "finance" ? "Finance" :
                    formData.clientSector === "retail" ? "Commerce" :
                    formData.clientSector === "healthcare" ? "Santé" :
                    formData.clientSector === "education" ? "Éducation" :
                    formData.clientSector === "other" ? "Autre" : formData.clientSector
                  }</div>}
                </div>
              </div>
            )
          },
          {
            title: "Portage salarial",
            content: (
              <div className="border rounded-lg p-4 bg-gray-50">
                <h4 className="font-medium text-gray-900 mb-3">Portage salarial</h4>
                <div className="space-y-2 text-sm">
                  <div><span className="font-medium">Intéressé par le portage:</span> {formData.wantsPortage === "yes" ? "Oui" : "Non"}</div>
                  {formData.wantsPortage === "yes" && formData.selectedPortages.length > 0 && (
                    <div>
                      <span className="font-medium">Services de portage sélectionnés:</span>
                      <ul className="list-disc list-inside ml-4 mt-1">
                        {formData.selectedPortages.map((portageId: string) => {
                          const portage = portages.find(p => p.id === parseInt(portageId));
                          return (
                            <li key={portageId}>
                              {portage?.name} - {portage?.description}
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )
          },
          {
            title: "Services sélectionnés",
            content: (
              <div className="space-y-4">
                {/* Services */}
                {formData.selectedServices && formData.selectedServices.length > 0 && (
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <h4 className="font-medium text-gray-900 mb-3">Services sélectionnés</h4>
                    <div className="text-sm">
                      <ul className="list-disc overflow-auto max-h-40 list-inside space-y-1">
                        {formData.selectedServices.map((selectedService: SelectedService) => {
                          const service = platformServices.find(s => s.id === selectedService.serviceId);
                          return (
                            <li key={selectedService.serviceId}>
                              {service?.label}
                              {selectedService.isRequired && <span className=" text-red-600 font-medium"> (Obligatoire)</span>}
                              {selectedService.responseData && (
                                <div className="ml-4 text-gray-600 text-xs mt-1">
                                  Données: {selectedService.responseData}
                                </div>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </div>
                )}

                {/* New Services */}
                {formData.newServices && formData.newServices.length > 0 && (
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <h4 className="font-medium text-gray-900 mb-3">Services personnalisés demandés</h4>
                    <div className="text-sm">
                      <ul className="list-disc list-inside space-y-1">
                        {formData.newServices.map((service: string, index: number) => (
                          <li key={index}>{service}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* No services selected message */}
                {(!formData.selectedServices || formData.selectedServices.length === 0) && 
                 (!formData.newServices || formData.newServices.length === 0) && (
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <h4 className="font-medium text-gray-900 mb-3">Services sélectionnés</h4>
                    <p className="text-sm text-gray-600">Aucun service sélectionné</p>
                  </div>
                )}
              </div>
            )
          },
          {
            title: "Priorité de la demande",
            content: (
              <div className="border rounded-lg p-4 bg-gray-50">
                <h4 className="font-medium text-gray-900 mb-3">Priorité de la demande</h4>
                <div className="text-sm">
                  <div className="flex items-center space-x-3">
                    <span className={`w-4 h-4 rounded-full flex-shrink-0 ${
                      formData.priority === "urgent" ? "bg-red-500" :
                      formData.priority === "medium" ? "bg-orange-500" : "bg-green-500"
                    }`}></span>
                    <span className="font-medium">
                      {formData.priority === "urgent" ? "Urgent - J'ai besoin d'une réponse rapidement" :
                       formData.priority === "medium" ? "Moyen - Dans les prochaines semaines" :
                       "Non prioritaire - Je me renseigne"}
                    </span>
                  </div>
                  <div className="mt-3 p-3 bg-white rounded border">
                    <p className="text-xs text-gray-600">
                      {formData.priority === "urgent" ? "Votre demande sera traitée en priorité par nos équipes et nos partenaires." :
                       formData.priority === "medium" ? "Votre demande sera traitée dans un délai standard de quelques semaines." :
                       "Votre demande sera traitée sans urgence particulière. Idéal pour une phase de découverte."}
                    </p>
                  </div>
                </div>
              </div>
            )
          }
        ]

        const currentSummaryPage = summaryPages[summaryPage]

        return (
          <div className="space-y-6">

            <div className="text-center mb-4">
              <h4 className="text-md font-medium text-gray-800">
                {currentSummaryPage.title} ({summaryPage + 1}/5)
              </h4>
            </div>

            {currentSummaryPage.content}

            {/* Summary Pagination Controls */}
            <div className="flex justify-between items-center mt-6">
              <button
                type="button"
                onClick={() => setSummaryPage(prev => Math.max(0, prev - 1))}
                disabled={summaryPage === 0}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Section précédente
              </button>
              
              <span className="text-sm text-gray-500">
                Section {summaryPage + 1} sur {summaryPages.length}
              </span>
              
              <button
                type="button"
                onClick={() => setSummaryPage(prev => Math.min(summaryPages.length - 1, prev + 1))}
                disabled={summaryPage >= summaryPages.length - 1}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Section suivante
              </button>
            </div>
          </div>
        );
      }
       
      case 6:
        return (
          <SuccessStep 
            email={formData.email} 
            title="Merci pour votre demande !"
            message="Vous avez reçu un email pour confirmer votre email et créer votre mot de passe."
            steps={[
              "Ajouter un mot de passe",
              "L'administration acceptera votre demande",
              "Vous pourrez accéder à des réponses des entreprises"
            ]}
          />
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
        return "Récapitulatif"
      case 6:
        return "Demande envoyée"
      default:
        return ""
    }
  }

  const getStepDescription = () => {
    switch (currentStep) {
      case 1:
        return "Renseignez vos informations de base"
      case 2:
        return "Parlez-nous de votre situation actuelle"
      case 3:
        return "Choisissez les services qui vous intéressent (données obligatoires si sélectionnés)"
      case 4:
        return "Définissez l'urgence de votre demande"
      case 5:
        return "Vérifiez vos informations avant l'envoi"
      case 6:
        return "Votre demande a été transmise"
      default:
        return ""
    }
  }

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.firstName && 
               formData.lastName && 
               formData.email && 
               formData.phone && 
               formData.metierId > 0 &&
               isValidEmail(formData.email)
      case 2: {
        const basicValid = (
          formData.hasMission &&
          formData.tjm &&
          parseFloat(formData.tjm) >= 1 &&
          formData.days &&
          parseFloat(formData.days) >= 0.5
        );
        // If wants portage, must select at least one portage service
        if (formData.wantsPortage === "yes") {
          return basicValid && formData.selectedPortages.length > 0;
        }
        return basicValid;
      }
      case 3: {
        // Services step validation
        // If no services are selected, step is valid (services are optional)
        if (formData.selectedServices.length === 0) {
          return true;
        }
        
        // If services are selected, validate that required data is provided
        for (const selectedService of formData.selectedServices) {
          const service = platformServices.find(s => s.id === selectedService.serviceId);
          if (service?.requires_data) {
            // For services that require data, check if responseData is provided
            if (!selectedService.responseData || selectedService.responseData.trim() === '') {
              return false; // Data is required but not provided
            }
          }
        }
        return true;
      }
      case 4:
        return formData.priority
      case 5:
        return true // Recap step is always valid and ready for submission
      case 6:
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
      showNavigation={currentStep < 6}
      completeButtonText="Envoyer ma demande"
      nextButtonText="Suivant"
      completionStep={5} // Specify that completion happens on step 5
      onClearProgress={() => {
        clearLocalStorage()
        setCurrentStep(1)
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          metierId: 0,
          hasMission: "",
          clientName: "",
          clientAddress: "",
          clientSector: "",
          tjm: "",
          days: "",
          wantsPortage: "no",
          selectedPortages: [],
          selectedServices: [],
          newServices: [],
          priority: "",
        })
        setSummaryPage(0)
      }}
    >
      {renderStep()}
    </ModalWrapper>
  );
};

export default FreelanceModal;