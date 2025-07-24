'use client';

import { useEffect } from 'react';
import { useModalData } from '../../hooks/useModalData';
import ServiceInfoTooltip from '../ServiceInfoTooltip';
import { SelectedService, BaseModalProps } from '../../types/user';

import { ModalWrapper } from './ModalWrapper';
import { SuccessStep } from './SuccessStep';
import {
  FreelancePersonalInfoStep,
  FreelanceMissionStep,
  FreelancePriorityStep,
  FreelanceSummaryStep,
  useFreelanceForm,
  useFreelanceNavigation,
  useFreelanceValidation,
  useFreelanceHandlers,
  useFreelanceCompletion,
} from './freelance';

interface FreelanceModalProps extends BaseModalProps {}

const FreelanceModal = ({ onClose }: FreelanceModalProps) => {
  const { platformServices, metiers, portages, error: dataError } = useModalData();

  // Use custom hooks
  const { formData, setFormData, clearLocalStorage } = useFreelanceForm();
  const { currentStep, missionStep, setMissionStep, handleNext, handlePrevious, clearStepProgress } = useFreelanceNavigation(6);
  const { isStepValid } = useFreelanceValidation(formData, currentStep, missionStep, platformServices);
  const { 
    handleServiceToggle, 
    handleServiceRequiredChange, 
    handleServiceDataChange, 
    handlePortageToggle, 
    parseChoices, 
    handleMultipleSelectChange 
  } = useFreelanceHandlers(setFormData);
  const { isLoading, error, setError, handleComplete } = useFreelanceCompletion(
    formData, 
    clearLocalStorage, 
    () => { /* Handle completion navigation in the hook itself */ }
  );

  const totalSteps = 6;

  // Set data error if there's a fetching error
  useEffect(() => {
    if (dataError) {
      setError(dataError);
    }
  }, [dataError, setError]);

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <FreelancePersonalInfoStep
            formData={formData}
            setFormData={setFormData}
            metiers={metiers}
          />
        )

      case 2:
        return (
          <FreelanceMissionStep
            formData={formData}
            setFormData={setFormData}
            missionStep={missionStep}
            setMissionStep={setMissionStep}
            metiers={metiers}
            portages={portages}
            handlePortageToggle={handlePortageToggle}
          />
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
          <FreelancePriorityStep
            formData={formData}
            setFormData={setFormData}
          />
        )

      case 5:
        return (
          <FreelanceSummaryStep
            formData={formData}
            setFormData={setFormData}
            metiers={metiers}
            platformServices={platformServices}
            portages={portages}
          />
        )
       
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
        clearLocalStorage();
        clearStepProgress();
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
        });
      }}
    >
      {renderStep()}
    </ModalWrapper>
  );
};

export default FreelanceModal;