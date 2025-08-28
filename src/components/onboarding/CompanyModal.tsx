'use client';

import { useState, useEffect } from 'react';

import { useModalData } from '@/hooks/useModalData';
import { NewServiceData } from '@/types/platform';
import type { BaseModalProps } from '@/types/user';

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
  CompanyPortageStep,
} from './company';
import { ModalWrapper } from './ModalWrapper';
import { SuccessStep } from './SuccessStep';

interface CompanyModalProps extends BaseModalProps {}

const CompanyModal = ({ onClose }: CompanyModalProps) => {
  const { platformServices, metiers, portages, error: dataError } = useModalData();
  const [siretExists, setSiretExists] = useState(false);
  const [isAddServiceModalOpen, setIsAddServiceModalOpen] = useState(false);
  const [isAdminStepValid, setIsAdminStepValid] = useState(false);
  
  // New state for editing services
  const [editingService, setEditingService] = useState<NewServiceData | undefined>(undefined);
  const [editingIndex, setEditingIndex] = useState<number | undefined>(undefined);

  // Use custom hooks
  const { formData, updateFormData, clearFormData } = useCompanyForm();
  const { currentStep, goToNextStep, goToPreviousStep, clearStepProgress } = useStepNavigation(
    8,
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

  const totalSteps = 8;

  const handleNext = () => {
    if (currentStep === 7) {
      handleComplete(currentStep);
    } else {
      goToNextStep();
    }
  };

  const handlePrevious = () => {
    goToPreviousStep();
  };

  const addNewService = () => {
    setEditingService(undefined);
    setEditingIndex(undefined);
    setIsAddServiceModalOpen(true);
  };

  const editNewService = (service: NewServiceData, index: number) => {
    setEditingService(service);
    setEditingIndex(index);
    setIsAddServiceModalOpen(true);
  };

  const handleSaveService = (service: NewServiceData, editIndex?: number) => {
    if (editIndex !== undefined) {
      // Update existing service
      const updatedServices = [...formData.newServices];
      updatedServices[editIndex] = service;
      updateFormData({ newServices: updatedServices });
    } else {
      // Add new service
      updateFormData({ newServices: [...formData.newServices, service] });
    }
    handleCloseServiceModal();
  };

  const handleCloseServiceModal = () => {
    setIsAddServiceModalOpen(false);
    setEditingService(undefined);
    setEditingIndex(undefined);
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
        return (
          <CompanyPortageStep
            formData={formData}
            onFormDataChange={updateFormData}
            portages={portages}
          />
        );
      case 3:
        return <CompanyConsultantsStep formData={formData} onFormDataChange={updateFormData} />;
      case 4:
        return (
          <CompanyMetiersStep
            formData={formData}
            onFormDataChange={updateFormData}
            metiers={metiers}
          />
        );
      case 5:
        return (
          <CompanyAdminStep
            formData={formData}
            onFormDataChange={updateFormData}
            onValidityChange={setIsAdminStepValid}
          />
        );
      case 6:
        return (
          <CompanyServicesStep
            formData={formData}
            onFormDataChange={updateFormData}
            platformServices={platformServices}
            onAddNewService={addNewService}
            onEditNewService={editNewService}
          />
        );
      case 7:
        return (
          <CompanySummaryStep
            formData={formData}
            metiers={metiers}
            portages={portages}
            platformServices={platformServices}
          />
        );
      case 8:
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
        return 'Portage salarial';
      case 3:
        return 'Consultants et frais de gestion';
      case 4:
        return 'Métiers supportés';
      case 5:
        return "Informations de l'administrateur";
      case 6:
        return 'Services et options';
      case 7:
        return 'Récapitulatif';
      case 8:
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
        return 'Sélectionnez votre société de portage';
      case 3:
        return 'Informations sur vos consultants et tarifs';
      case 4:
        return 'Sélectionnez les métiers que vous supportez';
      case 5:
        return "Coordonnées de l'administrateur du compte";
      case 6:
        return 'Définissez les services que vous proposez';
      case 7:
        return 'Vérifiez vos informations avant finalisation';
      case 8:
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
        completionStep={7} // Specify that completion happens on step 7
        onClearProgress={() => {
          clearFormData();
          clearStepProgress();
        }}
      >
        {renderStep()}
      </ModalWrapper>

      <AddServiceModal
        isOpen={isAddServiceModalOpen}
        onClose={handleCloseServiceModal}
        onSave={handleSaveService}
        editingService={editingService}
        editingIndex={editingIndex}
      />
    </>
  );
};

export default CompanyModal;