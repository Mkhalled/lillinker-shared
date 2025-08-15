'use client';

import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  User, 
  Calendar, 
  Building, 
  TrendingUp,
  Euro,
  MessageSquare,
  Send,
  Loader
} from 'lucide-react';
import { CompanyResponseData, ServiceResponse } from '@/types/company-response';
import { CompanyResponseService } from '@/services/CompanyResponseService';

interface CompanyResponseProps {
  requestId: number;
  onClose: () => void;
}

const CompanyResponse: React.FC<CompanyResponseProps> = ({ requestId, onClose }) => {
  const [responseData, setResponseData] = useState<CompanyResponseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [responses, setResponses] = useState<Record<number, ServiceResponse>>({});
  const [overallMessage, setOverallMessage] = useState('');
  const [selectedOrganismes, setSelectedOrganismes] = useState<number[]>([]);

  useEffect(() => {
    fetchResponseData();
  }, [requestId]);

  const fetchResponseData = async () => {
    try {
      setLoading(true);
      
      // Fetch response data
      const response = await fetch(`/api/company/response/${requestId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch response data');
      }
      const data = await response.json();
      console.log('Response data:', data);
      
      // Fetch company organismes separately
      const organismesResponse = await fetch('/api/company/admin/organismes');
      if (!organismesResponse.ok) {
        throw new Error('Failed to fetch organismes');
      }
      const organismesData = await organismesResponse.json();
      console.log('Organismes data:', organismesData);
      
      // Combine the data
      const combinedData = {
        ...data,
        organismes: organismesData.success ? organismesData.data : []
      };
      
      console.log('Combined data organismes:', combinedData.organismes);
      setResponseData(combinedData);
      
      // Initialize responses state - start with all services unchecked
      const initialResponses: Record<number, ServiceResponse> = {};
      data.company_services.forEach((service: any) => {
        initialResponses[service.service.id] = {
          service_id: service.service.id,
          service_name: service.service.label,
          service_description: service.service.description || '',
          is_available: false, // Start unchecked - company decides what to offer
          management_fee: 8.5, // Default fee
          comment: '',
        };
      });
      setResponses(initialResponses);
      
    } catch (error) {
      console.error('Error fetching response data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleServiceToggle = (serviceId: number, isAvailable: boolean) => {
    setResponses(prev => ({
      ...prev,
      [serviceId]: { ...prev[serviceId], is_available: isAvailable }
    }));
  };

  const handleFeeChange = (serviceId: number, fee: string) => {
    setResponses(prev => ({
      ...prev,
      [serviceId]: { ...prev[serviceId], management_fee: parseFloat(fee) || 0 }
    }));
  };

  const handleCommentChange = (serviceId: number, comment: string) => {
    setResponses(prev => ({
      ...prev,
      [serviceId]: { ...prev[serviceId], comment }
    }));
  };

  const handleOrganismeToggle = (organismeId: number) => {
    setSelectedOrganismes(prev => 
      prev.includes(organismeId) 
        ? prev.filter(id => id !== organismeId)
        : [...prev, organismeId]
    );
  };

  const calculateTotalCotisations = () => {
    if (!responseData) return { totalPatronal: 0, totalSalarial: 0, totalCombined: 0 };
    
    return CompanyResponseService.calculateTotalCotisations(
      responseData.organismes, 
      selectedOrganismes
    );
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      
      // Prepare cotisation details for selected organismes
      const selectedOrganismeDetails = responseData?.organismes
        .filter(organisme => selectedOrganismes.includes(organisme.id))
        .map(organisme => ({
          organisme_id: organisme.id,
          label: organisme.label,
          cotisations: organisme.cotisations.map(cotisation => ({
            id: cotisation.id,
            label: cotisation.label,
            type: cotisation.type,
            pourcentage_patronal: cotisation.pourcentage_patronal,
            pourcentage_salarial: cotisation.pourcentage_salarial
          }))
        })) || [];
      
      const cotisationTotals = calculateTotalCotisations();
      
      const submitData = {
        services: Object.values(responses),
        selected_organismes: selectedOrganismeDetails,
        cotisation_summary: {
          total_patronal: cotisationTotals.totalPatronal,
          total_salarial: cotisationTotals.totalSalarial,
          total_combined: cotisationTotals.totalCombined
        },
        overall_message: overallMessage,
      };
      
      const response = await fetch(`/api/company/response/${requestId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit response');
      }
      
      // Success - close the component
      onClose();
      
    } catch (error) {
      console.error('Error submitting response:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader className="w-6 h-6 animate-spin" />
          <span>Chargement des données de la demande...</span>
        </div>
      </div>
    );
  }

  if (!responseData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-slate-600">Demande introuvable</p>
          <button 
            onClick={onClose}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retour
          </button>
        </div>
      </div>
    );
  }

  const { freelance_request, company_services, organismes } = responseData;
  const cotisationTotals = calculateTotalCotisations();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button 
                onClick={onClose}
                className="flex items-center text-slate-600 hover:text-slate-800 transition-colors group"
              >
                <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                Retour
              </button>
              <div className="h-6 w-px bg-slate-300"></div>
              <div>
                <h1 className="text-xl font-semibold text-slate-900">Réponse à la demande</h1>
                <p className="text-sm text-slate-500">Proposer vos services au freelancer</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        {/* Request Overview Card */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm border border-white/20 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 text-white">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">
                    {freelance_request.freelance.user.first_name} {freelance_request.freelance.user.last_name}
                  </h2>
                  <p className="text-blue-100">Freelancer</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">€{freelance_request.tjm}</div>
                <div className="text-sm text-blue-100">par jour</div>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/20">
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <Calendar className="w-4 h-4 mr-1" />
                </div>
                <div className="text-sm font-medium">{freelance_request.days} jours</div>
                <div className="text-xs text-blue-100">Durée</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <Building className="w-4 h-4 mr-1" />
                </div>
                <div className="text-sm font-medium">
                  {freelance_request.client_name || 'Non spécifié'}
                </div>
                <div className="text-xs text-blue-100">Client</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <TrendingUp className="w-4 h-4 mr-1" />
                </div>
                <div className="text-sm font-medium">{freelance_request.priority}</div>
                <div className="text-xs text-blue-100">Priorité</div>
              </div>
            </div>
          </div>
        </div>

        {/* Request Details Section */}
        <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-white/20 overflow-hidden">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Détails de la demande</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-700">Services demandés</label>
                  <div className="mt-2 space-y-2">
                    {freelance_request.options.map((option) => (
                      <div key={option.platformService.id} className="flex items-center space-x-2 text-sm">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-slate-700">{option.platformService.label}</span>
                        <span className="text-slate-500">
                          ({option.platformService.description || 'Service professionnel'})
                        </span>
                        {option.is_required && (
                          <span className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full">
                            Requis
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-slate-700">Statut</label>
                  <div className="mt-1">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      freelance_request.mission_status === 'OPEN' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {freelance_request.mission_status}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-700">Informations client</label>
                  <div className="mt-1 text-sm text-slate-600">
                    <div>Nom: {freelance_request.client_name || 'Non spécifié'}</div>
                    <div>Secteur: {freelance_request.client_sector || 'Non spécifié'}</div>
                    <div>Adresse: {freelance_request.client_address || 'Non spécifié'}</div>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-slate-700">Priorité de la demande</label>
                  <div className="mt-1">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      freelance_request.priority === 'HIGH' 
                        ? 'bg-red-100 text-red-800' 
                        : freelance_request.priority === 'MEDIUM'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {freelance_request.priority}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Services Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-900">Vos services disponibles</h2>
            <div className="text-sm text-slate-500">
              Sélectionnez les services que vous pouvez fournir pour cette demande
            </div>
          </div>
        {/* Services Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-900">Réponse aux services demandés</h2>
            <div className="text-sm text-slate-500">
              Sélectionnez les services que vous pouvez fournir
            </div>
          </div>
          
          {company_services.map((service) => {
            // Check if this service matches any requested service
            const isRequested = freelance_request.options.some(
              option => option.platformService.id === service.service.id
            );
            const requestedOption = freelance_request.options.find(
              option => option.platformService.id === service.service.id
            );
            
            return (
              <div 
                key={service.service.id} 
                className={`bg-white/70 backdrop-blur-sm rounded-xl border overflow-hidden group hover:shadow-md transition-all duration-300 ${
                  responses[service.service.id]?.is_available 
                    ? 'border-emerald-200/50 ring-2 ring-emerald-100' 
                    : isRequested 
                    ? 'border-blue-200/50'
                    : 'border-slate-200/50'
                }`}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <input
                          type="checkbox"
                          checked={responses[service.service.id]?.is_available || false}
                          onChange={(e) => handleServiceToggle(service.service.id, e.target.checked)}
                          className="w-5 h-5 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500"
                        />
                        <h3 className="text-lg font-semibold text-slate-900">
                          {service.service.label}
                        </h3>
                        {isRequested && (
                          <div className="flex items-center space-x-2">
                            <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">
                              Demandé par le freelancer
                            </span>
                            {requestedOption?.is_required && (
                              <span className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full">
                                Requis
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      <p className="text-slate-600 mb-4">
                        {service.service.description || 'Aucune description'}
                      </p>
                      
                      {isRequested && requestedOption?.response_data && (
                        <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                          <div className="text-sm font-medium text-blue-800 mb-3">
                            Données supplémentaires demandées:
                          </div>
                          <div className="space-y-2">
                            {Object.entries(requestedOption.response_data as Record<string, any>).map(([key, value]) => (
                              <div key={key} className="flex items-center justify-between py-1 px-2 bg-white rounded border">
                                <span className="text-sm font-medium text-slate-700 capitalize">
                                  {key.replace(/[_-]/g, ' ')}:
                                </span>
                                <span className="text-sm text-slate-600 font-medium">
                                  {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {responses[service.service.id]?.is_available && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-700">
                          Frais de gestion (%)
                          <span className="text-red-500 ml-1">*</span>
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="100"
                          value={responses[service.service.id]?.management_fee || 0}
                          onChange={(e) => handleFeeChange(service.service.id, e.target.value)}
                          className="w-full px-3 py-2 bg-white/50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-700">
                          Commentaire / Conditions
                        </label>
                        <textarea
                          rows={2}
                          value={responses[service.service.id]?.comment || ''}
                          onChange={(e) => handleCommentChange(service.service.id, e.target.value)}
                          placeholder="Détails, conditions particulières, délais..."
                          className="w-full px-3 py-2 bg-white/50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        </div>

        {/* Organismes Section */}
        {organismes.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <Euro className="w-4 h-4 text-purple-600" />
                </div>
                <h2 className="text-lg font-semibold text-slate-900">Organismes et Cotisations</h2>
              </div>
              {selectedOrganismes.length > 0 && (
                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 px-6 py-4 rounded-xl border border-purple-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <Euro className="w-4 h-4 text-purple-600" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-purple-900">
                          Total des cotisations sélectionnées
                        </div>
                        <div className="text-xs text-purple-700">
                          {selectedOrganismes.length} organisme{selectedOrganismes.length > 1 ? 's' : ''} sélectionné{selectedOrganismes.length > 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-4">
                        <div className="text-center">
                          <div className="text-lg font-bold text-blue-700">
                            {cotisationTotals.totalPatronal.toFixed(2)}%
                          </div>
                          <div className="text-xs text-blue-600">Patronal</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-green-700">
                            {cotisationTotals.totalSalarial.toFixed(2)}%
                          </div>
                          <div className="text-xs text-green-600">Salarial</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xl font-bold text-purple-700">
                            {cotisationTotals.totalCombined.toFixed(2)}%
                          </div>
                          <div className="text-xs text-purple-600">Total</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-purple-200/50 overflow-hidden">
              <div className="p-6 space-y-4">
                {organismes.map((organisme) => (
                  <div 
                    key={organisme.id}
                    className="flex items-start space-x-3 p-4 bg-white/50 rounded-lg border border-slate-200/50"
                  >
                    <input
                      type="checkbox"
                      id={`organisme-${organisme.id}`}
                      checked={selectedOrganismes.includes(organisme.id)}
                      onChange={() => handleOrganismeToggle(organisme.id)}
                      className="mt-1 w-4 h-4 text-purple-600 border-slate-300 rounded focus:ring-purple-500"
                    />
                    <div className="flex-1">
                      <label 
                        htmlFor={`organisme-${organisme.id}`}
                        className="block text-sm font-semibold text-slate-900 cursor-pointer"
                      >
                        {organisme.label}
                      </label>
                      {organisme.description && (
                        <p className="text-xs text-slate-600 mt-1">{organisme.description}</p>
                      )}
                      
                      {organisme.cotisations.length > 0 && (
                        <div className="mt-4 space-y-3">
                          <div className="text-sm font-semibold text-slate-800 flex items-center">
                            <Euro className="w-4 h-4 mr-1 text-purple-600" />
                            Cotisations associées
                          </div>
                          <div className="space-y-3">
                            {organisme.cotisations.map((cotisation) => (
                              <div key={cotisation.id} className="bg-gradient-to-r from-slate-50 to-slate-100 p-4 rounded-lg border border-slate-200">
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex-1">
                                    <h4 className="text-sm font-semibold text-slate-900">{cotisation.label}</h4>
                                    {cotisation.description && (
                                      <p className="text-xs text-slate-600 mt-1">{cotisation.description}</p>
                                    )}
                                  </div>
                                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    cotisation.type === 'PATRONAL' ? 'bg-blue-100 text-blue-700' :
                                    cotisation.type === 'SALARIAL' ? 'bg-green-100 text-green-700' :
                                    'bg-purple-100 text-purple-700'
                                  }`}>
                                    {cotisation.type}
                                  </div>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-3 mt-3">
                                  {cotisation.pourcentage_patronal && (
                                    <div className="bg-white p-2 rounded border">
                                      <div className="text-xs text-slate-500">Cotisation Patronale</div>
                                      <div className="text-sm font-bold text-blue-700">
                                        {cotisation.pourcentage_patronal}%
                                      </div>
                                    </div>
                                  )}
                                  {cotisation.pourcentage_salarial && (
                                    <div className="bg-white p-2 rounded border">
                                      <div className="text-xs text-slate-500">Cotisation Salariale</div>
                                      <div className="text-sm font-bold text-green-700">
                                        {cotisation.pourcentage_salarial}%
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4">
          <button 
            onClick={onClose}
            className="flex items-center px-4 py-2 text-slate-600 hover:text-slate-800 hover:bg-white/50 rounded-xl transition-all"
          >
            Annuler
          </button>
          <button 
            onClick={handleSubmit}
            disabled={submitting}
            className="flex items-center px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {submitting ? (
              <>
                <Loader className="w-4 h-4 mr-2 animate-spin" />
                Envoi en cours...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Envoyer la réponse
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CompanyResponse;