'use client';

import { useEffect } from 'react';

import { useModalData } from '../../hooks/useModalData';
import type {
  FreelanceFormData,
  FreelanceRequest,
  FreelanceRequestData,
} from '../../types/freelance';
import { BaseModalProps } from '../../types/user';

import {
  FreelancePersonalInfoStep,
  FreelanceMissionStatusStep,
  FreelancePortageStep,
  FreelanceTjmStep,
  FreelancePriorityStep,
  FreelanceSummaryStep,
  FreelanceServicesStep,
  useFreelanceForm,
  useFreelanceNavigation,
  useFreelanceValidation,
  useFreelanceHandlers,
  useFreelanceCompletion,
} from './freelance';
import { ModalWrapper } from './ModalWrapper';
import { SuccessStep } from './SuccessStep';

interface FreelanceModalProps extends BaseModalProps {}

const FreelanceModal = ({ onClose }: FreelanceModalProps) => {
  const { platformServices, metiers, portages, error: dataError } = useModalData();

  // Use custom hooks
  const { formData, setFormData, clearFormData } = useFreelanceForm();
  const { currentStep, handleNext, handlePrevious, goToNextStep, clearStepProgress } =
    useFreelanceNavigation(8, clearFormData);
  const { isStepValid } = useFreelanceValidation(formData, currentStep, platformServices);

  // Create wrapper functions to match the expected interfaces
  const setFormDataWrapper = (
    updater: (prev: FreelanceFormData | FreelanceRequest) => FreelanceFormData | FreelanceRequest
  ) => {
    setFormData(prev => updater(prev) as FreelanceFormData);
  };

  const setFormDataSummaryWrapper = (
    updater: (
      prev: FreelanceFormData | FreelanceRequestData
    ) => FreelanceFormData | FreelanceRequestData
  ) => {
    setFormData(prev => updater(prev) as FreelanceFormData);
  };

  const {
    handleServiceToggle,
    handleServiceRequiredChange,
    handleServiceDataChange,
    handlePortageToggle,
    parseChoices,
    handleMultipleSelectChange,
  } = useFreelanceHandlers(setFormDataWrapper);
  const { isLoading, error, setError, handleComplete } = useFreelanceCompletion(
    formData,
    clearFormData,
    goToNextStep
  );

  const totalSteps = 8;

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
        );

      case 2:
        return (
          <FreelanceMissionStatusStep
            formData={formData}
            setFormData={setFormDataSummaryWrapper}
            metiers={metiers}
          />
        );

      case 3:
        return (
          <FreelancePortageStep
            formData={formData}
            setFormData={setFormDataSummaryWrapper}
            portages={portages}
            handlePortageToggle={handlePortageToggle}
          />
        );

      case 4:
        return <FreelanceTjmStep formData={formData} setFormData={setFormDataSummaryWrapper} />;
      case 5:
        return (
          <FreelanceServicesStep
            formData={formData}
            setFormData={setFormDataSummaryWrapper}
            platformServices={platformServices}
            handleServiceToggle={handleServiceToggle}
            handleServiceRequiredChange={handleServiceRequiredChange}
            handleServiceDataChange={handleServiceDataChange}
            handleMultipleSelectChange={handleMultipleSelectChange}
            parseChoices={parseChoices}
            error={error || undefined}
          />
        );

      case 6:
        return (
          <FreelancePriorityStep formData={formData} setFormData={setFormDataSummaryWrapper} />
        );

      case 7:
        return (
          <FreelanceSummaryStep
            formData={formData}
            setFormData={setFormDataSummaryWrapper}
            metiers={metiers}
            platformServices={platformServices}
            portages={portages}
          />
        );

      case 8:
        return <SuccessStep email={formData.email} />;

      default:
        return null;
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1:
        return 'Informations personnelles';
      case 2:
        return 'Situation actuelle';
      case 3:
        return 'Société de portage';
      case 4:
        return 'TJM et disponibilité';
      case 5:
        return 'Services souhaités';
      case 6:
        return 'Priorité de la demande';
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
        return 'Renseignez vos informations de base';
      case 2:
        return 'Avez-vous une mission actuellement ?';
      case 3:
        return 'Services de portage salarial';
      case 4:
        return 'Définissez votre tarif et disponibilité';
      case 5:
        return 'Choisissez les services qui vous intéressent (données obligatoires si sélectionnés)';
      case 6:
        return "Définissez l'urgence de votre demande";
      case 7:
        return "Vérifiez vos informations avant l'envoi";
      case 8:
        return 'Votre demande a été transmise';
      default:
        return '';
    }
  };

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
      showNavigation={true}
      completeButtonText="Envoyer ma demande"
      nextButtonText="Suivant"
      completionStep={7} // Specify that completion happens on step 7
      onClearProgress={() => {
        clearFormData();
        clearStepProgress();
      }}
    >
      {renderStep()}
    </ModalWrapper>
  );
};

export default FreelanceModal;