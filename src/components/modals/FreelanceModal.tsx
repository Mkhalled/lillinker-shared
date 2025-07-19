'use client';

import { ChevronLeft, ChevronRight, CheckCircle, X, Building2, ChevronDown, ChevronUp } from 'lucide-react';
import { useState, useEffect } from 'react';

import ServiceInfoTooltip from '../ServiceInfoTooltip';
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
  status: string
}

interface FreelanceModalProps {
  onClose: () => void
}

const FreelanceModal = ({ onClose }: FreelanceModalProps) => {
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [platformServices, setPlatformServices] = useState<PlatformService[]>([])
  const [emailExists, setEmailExists] = useState(false)
  const [checkingEmail, setCheckingEmail] = useState(false)
  const [showPlatformServices, setShowPlatformServices] = useState(false)
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
    tjm: "",
    days: "",

    // Step 3: Services
    selectedServices: [] as {
      serviceId: number;
      isRequired: boolean;
      responseData?: string;
    }[],

    // Step 4: Priority
    priority: "",
  })

  const totalSteps = 5

  // Email validation function
  const isValidBusinessEmail = (email: string): boolean => {
    // Basic email format check
    const basicEmailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    if (!basicEmailRegex.test(email)) {
      return false
    }
    
    // Check for excluded domains (Gmail, Yahoo)
    const domain = email.split('@')[1]?.toLowerCase()
    const excludedDomains = ['gmail.com', 'yahoo.com', 'yahoo.fr']
    
    return !excludedDomains.includes(domain)
  }

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
        console.error('Error fetching platform services:', error)
        setError('Erreur lors du chargement des services')
      }
    }

    fetchPlatformServices()
  }, [])

    // Check if email exists when email changes
  useEffect(() => {
    const checkEmailExists = async () => {
      if (!formData.email || formData.email.length < 3) {
        setEmailExists(false)
        return
      }

      // Only check if email format is valid
      if (!isValidBusinessEmail(formData.email)) {
        setEmailExists(false)
        return
      }

      setCheckingEmail(true)
      try {
        const response = await fetch('/api/check-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email: formData.email }),
        })

        if (response.ok) {
          const data = await response.json()
          setEmailExists(data.exists)
        }
      } catch (error) {
        console.error('Error checking email:', error)
      } finally {
        setCheckingEmail(false)
      }
    }

    // Debounce the email check
    const timeoutId = setTimeout(checkEmailExists, 500)
    return () => clearTimeout(timeoutId)
  }, [formData.email])

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
    setFormData((prev) => {
      const existingServiceIndex = prev.selectedServices.findIndex(s => s.serviceId === serviceId)
      
      if (existingServiceIndex >= 0) {
        // Remove service
        return {
          ...prev,
          selectedServices: prev.selectedServices.filter(s => s.serviceId !== serviceId)
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
    setFormData((prev) => ({
      ...prev,
      selectedServices: prev.selectedServices.map(s => 
        s.serviceId === serviceId ? { ...s, isRequired } : s
      )
    }))
  }

  const handleServiceDataChange = (serviceId: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedServices: prev.selectedServices.map(s => 
        s.serviceId === serviceId ? { ...s, responseData: value } : s
      )
    }))
  }

  // Helper function to parse choices from service.choices
  const parseChoices = (choices: any) => {
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
    setFormData((prev) => {
      const service = prev.selectedServices.find(s => s.serviceId === serviceId)
      if (!service) return prev
      
      let currentSelections = service.responseData ? service.responseData.split(',').filter(s => s.trim() !== '') : []
      
      if (isChecked) {
        if (!currentSelections.includes(option)) {
          currentSelections.push(option)
        }
      } else {
        currentSelections = currentSelections.filter(s => s !== option)
      }
      
      return {
        ...prev,
        selectedServices: prev.selectedServices.map(s => 
          s.serviceId === serviceId ? { ...s, responseData: currentSelections.join(',') } : s
        )
      }
    })
  }

  const handleComplete = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Step 1: Initial registration (create user) - same as CompanyModal
      const signupResponse = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          role: "FREELANCE",
          phone_number: formData.phone,
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
        metier: formData.profession,
        mission_status: formData.hasMission === 'yes' ? 'OPEN' : 'CLOSED',
        priority: formData.priority === 'urgent' ? 'HIGH' : 
                 formData.priority === 'medium' ? 'MEDIUM' : 'LOW',
        tjm: parseFloat(formData.tjm) || 0,
        days: parseFloat(formData.days) || 0,
        selected_services: formData.selectedServices,
        // Only include client fields if they have values
        ...(formData.clientName && { client_name: formData.clientName }),
        ...(formData.clientAddress && { client_address: formData.clientAddress }),
        ...(formData.clientSector && { client_sector: formData.clientSector }),
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

      // Show success step
      setCurrentStep(5)
    } catch (error) {
      console.error('Registration error:', error)
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
                  onChange={(e) => setFormData((prev) => ({ ...prev, firstName: e.target.value }))}
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
                  onChange={(e) => setFormData((prev) => ({ ...prev, lastName: e.target.value }))}
                  placeholder="Dupont"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-gray-700">Email de l&apos;administrateur *</label>
              <div className="relative">
                <input
                id='email'
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                  emailExists 
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
                type="email"
                value={formData.email}
                onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                placeholder="marie.martin@societe.com"
                required
                />
                {checkingEmail && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                  </div>
                )}
              </div>
              
              {/* Email validation errors */}
              {formData.email && !isValidBusinessEmail(formData.email) && (
                <p className="text-xs text-red-600">Veuillez utiliser une adresse email professionnelle (Gmail et Yahoo non acceptés)</p>
              )}
              
              {/* Email exists error */}
              {emailExists && formData.email && (
                <p className="text-xs text-red-600">Cette adresse email est déjà utilisée</p>
              )}
            </div>
            <div className="space-y-2">
              <label htmlFor="phone" className="text-sm font-medium text-gray-700">Téléphone *</label>
              <input
              id='phone'
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.phone}
                onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                placeholder="06 12 34 56 78"
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="metier" className="text-sm font-medium text-gray-700">Métier *</label>
              <select
              id='metier'
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
              <label htmlFor="mission" className="text-sm font-medium text-gray-700">Avez-vous une mission actuellement ? *</label>
              <div id='mission' className="space-y-2">
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
                  <span>Oui, j&apos;ai une mission en cours</span>
                </label>
              </div>
            </div>

            {formData.hasMission === "yes" && (
              <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
                <p className="text-sm text-gray-600 mb-3">
                  <em>Les informations client sont optionnelles mais peuvent aider à mieux vous accompagner.</em>
                </p>
                <div className="space-y-2">
                  <label htmlFor="client" className="text-sm font-medium text-gray-700">Nom du client</label>
                  <input
                  id='client'
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.clientName}
                    onChange={(e) => setFormData((prev) => ({ ...prev, clientName: e.target.value }))}
                    placeholder="Nom de l'entreprise (optionnel)"
                  />
                </div>
                <div className="space-y-2">
                  <label  htmlFor="address" className="text-sm font-medium text-gray-700">Adresse du client</label>
                  <input
                  id='address'
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.clientAddress}
                    onChange={(e) => setFormData((prev) => ({ ...prev, clientAddress: e.target.value }))}
                    placeholder="Adresse complète (optionnel)"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="field" className="text-sm font-medium text-gray-700">Secteur d&apos;activité</label>
                  <select
                  id='field'
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.clientSector}
                    onChange={(e) => setFormData((prev) => ({ ...prev, clientSector: e.target.value }))}
                  >
                    <option value="">Sélectionnez le secteur (optionnel)</option>
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

            {/* TJM and Days - always shown */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="tjm" className="text-sm font-medium text-gray-700">TJM souhaité (€) *</label>
                <input
                id='tjm'
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.tjm}
                  onChange={(e) => setFormData((prev) => ({ ...prev, tjm: e.target.value }))}
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
                  onChange={(e) => setFormData((prev) => ({ ...prev, days: e.target.value }))}
                  placeholder="5"
                  min="1"
                  max="7"
                  step="0.5"
                />
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="font-medium mb-4">Sélectionnez les services qui vous intéressent :</h3>
              
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm mb-4">
                  {error}
                </div>
              )}

              {/* Platform Services Section */}
              <div className="space-y-4">
                <div 
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => setShowPlatformServices(!showPlatformServices)}
                >
                  <div className="flex items-center space-x-2">
                    <Building2 className="h-5 w-5 text-gray-600" />
                    <span className="font-medium text-gray-900">Services disponibles sur la plateforme</span>
                    <span className="text-sm text-gray-500">({platformServices.length} services)</span>
                  </div>
                  {showPlatformServices ? (
                    <ChevronUp className="h-5 w-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  )}
                </div>

                {showPlatformServices && (
                  <>
                    {platformServices.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <Building2 className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                        <p>Aucun service disponible pour le moment</p>
                      </div>
                    ) : (
                      <div className="max-h-96 overflow-y-auto space-y-3">
                        {platformServices.map((service) => {
                          const selectedService = formData.selectedServices.find(s => s.serviceId === service.id)
                          const isSelected = !!selectedService
                          const choices = parseChoices(service.choices)
                          
                          return (
                            <div key={service.id} className="border rounded-lg p-4 bg-white">
                              <div className="flex items-start justify-between">
                                <div className="flex items-start space-x-3 flex-1">
                                  <input
                                    type="checkbox"
                                    id={`service-${service.id}`}
                                    checked={isSelected}
                                    onChange={() => handleServiceToggle(service.id)}
                                    className="mt-1"
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
                              {isSelected && (
                                <div className="mt-4 pl-4 border-l-2 border-blue-200">
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
                                          {service.data_label || 'Données requises'}
                                        </label>
                                        {service.data_description && (
                                          <p className="text-xs text-gray-500 mt-1">{service.data_description}</p>
                                        )}
                                      </div>
                                      
                                      {/* TEXT input */}
                                      {service.data_type === 'TEXT' && (
                                        <textarea
                                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                          value={selectedService?.responseData || ""}
                                          onChange={(e) => handleServiceDataChange(service.id, e.target.value)}
                                          placeholder="Saisissez votre réponse..."
                                          rows={3}
                                        />
                                      )}
                                      
                                      {/* NUMBER input */}
                                      {service.data_type === 'NUMBER' && (
                                        <input
                                          type="number"
                                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                          value={selectedService?.responseData || ""}
                                          onChange={(e) => handleServiceDataChange(service.id, e.target.value)}
                                          placeholder="Entrez un nombre..."
                                        />
                                      )}
                                      
                                      {/* SELECT (multiple choice) */}
                                      {service.data_type === 'SELECT' && choices.length > 0 && (
                                        <div className="space-y-2">
                                          <p className="text-xs text-gray-600">Sélectionnez une ou plusieurs options :</p>
                                          {choices.map((choice: string, index: number) => {
                                            const currentSelections = selectedService?.responseData ? 
                                              selectedService.responseData.split(',').filter(s => s.trim() !== '') : []
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
                                        </div>
                                      )}
                                      
                                      {/* RADIO (single choice) */}
                                      {service.data_type === 'RADIO' && choices.length > 0 && (
                                        <div className="space-y-2">
                                          <p className="text-xs text-gray-600">Sélectionnez une option :</p>
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
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-4">
            <div className="space-y-3">
              <label htmlFor="first" className="text-sm font-medium text-gray-700">Quelle est la priorité de votre demande ? *</label>
              <div id='first' className="space-y-2">
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
                  <span>Urgent - J&apos;ai besoin d&apos;une réponse rapidement</span>
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
              Vous avez reçu un email pour confirmer votre email et créer votre mot de passe.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
              <h4 className="font-medium text-blue-900 mb-2">Prochaines étapes :</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Ajouter un mot de passe</li>
                <li>• L&apos;administration acceptera votre demande</li>
                <li>• Vous pourrez accéder à des réponses des entreprises</li>
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
        return formData.firstName && 
               formData.lastName && 
               formData.email && 
               formData.phone && 
               formData.profession &&
               !emailExists &&
               isValidBusinessEmail(formData.email)
      case 2:
        return (
          formData.hasMission &&
          formData.tjm &&
          formData.days
          // Client information is completely optional, no validation needed
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
                  <span>{isLoading ? 'Envoi en cours...' : 'Envoyer ma demande'}</span>
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
  );
};

export default FreelanceModal;