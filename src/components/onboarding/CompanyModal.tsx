'use client';

import { useState, useEffect } from 'react';

import { useModalData } from '@/hooks/useModalData';
import type { NewService, BaseModalProps } from '@/types/user';

import AddServiceModal from './AddServiceModal';
import { 
  CompanyGeneralInfoStep,
  CompanyConsultantsStep, 
  CompanyMetiersStep,
  CompanyAdminStep,
  CompanyServicesStep,
  CompanySummaryStep
} from './company';
import { useCompanyForm } from './company/useCompanyForm';
import { useStepNavigation } from './company/useStepNavigation';
import { ModalWrapper } from './ModalWrapper';
import { SuccessStep } from './SuccessStep';

interface CompanyModalProps extends BaseModalProps {}

const CompanyModal = ({ onClose }: CompanyModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { platformServices, metiers, portages, error: dataError } = useModalData();
  const [siretExists, setSiretExists] = useState(false);
  const [isAddServiceModalOpen, setIsAddServiceModalOpen] = useState(false);
  const [isAdminStepValid, setIsAdminStepValid] = useState(false);

  // Use custom hooks
  const { formData, updateFormData, clearFormData } = useCompanyForm();
  const { currentStep, goToNextStep, goToPreviousStep, clearStepProgress } = useStepNavigation(7);

  // Set data error if there's a fetching error
  useEffect(() => {
    if (dataError) {
      setError(dataError);
    }
  }, [dataError]);

  const totalSteps = 7;

  const handleNext = () => {
    if (currentStep === 6) {
      handleComplete();
    } else {
      goToNextStep();
    }
  };

  const handlePrevious = () => {
    goToPreviousStep();
  };

  const addNewService = () => {
    setIsAddServiceModalOpen(true);
  };

  const handleAddService = (newService: NewService) => {
    updateFormData({ newServices: [...formData.newServices, newService] });
  };

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
        clearFormData();
        clearStepProgress();
        
        // Move to success step
        goToNextStep();
      } catch (error) {
        console.error('Registration error:', error)
        const errorMessage = error instanceof Error ? error.message : 'Une erreur est survenue'
        
        // Provide more specific error messages for common cases
        if (errorMessage.includes('SIRET') && errorMessage.includes('existe déjà')) {
          setError('Ce numéro SIRET est déjà utilisé par une autre société. Veuillez vérifier votre numéro SIRET.')
        } else if (errorMessage.includes('Unique constraint') && errorMessage.includes('siret')) {
          setError('Ce numéro SIRET est déjà utilisé. Veuillez vérifier votre numéro SIRET.')
        } else {
          setError(errorMessage)
        }
      } finally {
        setIsLoading(false)
      }
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <CompanyGeneralInfoStep
            formData={formData}
            onFormDataChange={updateFormData}
            onSiretExistsChange={setSiretExists}
            portages={portages}
          />
        );

      case 2:
        return (
          <CompanyConsultantsStep
            formData={formData}
            onFormDataChange={updateFormData}
          />
        );

      case 3:
        return (
          <CompanyMetiersStep
            formData={formData}
            onFormDataChange={updateFormData}
            metiers={metiers}
          />
        );

      case 4:
        return (
          <CompanyAdminStep
            formData={formData}
            onFormDataChange={updateFormData}
            onValidityChange={setIsAdminStepValid}
          />
        );

      case 5:
        return (
          <CompanyServicesStep
            formData={formData}
            onFormDataChange={updateFormData}
            platformServices={platformServices}
            onAddNewService={addNewService}
          />
        );

      case 6:
        return (
          <CompanySummaryStep
            formData={formData}
            metiers={metiers}
            portages={portages}
            platformServices={platformServices}
          />
        );

      case 7:
        return <SuccessStep email={formData.adminEmail} />;

      default:
        return null;
    }
  };

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
                          formData.description &&
                          !siretExists;
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
        return isAdminStepValid
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
       showNavigation={true}
        completeButtonText="Finaliser l'inscription"
        nextButtonText="Suivant"
        completionStep={6} // Specify that completion happens on step 6
        onClearProgress={() => {
          clearFormData();
          clearStepProgress();
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