'use client';

import { Plus, Trash2, X } from 'lucide-react';
import { useState } from 'react';

import { StyledCheckbox } from '../form/StyledCheckbox';
import { Button } from '../ui/button/Button';
import InputField from '../form/input/InputField';
import TextAreaField from '../form/input/TextAreaField';

interface NewService {
  id: string
  label: string
  description: string
  requiresData: boolean
  dataType: string
  dataLabel: string
  dataDescription: string
  choices: string[]
}

interface AddServiceModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (service: NewService) => void
}

const AddServiceModal = ({ isOpen, onClose, onSave }: AddServiceModalProps) => {
  const [serviceData, setServiceData] = useState<NewService>({
    id: Date.now().toString(),
    label: "",
    description: "",
    requiresData: false,
    dataType: "TEXT",
    dataLabel: "",
    dataDescription: "",
    choices: []
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSave = () => {
    const newErrors: Record<string, string> = {}

    // Validation
    if (!serviceData.label.trim()) {
      newErrors.label = "Le libellé est requis"
    }

    if (serviceData.requiresData) {
      if (!serviceData.dataLabel.trim()) {
        newErrors.dataLabel = "Le label du champ est requis"
      }
      if ((serviceData.dataType === "RADIO" || serviceData.dataType === "SELECT") && 
          serviceData.choices.filter(c => c.trim() !== "").length < 2) {
        newErrors.choices = "Au moins 2 options sont requises"
      }
    }

    setErrors(newErrors)

    if (Object.keys(newErrors).length === 0) {
      onSave({
        ...serviceData,
        choices: serviceData.choices.filter(c => c.trim() !== "")
      })
      handleClose()
    }
  }

  const handleClose = () => {
    setServiceData({
      id: Date.now().toString(),
      label: "",
      description: "",
      requiresData: false,
      dataType: "TEXT",
      dataLabel: "",
      dataDescription: "",
      choices: []
    })
    setErrors({})
    onClose()
  }

  const addChoice = () => {
    setServiceData(prev => ({
      ...prev,
      choices: [...prev.choices, ""]
    }))
  }

  const updateChoice = (index: number, value: string) => {
    setServiceData(prev => ({
      ...prev,
      choices: prev.choices.map((choice, i) => i === index ? value : choice)
    }))
  }

  const removeChoice = (index: number) => {
    setServiceData(prev => ({
      ...prev,
      choices: prev.choices.filter((_, i) => i !== index)
    }))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Créer un nouveau service</h3>
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
                value={serviceData.label}
                onChange={(e) => setServiceData(prev => ({ ...prev, label: e.target.value }))}
                placeholder="Ex: Assurance RC Pro"
                error={!!errors.label}
                hint={errors.label}
                required
              />

              <InputField
                id="service-description"
                label="Description"
                value={serviceData.description}
                onChange={(e) => setServiceData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Description du service"
              />
            </div>

            {/* Data Requirements */}
            <div className="space-y-4">
              <StyledCheckbox
                id="requires-data"
                checked={serviceData.requiresData}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setServiceData(prev => ({ ...prev, requiresData: e.target.checked }))}
                label="Ce service nécessite des données du consultant"
              />

              {serviceData.requiresData && (
                <div className="pl-7 space-y-4 border-l-2 border-blue-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="data-type" className="text-sm font-medium text-gray-700">
                        Type de données *
                      </label>
                      <select
                        id="data-type"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={serviceData.dataType}
                        onChange={(e) => setServiceData(prev => ({ ...prev, dataType: e.target.value }))}
                      >
                        <option value="TEXT">Texte libre</option>
                        <option value="NUMBER">Numérique</option>
                        <option value="RADIO">Choix unique</option>
                        <option value="SELECT">Choix multiple</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                    <InputField
                      id="data-label"
                      label="Label du champ"
                      value={serviceData.dataLabel}
                      onChange={(e) => setServiceData(prev => ({ ...prev, dataLabel: e.target.value }))}
                      placeholder="Ex: Niveau d'expérience"
                      error={!!errors.dataLabel}
                      hint={errors.dataLabel}
                      required
                    />
                    </div>
                  </div>

                  <TextAreaField
                    id="data-description"
                    label="Description du champ"
                    value={serviceData.dataDescription}
                    onChange={(e) => setServiceData(prev => ({ ...prev, dataDescription: e.target.value }))}
                    placeholder="Instructions pour le freelance"
                    rows={3}
                  />

                  {/* Choices for RADIO and SELECT */}
                  {(serviceData.dataType === "RADIO" || serviceData.dataType === "SELECT") && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h2  className="text-sm font-medium text-gray-700">
                          Options disponibles *
                        </h2>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={addChoice}
                          className="flex items-center space-x-1"
                        >
                          <Plus className="h-4 w-4" />
                          <span>Ajouter</span>
                        </Button>
                      </div>

                      {serviceData.choices.map((choice, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <input
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={choice}
                            onChange={(e) => updateChoice(index, e.target.value)}
                            placeholder={`Option ${index + 1}`}
                          />
                          <button
                            type="button"
                            onClick={() => removeChoice(index)}
                            className="text-red-600 hover:text-red-700 p-1 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}

                      {serviceData.choices.length === 0 && (
                        <p className="text-sm text-gray-500 italic">
                          Cliquez sur &quot;Ajouter&quot; pour créer des options
                        </p>
                      )}

                      {errors.choices && <p className="text-sm text-red-600">{errors.choices}</p>}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
          <Button
            variant="outline"
            onClick={handleClose}
          >
            Annuler
          </Button>
          <Button
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Créer le service
          </Button>
        </div>
      </div>
    </div>
  )
}

export default AddServiceModal
