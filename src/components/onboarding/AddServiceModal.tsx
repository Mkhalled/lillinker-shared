'use client';

import { Plus, Trash2, X } from 'lucide-react';
import { useState, useEffect } from 'react';

import type { NewServiceData } from '@/types/platform';

import InputField from '../form/input/InputField';
import TextAreaField from '../form/input/TextAreaField';
import { StyledCheckbox } from '../form/StyledCheckbox';
import { Button } from '../ui/button/Button';

interface AddServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (service: NewServiceData, editIndex?: number) => void;
  editingService?: NewServiceData;
  editingIndex?: number;
}

const AddServiceModal = ({
  isOpen,
  onClose,
  onSave,
  editingService,
  editingIndex,
}: AddServiceModalProps) => {
  const [serviceData, setServiceData] = useState<NewServiceData>({
    service_label: '',
    service_description: '',
    requires_data: false,
    dataFields: [], // Initialize with empty array to avoid undefined
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form data when editing
  useEffect(() => {
    if (editingService) {
      setServiceData({
        ...editingService,
        dataFields: editingService.dataFields || [],
      });
    } else {
      setServiceData({
        service_label: '',
        service_description: '',
        requires_data: false,
        dataFields: [],
      });
    }
  }, [editingService, isOpen]);

  const isEditing = editingService !== undefined;

  const handleSave = () => {
    const newErrors: Record<string, string> = {};

    // Validation
    if (!serviceData.service_label.trim()) {
      newErrors.service_label = 'Le libellé est requis';
    }

    if (serviceData.requires_data) {
      const dataFields = serviceData.dataFields || [];
      if (dataFields.length === 0) {
        newErrors.dataFields =
          'Au moins un champ de données est requis lorsque des données sont nécessaires';
      }
      dataFields.forEach((field, index) => {
        if (!field.label.trim()) {
          newErrors[`dataLabel_${index}`] = 'Le label du champ est requis';
        }
        if (
          (field.data_type === 'RADIO' || field.data_type === 'SELECT') &&
          (!field.choices || field.choices.filter(c => c.trim() !== '').length < 2)
        ) {
          newErrors[`choices_${index}`] = 'Au moins 2 options sont requises';
        }
      });
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      const cleanedServiceData = {
        ...serviceData,
        dataFields: (serviceData.dataFields || []).map(field => ({
          ...field,
          choices: field.choices?.filter(c => c.trim() !== '') || [],
        })),
      };

      onSave(cleanedServiceData, isEditing ? editingIndex : undefined);
      handleClose();
    }
  };

  const handleClose = () => {
    setServiceData({
      service_label: '',
      service_description: '',
      requires_data: false,
      dataFields: [], // Reset to empty array
    });
    setErrors({});
    onClose();
  };

  const addDataField = () => {
    setServiceData(prev => ({
      ...prev,
      dataFields: [
        ...(prev.dataFields || []),
        {
          label: '',
          description: '',
          data_type: 'TEXT' as const,
          choices: [],
        },
      ],
    }));
  };

  const updateDataField = (
    index: number,
    field: Partial<NonNullable<NewServiceData['dataFields']>[number]>
  ) => {
    setServiceData(prev => {
      const dataFields = prev.dataFields || [];
      return {
        ...prev,
        dataFields: dataFields.map((dataField, i) =>
          i === index ? { ...dataField, ...field } : dataField
        ),
      };
    });
  };

  const removeDataField = (index: number) => {
    setServiceData(prev => ({
      ...prev,
      dataFields: (prev.dataFields || []).filter((_, i) => i !== index),
    }));
  };

  const addChoice = (dataFieldIndex: number) => {
    setServiceData(prev => {
      const dataFields = prev.dataFields || [];
      return {
        ...prev,
        dataFields: dataFields.map((field, i) =>
          i === dataFieldIndex ? { ...field, choices: [...(field.choices || []), ''] } : field
        ),
      };
    });
  };

  const updateChoice = (dataFieldIndex: number, choiceIndex: number, value: string) => {
    setServiceData(prev => {
      const dataFields = prev.dataFields || [];
      return {
        ...prev,
        dataFields: dataFields.map((field, i) =>
          i === dataFieldIndex
            ? {
                ...field,
                choices: (field.choices || []).map((choice, j) =>
                  j === choiceIndex ? value : choice
                ),
              }
            : field
        ),
      };
    });
  };

  const removeChoice = (dataFieldIndex: number, choiceIndex: number) => {
    setServiceData(prev => {
      const dataFields = prev.dataFields || [];
      return {
        ...prev,
        dataFields: dataFields.map((field, i) =>
          i === dataFieldIndex
            ? { ...field, choices: (field.choices || []).filter((_, j) => j !== choiceIndex) }
            : field
        ),
      };
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            {isEditing ? 'Modifier le service' : 'Créer un nouveau service'}
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField
                id="service-label"
                label="Libellé du service"
                value={serviceData.service_label}
                onChange={e => setServiceData(prev => ({ ...prev, service_label: e.target.value }))}
                placeholder="Ex: Assurance RC Pro"
                error={!!errors.service_label}
                hint={errors.service_label}
                required
              />

              <InputField
                id="service-description"
                label="Description"
                value={serviceData.service_description}
                onChange={e =>
                  setServiceData(prev => ({ ...prev, service_description: e.target.value }))
                }
                placeholder="Description du service"
              />
            </div>

            {/* Data Requirements */}
            <div className="space-y-4">
              <StyledCheckbox
                id="requires-data"
                checked={serviceData.requires_data}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setServiceData(prev => ({ ...prev, requires_data: e.target.checked }))
                }
                label="Ce service nécessite des données du consultant"
              />

              {serviceData.requires_data && (
                <div className="pl-7 space-y-6 border-l-2 border-blue-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-medium text-gray-700">Champs de données</h2>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={addDataField}
                      className="flex items-center space-x-1"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Ajouter un champ</span>
                    </Button>
                  </div>

                  {(serviceData.dataFields || []).length === 0 && (
                    <p className="text-sm text-gray-500 italic">
                      Cliquez sur &quot;Ajouter un champ&quot; pour créer des champs de données
                    </p>
                  )}

                  {(serviceData.dataFields || []).map((dataField, dataFieldIndex) => (
                    <div key={dataFieldIndex} className="space-y-4 border-b border-gray-200 pb-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-gray-700">
                          Champ {dataFieldIndex + 1}
                        </h3>
                        <button
                          type="button"
                          onClick={() => removeDataField(dataFieldIndex)}
                          className="text-red-600 hover:text-red-700 p-1 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label
                            htmlFor={`data-type-${dataFieldIndex}`}
                            className="text-sm font-medium text-gray-700"
                          >
                            Type de données *
                          </label>
                          <select
                            id={`data-type-${dataFieldIndex}`}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={dataField.data_type}
                            onChange={e =>
                              updateDataField(dataFieldIndex, {
                                data_type: e.target.value as 'TEXT' | 'NUMBER' | 'SELECT' | 'RADIO',
                              })
                            }
                          >
                            <option value="TEXT">Texte libre</option>
                            <option value="NUMBER">Numérique</option>
                            <option value="RADIO">Choix unique</option>
                            <option value="SELECT">Choix multiple</option>
                          </select>
                        </div>

                        <div className="space-y-2">
                          <InputField
                            id={`data-label-${dataFieldIndex}`}
                            label="Label du champ"
                            value={dataField.label}
                            onChange={e =>
                              updateDataField(dataFieldIndex, { label: e.target.value })
                            }
                            placeholder="Ex: Niveau d'expérience"
                            error={!!errors[`dataLabel_${dataFieldIndex}`]}
                            hint={errors[`dataLabel_${dataFieldIndex}`]}
                            required
                          />
                        </div>
                      </div>

                      <TextAreaField
                        id={`data-description-${dataFieldIndex}`}
                        label="Description du champ"
                        value={dataField.description}
                        onChange={e =>
                          updateDataField(dataFieldIndex, { description: e.target.value })
                        }
                        placeholder="Instructions pour le freelance"
                        rows={3}
                      />

                      {(dataField.data_type === 'RADIO' || dataField.data_type === 'SELECT') && (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h2 className="text-sm font-medium text-gray-700">
                              Options disponibles *
                            </h2>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => addChoice(dataFieldIndex)}
                              className="flex items-center space-x-1"
                            >
                              <Plus className="h-4 w-4" />
                              <span>Ajouter</span>
                            </Button>
                          </div>

                          {(dataField.choices || []).map((choice, choiceIndex) => (
                            <div key={choiceIndex} className="flex items-center space-x-2">
                              <input
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={choice}
                                onChange={e =>
                                  updateChoice(dataFieldIndex, choiceIndex, e.target.value)
                                }
                                placeholder={`Option ${choiceIndex + 1}`}
                              />
                              <button
                                type="button"
                                onClick={() => removeChoice(dataFieldIndex, choiceIndex)}
                                className="text-red-600 hover:text-red-700 p-1 transition-colors"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          ))}

                          {(!dataField.choices || dataField.choices.length === 0) && (
                            <p className="text-sm text-gray-500 italic">
                              Cliquez sur &quot;Ajouter&quot; pour créer des options
                            </p>
                          )}

                          {errors[`choices_${dataFieldIndex}`] && (
                            <p className="text-sm text-red-600">
                              {errors[`choices_${dataFieldIndex}`]}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                  {errors.dataFields && <p className="text-sm text-red-600">{errors.dataFields}</p>}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
          <Button variant="outline" onClick={handleClose}>
            Annuler
          </Button>
          <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white">
            {isEditing ? 'Mettre à jour' : 'Créer le service'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AddServiceModal;
