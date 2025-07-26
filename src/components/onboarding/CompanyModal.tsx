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
  CompanySummaryStep,
  useCompanyForm,
  useStepNavigation,
  useCompanyCompletion,
  useCompanyValidation,
} from './company';
import { ModalWrapper } from './ModalWrapper';
import { SuccessStep } from './SuccessStep';

interface CompanyModalProps extends BaseModalProps {}

const CompanyModal = ({ onClose }: CompanyModalProps) => {
  const { platformServices, metiers, portages, error: dataError } = useModalData();
  const [siretExists, setSiretExists] = useState(false);
  const [isAddServiceModalOpen, setIsAddServiceModalOpen] = useState(false);
  const [isAdminStepValid, setIsAdminStepValid] = useState(false);

  // Use custom hooks
  const { formData, updateFormData, clearFormData } = useCompanyForm();
  const { currentStep, goToNextStep, goToPreviousStep, clearStepProgress } = useStepNavigation(
    7,
    clearFormData
  );
  const { isLoading, error, setError, handleComplete } = useCompanyCompletion(
    formData,
    clearFormData,
    goToNextStep,
    clearStepProgress
  );
  const { isStepValid } = useCompanyValidation(
    formData,
    currentStep,
    siretExists,
    isAdminStepValid
  );

  // Set data error if there's a fetching error
  useEffect(() => {
    if (dataError) {
      setError(dataError);
    }
  }, [dataError, setError]);

  const totalSteps = 7;

  const handleNext = () => {
    if (currentStep === 6) {
      handleComplete(currentStep);
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

  const handleCompleteWrapper = () => {
    handleComplete(currentStep);
  };

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
        return <CompanyConsultantsStep formData={formData} onFormDataChange={updateFormData} />;

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
        return 'Informations générales';
      case 2:
        return 'Consultants et frais de gestion';
      case 3:
        return 'Métiers supportés';
      case 4:
        return "Informations de l'administrateur";
      case 5:
        return 'Services et options';
      case 6:
        return 'Récapitulatif';
      case 7:
        return 'Demande envoyée';
      default:
        return '';
    }
  };

  const getStepDescription = () => {
    switch (currentStep) {
      case 1:
        return 'Présentez votre société de portage salarial';
      case 2:
        return 'Informations sur vos consultants et tarifs';
      case 3:
        return 'Sélectionnez les métiers que vous supportez';
      case 4:
        return "Coordonnées de l'administrateur du compte";
      case 5:
        return 'Définissez les services que vous proposez';
      case 6:
        return 'Vérifiez vos informations avant finalisation';
      case 7:
        return 'Votre demande a été transmise';
      default:
        return '';
    }
  };

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
        onComplete={handleCompleteWrapper}
        isStepValid={isStepValid()}
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
