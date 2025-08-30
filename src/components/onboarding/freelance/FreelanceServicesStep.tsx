'use client';

import { PlatformService } from '@/types/platform';

import type { FreelanceFormData, FreelanceRequestData } from '../../../types/freelance';
import { SelectedService } from '../../../types/user';
import InputField from '../../form/input/InputField';
import TextAreaField from '../../form/input/TextAreaField';
import { StyledCheckbox } from '../../form/StyledCheckbox';
import { StyledRadio } from '../../form/StyledRadio';
import ServiceInfoTooltip from '../../ServiceInfoTooltip';

interface FreelanceServicesStepProps {
  formData: FreelanceFormData | FreelanceRequestData;
  setFormData: (
    updater: (
      prev: FreelanceFormData | FreelanceRequestData
    ) => FreelanceFormData | FreelanceRequestData
  ) => void;
  platformServices: PlatformService[];
  handleServiceToggle: (serviceId: number) => void;
  handleServiceRequiredChange: (serviceId: number, isRequired: boolean) => void;
  handleServiceDataChange: (serviceId: number, fieldId: number, data: string) => void;
  handleMultipleSelectChange: (serviceId: number, fieldId: number, choice: string, isChecked: boolean) => void;
  parseChoices: (choices: unknown) => string[];
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
  error,
}: FreelanceServicesStepProps) => {
  return (
    <div className="space-y-6">
      <div>
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-md text-blue-700 text-sm mb-4">
          <p>
            <strong>Information :</strong> Si vous sélectionnez un service, vous devez
            obligatoirement remplir les données demandées (texte, choix, etc.)
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm mb-4">
            {error}
          </div>
        )}

        {/* Services List - Scrollable */}
        <div className="space-y-3 sm:space-y-4 max-h-72 sm:max-h-80 overflow-y-auto">
          {platformServices.map(service => {
            const isSelected = formData.selectedServices.some(
              (s: SelectedService) => s.serviceId === service.id
            );
            const selectedService = formData.selectedServices.find(
              (s: SelectedService) => s.serviceId === service.id
            );

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
                        <label
                          htmlFor={`service-${service.id}`}
                          className="font-medium cursor-pointer block select-none"
                        >
                          {service.label}
                        </label>
                      </div>
                    </div>

                    {/* Service Info Tooltip */}
                    <div
                      onClick={e => e.stopPropagation()}
                      onKeyDown={e => {
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
                      onClick={e => e.stopPropagation()}
                      onKeyDown={e => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.stopPropagation();
                        }
                      }}
                      role="button"
                      tabIndex={0}
                    >
                      <StyledCheckbox
                        checked={selectedService?.isRequired || false}
                        onChange={e => handleServiceRequiredChange(service.id, e.target.checked)}
                        label={
                          <span className="text-sm text-gray-700 select-none">
                            Ce service est <strong>obligatoire</strong> pour moi
                          </span>
                        }
                        size="sm"
                      />

                      {/* Data input for services that require data */}
                      {service.requires_data && service.dataFields && service.dataFields.length > 0 && (
                        <div className="space-y-4 mt-3">
                          {service.dataFields.map((field) => {
                            const choices = parseChoices(field.choices);
                            const fieldResponseData = selectedService?.responseData?.[field.id] || '';

                            return (
                              <div key={field.id} className="space-y-3">
                                <div>
                                  <label className="text-sm font-medium text-gray-700 block">
                                    {field.label} <span className="text-red-500">*</span>
                                  </label>
                                  {field.description && (
                                    <p className="text-xs text-gray-500 mt-1">
                                      {field.description}
                                    </p>
                                  )}
                                </div>

                                {/* TEXT input */}
                                {field.data_type === 'TEXT' && (
                                  <TextAreaField
                                    id={`service-text-${service.id}-${field.id}`}
                                    value={fieldResponseData}
                                    onChange={e => handleServiceDataChange(service.id, field.id, e.target.value)}
                                    placeholder="Saisissez votre réponse... (obligatoire)"
                                    rows={3}
                                    error={!fieldResponseData || fieldResponseData.trim() === ''}
                                    required
                                  />
                                )}

                                {/* NUMBER input */}
                                {field.data_type === 'NUMBER' && (
                                  <InputField
                                    id={`service-number-${service.id}-${field.id}`}
                                    type="number"
                                    value={fieldResponseData}
                                    onChange={e => handleServiceDataChange(service.id, field.id, e.target.value)}
                                    placeholder="Entrez un nombre... (obligatoire)"
                                    error={!fieldResponseData || fieldResponseData.trim() === ''}
                                    required
                                  />
                                )}

                                {/* SELECT (multiple choice) */}
                                {field.data_type === 'SELECT' && choices.length > 0 && (
                                  <div className="space-y-2">
                                    <p className="text-xs text-gray-600">
                                      Sélectionnez une ou plusieurs options{' '}
                                      <span className="text-red-500">*</span> :
                                    </p>
                                    {choices.map((choice: string, index: number) => {
                                      const currentSelections = fieldResponseData
                                        ? fieldResponseData
                                            .split(',')
                                            .filter((s: string) => s.trim() !== '')
                                        : [];
                                      const isChecked = currentSelections.includes(choice);

                                      return (
                                        <StyledCheckbox
                                          key={index}
                                          checked={isChecked}
                                          onChange={e =>
                                            handleMultipleSelectChange(
                                              service.id,
                                              field.id,
                                              choice,
                                              e.target.checked
                                            )
                                          }
                                          label={choice}
                                          size="sm"
                                        />
                                      );
                                    })}
                                    {(!fieldResponseData || fieldResponseData.trim() === '') && (
                                      <p className="text-xs text-red-500 mt-1">
                                        Veuillez sélectionner au moins une option.
                                      </p>
                                    )}
                                  </div>
                                )}

                                {/* RADIO (single choice) */}
                                {field.data_type === 'RADIO' && choices.length > 0 && (
                                  <div className="space-y-2">
                                    <p className="text-xs text-gray-600">
                                      Sélectionnez une option <span className="text-red-500">*</span> :
                                    </p>
                                    {choices.map((choice: string, index: number) => (
                                      <StyledRadio
                                        key={index}
                                        name={`service-${service.id}-${field.id}-radio`}
                                        value={choice}
                                        checked={fieldResponseData === choice}
                                        onChange={e =>
                                          handleServiceDataChange(service.id, field.id, e.target.value)
                                        }
                                        label={choice}
                                        size="sm"
                                      />
                                    ))}
                                    {(!fieldResponseData || fieldResponseData.trim() === '') && (
                                      <p className="text-xs text-red-500 mt-1">
                                        Veuillez sélectionner une option.
                                      </p>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FreelanceServicesStep;