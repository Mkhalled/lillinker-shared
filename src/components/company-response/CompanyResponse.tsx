'use client';
import type React from 'react';
import { useState, useEffect, useCallback } from 'react';

import InputField from '@/components/form/input/InputField';
import SimpleModal from '@/components/modals/SimpleModal';
import type {
  CompanyResponseData,
  ServiceResponse,
  CompanyResponseProps,
  ModalState,
  ServiceResponseData,
  SelectedOrganisme,
} from '@/types/company-response';
import type { OptionInfo } from '@/types/demande';

import Loader from '../common/Loader';

import ActionButtons from './ActionButtons';
import BonusServicesSection from './BonusServicesSection';
import ExistingResponseAlert from './ExistingResponseAlert';
import OrganismesSection from './OrganismesSection';
import RequestedServices from './RequestedServices';
import RequestedServicesSection from './RequestedServicesSection';
import RequestOverview from './RequestOverview';

const CompanyResponse: React.FC<CompanyResponseProps> = ({ requestId, onClose }) => {
  const [responseData, setResponseData] = useState<CompanyResponseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [responses, setResponses] = useState<Record<number, ServiceResponse>>({});
  const [selectedOrganismes, setSelectedOrganismes] = useState<number[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [modal, setModal] = useState<ModalState>({
    isOpen: false,
    type: 'info',
    title: '',
    message: '',
    onConfirm: undefined,
  });
  const [modalLoading, setModalLoading] = useState(false);

  // State for management fee
  const [managementFeeValue, setManagementFeeValue] = useState('');
  const [managementFeeError, setManagementFeeError] = useState('');

  const showModal = (
    type: 'success' | 'error' | 'info',
    title: string,
    message: string,
    onConfirm?: () => void
  ) => {
    setModal({ isOpen: true, type, title, message, onConfirm });
  };

  // Handler for add-service modal from child
  const handleShowAddServiceModal = (label: string, onConfirm: () => Promise<void>) => {
    setModal({
      isOpen: true,
      type: 'info',
      title: 'Ajouter un service',
      message: `Êtes-vous sûr de vouloir ajouter "${label}" à votre offre de services ?`,
      onConfirm: async () => {
        setModalLoading(true);
        try {
          await onConfirm();
          setModal({
            isOpen: true,
            type: 'success',
            title: 'Service ajouté',
            message: `Le service "${label}" a été ajouté à votre offre.`,
          });
          // Refresh data after add
          fetchResponseData();
        } catch (e: unknown) {
          setModal({
            isOpen: true,
            type: 'error',
            title: 'Erreur',
            message: (e as Error)?.message || "Erreur lors de l'ajout du service.",
          });
        } finally {
          setModalLoading(false);
        }
      },
    });
  };

  const closeModal = () => {
    setModal({ isOpen: false, type: 'info', title: '', message: '' });
  };

  // Simple validation function
  const isFormValid = managementFeeValue.trim() !== '' && !managementFeeError;

  // Fetch default management fee once
  useEffect(() => {
    const fetchDefaultFee = async () => {
      try {
        const response = await fetch('/api/profile');
        if (response.ok) {
          const data = await response.json();
          // Set default management fee if we have management_min
          if (data.roleData?.management_min) {
            setManagementFeeValue(prev =>
              prev === '' ? String(data.roleData.management_min) : prev
            );
          }
        }
      } catch (error) {
        console.error('Error fetching company data:', error);
      }
    };

    fetchDefaultFee();
  }, []); // Run only once on mount
  // fetch data
  const fetchResponseData = useCallback(async () => {
    try {
      setLoading(true);

      // Fetch response data
      const response = await fetch(`/api/company/response/${requestId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch response data');
      }
      const data = await response.json();

      // Fetch company organismes separately
      const organismesResponse = await fetch('/api/company/admin/organismes');
      if (!organismesResponse.ok) {
        throw new Error('Failed to fetch organismes');
      }
      const organismesData = await organismesResponse.json();

      // Combine the data
      const combinedData = {
        ...data,
        organismes: organismesData.success ? organismesData.data : [],
      };

      setResponseData(combinedData);

      // Check if existing response exists
      if (data.existing_response) {
        setIsUpdating(true);

        // Pre-populate form with existing response data
        const existingResponses: Record<number, ServiceResponse> = {};
        const existingSelectedOrganismes: number[] = [];

        const existingResp = data.existing_response;
        const responseData = existingResp.response_data;

        // Pre-populate management fee if present in existing response
        if (existingResp.frais_de_gestion && existingResp.frais_de_gestion.value !== null) {
          setManagementFeeValue(String(existingResp.frais_de_gestion.value));
        } else if (responseData?.frais_de_gestion && responseData.frais_de_gestion.value !== null) {
          setManagementFeeValue(String(responseData.frais_de_gestion.value));
        }

        // Process services from response_data
        if (responseData?.services && Array.isArray(responseData.services)) {
          responseData.services.forEach((service: ServiceResponseData) => {
            existingResponses[service.service_id] = {
              service_id: service.service_id,
              service_name: service.service_name,
              service_description: service.service_description || '',
              is_available: service.is_available,
              charge_pro: service.charge_pro ?? 0,
              comment: service.comment || '',
            };
          });
        }

        // Process selected organismes from response_data
        if (responseData?.selected_organismes && Array.isArray(responseData.selected_organismes)) {
          responseData.selected_organismes.forEach((organisme: SelectedOrganisme) => {
            if (!existingSelectedOrganismes.includes(organisme.organisme_id)) {
              existingSelectedOrganismes.push(organisme.organisme_id);
            }
          });
        }

        // Fill in services that weren't in the existing response
        data.company_services.forEach(
          (service: { service: { id: number; label: string; description?: string | null } }) => {
            if (!existingResponses[service.service.id]) {
              // For "Frais kilométriques", get the calculated amount from freelance request
              let defaultChargePro = 0;
              if (service.service.label === "Frais kilométriques") {
                const freelanceOption = data.freelance_request.options?.find(
                  (option: OptionInfo) => option.platformService.id === service.service.id
                );
                if (freelanceOption?.response_data?.montant_calcul) {
                  defaultChargePro = Number(freelanceOption.response_data.montant_calcul);
                }
              }

              existingResponses[service.service.id] = {
                service_id: service.service.id,
                service_name: service.service.label,
                service_description: service.service.description || '',
                is_available: false,
                charge_pro: defaultChargePro,
                comment: '',
              };
            }
          }
        );

        setResponses(existingResponses);
        setSelectedOrganismes(existingSelectedOrganismes);
      } else {
        // Initialize responses state - start with all services unchecked
        const initialResponses: Record<number, ServiceResponse> = {};
        data.company_services.forEach(
          (service: { service: { id: number; label: string; description?: string | null } }) => {
            // For "Frais kilométriques", get the calculated amount from freelance request
            let defaultChargePro = 0;
            if (service.service.label === "Frais kilométriques") {
              const freelanceOption = data.freelance_request.options?.find(
                (option: OptionInfo) => option.platformService.id === service.service.id
              );
              if (freelanceOption?.response_data?.montant_calcul) {
                defaultChargePro = Number(freelanceOption.response_data.montant_calcul);
              }
            }

            initialResponses[service.service.id] = {
              service_id: service.service.id,
              service_name: service.service.label,
              service_description: service.service.description || '',
              is_available: false, // Start unchecked - company decides what to offer
              charge_pro: defaultChargePro, // Default fee, but calculated for Frais kilométriques
              comment: '',
            };
          }
        );

        // Initialize all organismes as selected by default
        const allOrganismeIds = combinedData.organismes.map(
          (organisme: { id: number }) => organisme.id
        );

        setResponses(initialResponses);
        setSelectedOrganismes(allOrganismeIds);
        setIsUpdating(false);
      }
    } catch (error) {
      console.error('Error fetching response data:', error);
    } finally {
      setLoading(false);
    }
  }, [requestId]);
  useEffect(() => {
    fetchResponseData();
  }, [fetchResponseData]);

  const handleServiceToggle = (serviceId: number, isAvailable: boolean) => {
    setResponses(prev => {
      // Ensure we have a valid response object for this service
      const existingResponse = prev[serviceId];

      if (!existingResponse) {
        // Find the service in responseData to get the name
        const companyService = responseData?.company_services.find(
          cs => cs.service.id === serviceId
        );

        // For "Frais kilométriques", get the calculated amount from freelance request
        let initialChargePro = 0;
        if (isAvailable && companyService?.service.label === "Frais kilométriques") {
          const freelanceOption = responseData?.freelance_request.options?.find(
            option => option.platformService.id === serviceId
          );
          if (freelanceOption?.response_data?.montant_calcul) {
            initialChargePro = Number(freelanceOption.response_data.montant_calcul);
          }
        }

        const newResponse = {
          service_id: serviceId,
          service_name: companyService?.service.label || '',
          service_description: companyService?.service.description || '',
          is_available: isAvailable,
          charge_pro: initialChargePro,
          comment: '',
        };

        const updated = {
          ...prev,
          [serviceId]: newResponse,
        };
        return updated;
      }

      // For existing responses, handle "Frais kilométriques" specially
      let updatedChargePro = existingResponse.charge_pro;
      if (isAvailable) {
        const companyService = responseData?.company_services.find(
          cs => cs.service.id === serviceId
        );
        if (companyService?.service.label === "Frais kilométriques") {
          const freelanceOption = responseData?.freelance_request.options?.find(
            option => option.platformService.id === serviceId
          );
          if (freelanceOption?.response_data?.montant_calcul) {
            updatedChargePro = Number(freelanceOption.response_data.montant_calcul);
          }
        }
      }

      const updated = {
        ...prev,
        [serviceId]: {
          ...existingResponse,
          is_available: isAvailable,
          charge_pro: updatedChargePro,
        },
      };
      return updated;
    });
  };

  const handleFeeChange = (serviceId: number, fee: string) => {
    setResponses(prev => {
      const existingResponse = prev[serviceId];
      if (!existingResponse) {
        return prev;
      }

      const parsedFee = Number.parseFloat(fee);
      const managementFee = isNaN(parsedFee) ? 0 : parsedFee;

      return {
        ...prev,
        [serviceId]: { ...existingResponse, charge_pro: managementFee },
      };
    });
  };

  const handleCommentChange = (serviceId: number, comment: string) => {
    setResponses(prev => {
      const existingResponse = prev[serviceId];
      if (!existingResponse) {
        return prev;
      }

      return {
        ...prev,
        [serviceId]: { ...existingResponse, comment },
      };
    });
  };

  const handleOrganismeToggle = (organismeId: number) => {
    setSelectedOrganismes(prev => {
      const newSelection = prev.includes(organismeId)
        ? prev.filter(id => id !== organismeId)
        : [...prev, organismeId];
      return newSelection;
    });
  };

  const handleOrganismeChange = (organismeId: number) => {
    return (_e: React.ChangeEvent<HTMLInputElement>) => {
      handleOrganismeToggle(organismeId);
    };
  };

  const calculateOrganismeTotals = (organisme: {
    cotisations: Array<{
      pourcentage_patronal?: number | null;
      pourcentage_salarial?: number | null;
    }>;
  }) => {
    let totalPatronal = 0;
    let totalSalarial = 0;

    organisme.cotisations.forEach(
      (cotisation: {
        pourcentage_patronal?: number | null;
        pourcentage_salarial?: number | null;
      }) => {
        if (
          cotisation.pourcentage_patronal !== null &&
          cotisation.pourcentage_patronal !== undefined
        ) {
          totalPatronal += Number.parseFloat(cotisation.pourcentage_patronal.toString()) || 0;
        }
        if (
          cotisation.pourcentage_salarial !== null &&
          cotisation.pourcentage_salarial !== undefined
        ) {
          totalSalarial += Number.parseFloat(cotisation.pourcentage_salarial.toString()) || 0;
        }
      }
    );

    return { totalPatronal, totalSalarial };
  };

  const handleSubmit = async () => {
    try {
      // Simple validation - just check if value exists
      if (!managementFeeValue.trim()) {
        setManagementFeeError('Les frais de gestion sont requis');
        return;
      }

      const numValue = parseFloat(managementFeeValue);
      if (isNaN(numValue) || numValue < 0 || numValue > 100) {
        setManagementFeeError('Veuillez saisir un pourcentage valide entre 0 et 100');
        return;
      }

      setSubmitting(true);

      // Prepare cotisation details for selected organismes - only save totals
      const selectedOrganismeDetails =
        responseData?.organismes
          .filter(organisme => selectedOrganismes.includes(organisme.id))
          .map(organisme => {
            const { totalPatronal, totalSalarial } = calculateOrganismeTotals(organisme);
            return {
              organisme_id: organisme.id,
              label: organisme.label,
              total_patronal: totalPatronal,
              total_salarial: totalSalarial,
            };
          }) || [];

      const submitData = {
        request_id: requestId,
        services: Object.values(responses),
        selected_organismes: selectedOrganismeDetails,
        frais_de_gestion: {
          manual: true,
          value: parseFloat(managementFeeValue),
        },
      };
      // Use PUT for updates, POST for new responses
      const method = isUpdating ? 'PUT' : 'POST';
      const response = await fetch(`/api/company/response/${requestId}`, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `Failed to ${isUpdating ? 'update' : 'submit'} response`
        );
      }

      // Success - show success modal
      showModal(
        'success',
        'Succès!',
        `Votre réponse a été ${isUpdating ? 'mise à jour' : 'envoyée'} avec succès.`,
        () => {
          closeModal();
          onClose();
        }
      );
    } catch (error) {
      console.error(`Error ${isUpdating ? 'updating' : 'submitting'} response:`, error);
      const actionText = isUpdating ? 'mise à jour' : 'envoi';
      showModal(
        'error',
        'Erreur',
        error instanceof Error
          ? error.message
          : `Erreur lors du ${actionText} de la réponse. Veuillez réessayer.`
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!isUpdating) return;

    showModal(
      'info',
      'Confirmer la suppression',
      'Êtes-vous sûr de vouloir supprimer cette réponse ? Cette action est irréversible.',
      async () => {
        try {
          closeModal();
          setDeleting(true);

          const response = await fetch(`/api/company/response/${requestId}`, {
            method: 'DELETE',
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to delete response');
          }

          // Success - show success modal
          showModal(
            'success',
            'Réponse supprimée',
            'Votre réponse a été supprimée avec succès.',
            () => {
              closeModal();
              onClose();
            }
          );
        } catch (error) {
          console.error('Error deleting response:', error);
          showModal(
            'error',
            'Erreur',
            error instanceof Error
              ? error.message
              : 'Erreur lors de la suppression. Veuillez réessayer.'
          );
        } finally {
          setDeleting(false);
        }
      }
    );
  };

  if (loading) {
    return <Loader />;
  }

  if (!responseData) {
    return (
      <div className="w-full flex items-center justify-center py-24">
        <div className="text-center space-y-6">
          <div className="w-16 h-16 mx-auto bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
              Demande introuvable
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              Les données de cette demande ne sont plus disponibles.
            </p>
          </div>
          <button
            onClick={onClose}
            className="inline-flex items-center px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Retour
          </button>
        </div>
      </div>
    );
  }

  const { freelance_request, company_services, organismes } = responseData;

  return (
    <div className="w-full mt-10">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden backdrop-blur-sm">
        {/* Header */}
        <div className="bg-[var(--primary-color)] dark:bg-blue-700 px-6 py-4 relative">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white mb-1">Réponse à la demande</h2>
              <p className="text-blue-100 dark:text-blue-200 text-sm">
                Proposer vos services au freelancer
              </p>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="text-white hover:text-blue-200 dark:hover:text-blue-300 transition-colors duration-200 p-1 rounded-md hover:bg-white/10"
                aria-label="Fermer les détails"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Flash Message for Existing Response */}
          <ExistingResponseAlert isUpdating={isUpdating} />

          {/* Request Overview */}
          <RequestOverview freelanceRequest={freelance_request} />

          {/* Requested Services */}
          <RequestedServices
            company_services={company_services}
            options={
              freelance_request.options?.map(option => ({
                ...option,
                response_data: option.response_data as Record<
                  string,
                  string | number | boolean | null
                >,
              })) || []
            }
            onShowAddServiceModal={handleShowAddServiceModal}
          />

          {/* Requested Services Section */}
          <RequestedServicesSection
            company_services={company_services}
            freelance_request_options={freelance_request.options || []}
            responses={responses}
            onToggle={handleServiceToggle}
            onFeeChange={handleFeeChange}
            onCommentChange={handleCommentChange}
          />

          {/* Bonus Services Section */}
          <BonusServicesSection
            company_services={company_services}
            freelance_request_options={freelance_request.options || []}
            responses={responses}
            onToggle={handleServiceToggle}
            onFeeChange={handleFeeChange}
            onCommentChange={handleCommentChange}
          />

          {/* Organismes Section */}
          <OrganismesSection
            organismes={organismes}
            selectedOrganismes={selectedOrganismes}
            onOrganismeChange={handleOrganismeChange}
            calculateOrganismeTotals={calculateOrganismeTotals}
          />

          {/* Management Fee Section */}
          <div className="space-y-2">
            <label
              htmlFor="management-fee-input"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Frais de gestion (%) *
            </label>
            <div className="w-48">
              <InputField
                id="management-fee-input"
                type="number"
                value={managementFeeValue}
                onChange={e => {
                  setManagementFeeValue(e.target.value);
                  // Clear error when user starts typing
                  if (managementFeeError) {
                    setManagementFeeError('');
                  }
                }}
                placeholder="Pourcentage des frais de gestion"
                min="0"
                max="100"
                step="0.1"
              />
            </div>
            {managementFeeError && (
              <div className="text-red-500 text-sm mt-1">{managementFeeError}</div>
            )}
          </div>

          {/* Action Buttons */}
          <ActionButtons
            isUpdating={isUpdating}
            submitting={submitting}
            deleting={deleting}
            onSubmit={handleSubmit}
            onDelete={handleDelete}
            onClose={onClose}
            isFormValid={isFormValid}
          />
        </div>
      </div>

      {/* Simple Modal */}
      <SimpleModal
        isOpen={modal.isOpen}
        onClose={closeModal}
        type={modal.type}
        title={modal.title}
        message={modal.message}
        onConfirm={modal.onConfirm}
        confirmText={modal.onConfirm ? (modalLoading ? 'Ajout en cours...' : 'Confirmer') : 'OK'}
      />
    </div>
  );
};

export default CompanyResponse;
