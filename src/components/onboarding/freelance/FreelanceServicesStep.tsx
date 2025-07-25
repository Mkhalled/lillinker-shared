'use client';

import type { PlatformService } from '../../../hooks/useModalData';
import type { FreelanceFormData } from '../../../types/freelance';
import { SelectedService } from '../../../types/user';
import ServiceInfoTooltip from '../../ServiceInfoTooltip';

interface FreelanceServicesStepProps {
  formData: FreelanceFormData;
  setFormData: (updater: (prev: FreelanceFormData) => FreelanceFormData) => void;
  platformServices: PlatformService[];
  handleServiceToggle: (serviceId: number) => void;
  handleServiceRequiredChange: (serviceId: number, isRequired: boolean) => void;
  handleServiceDataChange: (serviceId: number, data: string) => void;
  handleMultipleSelectChange: (serviceId: number, choice: string, isChecked: boolean) => void;
  parseChoices: (choices: string | null) => string[];
  error?: string;
}

export const FreelanceServicesStep = ({
  formData,
  platformServices,
  handleServiceToggle,
  handleServiceRequiredChange,
  handleServiceDataChange,
  handleMultipleSelectChange,
  parseChoices,
  error
}: FreelanceServicesStepProps) => {
  return (
    <div className="space-y-6">
      <div>        
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
            const choices = parseChoices(service.choices as string | null)
            
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
                    <div 
                      onClick={(e) => e.stopPropagation()}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.stopPropagation();
                        }
                      }}
                      role="button"
                      tabIndex={0}
                    >
                      <ServiceInfoTooltip service={service} />
                    </div>
                  </div>

                  {/* Required checkbox and data input for selected services */}
                  {isSelected && selectedService && (
                    <div 
                      className="mt-4 pl-4 border-l-2 border-blue-200" 
                      onClick={(e) => e.stopPropagation()}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.stopPropagation();
                        }
                      }}
                      role="button"
                      tabIndex={0}
                    >
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
  );
};

export default FreelanceServicesStep;
