'use client';
import type React from 'react';
import { useState, useEffect } from 'react';

import SimpleModal from '@/components/modals/SimpleModal';
import type {
  CompanyResponseData,
  ServiceResponse,
  CompanyResponseProps,
  ModalState,
  ServiceResponseData,
  SelectedOrganisme,
} from '@/types/company-response';

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
  });

  const showModal = (
    type: 'success' | 'error' | 'info',
    title: string,
    message: string,
    onConfirm?: () => void
  ) => {
    setModal({ isOpen: true, type, title, message, onConfirm });
  };

  const closeModal = () => {
    setModal({ isOpen: false, type: 'info', title: '', message: '' });
  };
  // fetch data
  const fetchResponseData = async () => {
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

          // Process services from response_data
          if (responseData?.services && Array.isArray(responseData.services)) {
            responseData.services.forEach((service: ServiceResponseData) => {
              existingResponses[service.service_id] = {
                service_id: service.service_id,
                service_name: service.service_name,
                service_description: service.service_description || '',
                is_available: service.is_available,
                management_fee: service.management_fee || 0,
                comment: service.comment || '',
              };
            });
          }

          // Process selected organismes from response_data
          if (
            responseData?.selected_organismes &&
            Array.isArray(responseData.selected_organismes)
          ) {
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
                existingResponses[service.service.id] = {
                  service_id: service.service.id,
                  service_name: service.service.label,
                  service_description: service.service.description || '',
                  is_available: false,
                  management_fee: 0,
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
              initialResponses[service.service.id] = {
                service_id: service.service.id,
                service_name: service.service.label,
                service_description: service.service.description || '',
                is_available: false, // Start unchecked - company decides what to offer
                management_fee: 0, // Default fee
                comment: '',
              };
            }
          );
          setResponses(initialResponses);
          setIsUpdating(false);
        }
      } catch (error) {
        console.error('Error fetching response data:', error);
      } finally {
        setLoading(false);
      }
    };
  useEffect(() => {
    fetchResponseData();
  }, [requestId]);

  const handleServiceToggle = (serviceId: number, isAvailable: boolean) => {
    setResponses(prev => ({
      ...prev,
      [serviceId]: { ...prev[serviceId], is_available: isAvailable },
    }));
  };

  const handleFeeChange = (serviceId: number, fee: string) => {
    setResponses(prev => ({
      ...prev,
      [serviceId]: { ...prev[serviceId], management_fee: Number.parseFloat(fee) || 0 },
    }));
  };

  const handleCommentChange = (serviceId: number, comment: string) => {
    setResponses(prev => ({
      ...prev,
      [serviceId]: { ...prev[serviceId], comment },
    }));
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
        if (cotisation.pourcentage_patronal) {
          totalPatronal += Number.parseFloat(cotisation.pourcentage_patronal.toString()) || 0;
        }
        if (cotisation.pourcentage_salarial) {
          totalSalarial += Number.parseFloat(cotisation.pourcentage_salarial.toString()) || 0;
        }
      }
    );

    return { totalPatronal, totalSalarial };
  };

  const handleSubmit = async () => {
    try {
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
        services: Object.values(responses),
        selected_organismes: selectedOrganismeDetails,
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
          onAdd={fetchResponseData}
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

          {/* Action Buttons */}
          <ActionButtons
            isUpdating={isUpdating}
            submitting={submitting}
            deleting={deleting}
            onSubmit={handleSubmit}
            onDelete={handleDelete}
            onClose={onClose}
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
        confirmText={modal.onConfirm ? 'Confirmer' : 'OK'}
      />
    </div>
  );
};

export default CompanyResponse;
