'use client';

import type { PlatformService } from '../../../hooks/useModalData';
import type { FreelanceFormData } from '../../../types/freelance';
import { SelectedService } from '../../../types/user';
import { StyledCheckbox } from '../../form/StyledCheckbox';
import { StyledRadio } from '../../form/StyledRadio';
import InputField from '../../form/input/InputField';
import TextAreaField from '../../form/input/TextAreaField';
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
        <div className="space-y-3 sm:space-y-4 max-h-72 sm:max-h-80 overflow-y-auto">
          {platformServices.map((service) => {
            const isSelected = formData.selectedServices.some((s: SelectedService) => s.serviceId === service.id)
            const selectedService = formData.selectedServices.find((s: SelectedService) => s.serviceId === service.id)
            const choices = parseChoices(service.choices as string | null)
            
            return (
              <div key={service.id} className="border border-gray-200 rounded-lg p-3 sm:p-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <StyledCheckbox
                        checked={isSelected}
                        onChange={() => handleServiceToggle(service.id)}
                        id={`service-${service.id}`}
                      />
                      <div className="flex-1">
                        <label htmlFor={`service-${service.id}`} className="font-medium cursor-pointer block select-none">
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
                      <StyledCheckbox
                        checked={selectedService?.isRequired || false}
                        onChange={(e) => handleServiceRequiredChange(service.id, e.target.checked)}
                        label={<span className="text-sm text-gray-700 select-none">Ce service est <strong>obligatoire</strong> pour moi</span>}
                        size="sm"
                      />

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
                            <TextAreaField
                              id={`service-text-${service.id}`}
                              value={selectedService?.responseData || ""}
                              onChange={(e) => handleServiceDataChange(service.id, e.target.value)}
                              placeholder="Saisissez votre réponse... (obligatoire)"
                              rows={3}
                              error={!selectedService?.responseData || selectedService.responseData.trim() === ''}
                              required
                            />
                          )}
                          
                          {/* NUMBER input */}
                          {service.data_type === 'NUMBER' && (
                            <InputField
                              id={`service-number-${service.id}`}
                              type="number"
                              value={selectedService?.responseData || ""}
                              onChange={(e) => handleServiceDataChange(service.id, e.target.value)}
                              placeholder="Entrez un nombre... (obligatoire)"
                              error={!selectedService?.responseData || selectedService.responseData.trim() === ''}
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
                                  <StyledCheckbox
                                    key={index}
                                    checked={isChecked}
                                    onChange={(e) => handleMultipleSelectChange(service.id, choice, e.target.checked)}
                                    label={choice}
                                    size="sm"
                                  />
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
                                <StyledRadio
                                  key={index}
                                  name={`service-${service.id}-radio`}
                                  value={choice}
                                  checked={selectedService?.responseData === choice}
                                  onChange={(e) => handleServiceDataChange(service.id, e.target.value)}
                                  label={choice}
                                  size="sm"
                                />
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
