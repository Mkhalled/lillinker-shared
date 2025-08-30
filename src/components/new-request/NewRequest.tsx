'use client';

import { useEffect } from 'react';

import { useModalData } from '../../hooks/useModalData';
import { BaseModalProps } from '../../types/user';
import {
  FreelanceMissionStatusStep,
  FreelancePortageStep,
  FreelanceTjmStep,
  FreelancePriorityStep,
  FreelanceSummaryStep,
  FreelanceServicesStep,
  useFreelanceHandlers,
} from '../onboarding/freelance';
import { ModalWrapper } from '../onboarding/ModalWrapper';
import { SuccessStep } from '../onboarding/SuccessStep';

import { useRequestCompletion } from './useRequestCompletion';
import { useRequestForm } from './useRequestForm';
import { useRequestNavigation } from './useRequestNavigation';
import { useRequestValidation } from './useRequestValidation';

interface NewRequestProps extends BaseModalProps {}

const NewRequest = ({ onClose }: NewRequestProps) => {
  const { platformServices, metiers, portages, error: dataError } = useModalData();

  // Use custom hooks
  const { formData, setFormData, clearFormData } = useRequestForm();
  const { currentStep, handleNext, handlePrevious, goToNextStep, clearStepProgress } =
    useRequestNavigation(7, clearFormData);
  const { isStepValid } = useRequestValidation(formData, currentStep, platformServices);
  const {
    handleServiceToggle,
    handleServiceRequiredChange,
    handleServiceDataChange,
    handlePortageToggle,
    parseChoices,
    handleMultipleSelectChange,
  } = useFreelanceHandlers(setFormData);
  const { isLoading, error, setError, handleComplete } = useRequestCompletion(
    formData,
    clearFormData,
    goToNextStep
  );

  const totalSteps = 7;

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
          <FreelanceMissionStatusStep
            formData={formData}
            setFormData={setFormData}
            metiers={metiers}
          />
        );

      case 2:
        return (
          <FreelancePortageStep
            formData={formData}
            setFormData={setFormData}
            portages={portages}
            handlePortageToggle={handlePortageToggle}
          />
        );

      case 3:
        return <FreelanceTjmStep formData={formData} setFormData={setFormData} />;
        
      case 4:
        return (
          <FreelanceServicesStep
            formData={formData}
            setFormData={setFormData}
            platformServices={platformServices}
            handleServiceToggle={handleServiceToggle}
            handleServiceRequiredChange={handleServiceRequiredChange}
            handleServiceDataChange={handleServiceDataChange}
            handleMultipleSelectChange={handleMultipleSelectChange}
            parseChoices={parseChoices}
            error={error || undefined}
          />
        );

      case 5:
        return <FreelancePriorityStep formData={formData} setFormData={setFormData} />;

      case 6:
        return (
          <FreelanceSummaryStep
            formData={formData}
            setFormData={setFormData}
            metiers={metiers}
            platformServices={platformServices}
            portages={portages}
          />
        );

      case 7:
        return (
          <SuccessStep
            title="Votre demande a été envoyée !"
            message="Votre demande a bien été envoyée. Veuillez suivre les étapes ci-dessous pour finaliser le processus."
            steps={[
              'Votre demande sera visible par les entreprises',
              'Les entreprises intéressées vous contacteront',
              "Acceptez une proposition pour poursuivre avec l'entreprise de votre choix",
            ]}
          />
        );

      default:
        return null;
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1:
        return 'Situation actuelle';
      case 2:
        return 'Société de portage';
      case 3:
        return 'TJM et disponibilité';
      case 4:
        return 'Services souhaités';
      case 5:
        return 'Priorité de la demande';
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
        return 'Avez-vous une mission actuellement ?';
      case 2:
        return 'Services de portage salarial';
      case 3:
        return 'Définissez votre tarif et disponibilité';
      case 4:
        return 'Choisissez les services qui vous intéressent (données obligatoires si sélectionnés)';
      case 5:
        return "Définissez l'urgence de votre demande";
      case 6:
        return "Vérifiez vos informations avant l'envoi";
      case 7:
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
      completionStep={6} // Specify that completion happens on step 6
      onClearProgress={() => {
        clearFormData();
        clearStepProgress();
      }}
    >
      {renderStep()}
    </ModalWrapper>
  );
};

export default NewRequest;