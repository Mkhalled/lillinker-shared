'use client';

import { useTranslations } from 'next-intl';
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
  const t = useTranslations('onboarding.freelance');
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
    handleServiceToggle: baseHandleServiceToggle,
    handleServiceRequiredChange,
    handleServiceDataChange,
    handlePortageToggle,
    parseChoices,
    handleMultipleSelectChange,
  } = useFreelanceHandlers(setFormDataWrapper);

  // Enhanced handleServiceToggle that automatically sets "Montant calculé" to "0" for Frais kilométriques
  const handleServiceToggle = (serviceId: number) => {
    // First, call the base toggle logic
    baseHandleServiceToggle(serviceId);

    // Then, if this is the "Frais kilométriques" service and it's being added, set default "Montant calculé" value
    setFormData((prev: FreelanceFormData) => {
      const existingServiceIndex = prev.selectedServices.findIndex(s => s.serviceId === serviceId);

      // If service is being added (not removed)
      if (existingServiceIndex < 0) {
        const service = platformServices.find(s => s.id === serviceId);
        if (service && service.id === 5) {
          const montantCalculeField = service.dataFields?.find(
            field => field.label === 'Montant calculé'
          );

          if (montantCalculeField) {
            // Set default value of "0" for the "Montant calculé" field
            return {
              ...prev,
              selectedServices: prev.selectedServices.map(s =>
                s.serviceId === serviceId
                  ? {
                      ...s,
                      responseData: {
                        ...s.responseData,
                        [montantCalculeField.id]: '0',
                      },
                    }
                  : s
              ),
            };
          }
        }
      }

      return prev;
    });
  };
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
        return t('steps.personalInfo.title');
      case 2:
        return t('steps.missionStatus.title');
      case 3:
        return t('steps.portage.title');
      case 4:
        return t('steps.tjm.title');
      case 5:
        return t('steps.services.title');
      case 6:
        return t('steps.priority.title');
      case 7:
        return t('steps.summary.title');
      case 8:
        return t('steps.success.title');
      default:
        return '';
    }
  };

  const getStepDescription = () => {
    switch (currentStep) {
      case 1:
        return t('steps.personalInfo.description');
      case 2:
        return t('steps.missionStatus.description');
      case 3:
        return t('steps.portage.description');
      case 4:
        return t('steps.tjm.description');
      case 5:
        return t('steps.services.description');
      case 6:
        return t('steps.priority.description');
      case 7:
        return t('steps.summary.description');
      case 8:
        return t('steps.success.description');
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
      completeButtonText={t('completeButton')}
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
