'use client';

import { Info, X } from 'lucide-react';
import { useState } from 'react';

import type { OptionInfo } from '../../types/demande';

const OptionInfoTooltip = ({ option }: { option: OptionInfo }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  const getDataTypeDescription = (dataType: string) => {
    switch (dataType) {
      case 'TEXT':
        return 'Champ de texte libre - Le freelance saisit du texte (description, adresse, commentaire...)';
      case 'NUMBER':
        return 'Champ numérique - Le freelance saisit une valeur numérique (âge, montant, quantité...)';
      case 'SELECT':
        return 'Choix multiple - Le freelance peut sélectionner une ou plusieurs options prédéfinies';
      case 'RADIO':
        return 'Choix unique - Le freelance sélectionne une seule option parmi les choix proposés';
      default:
        return 'Type de données non spécifié';
    }
  };

  const parseChoices = (choices: unknown) => {
    if (!choices) return [];
    if (typeof choices === 'string') {
      try {
        return JSON.parse(choices);
      } catch {
        return [choices];
      }
    }
    if (Array.isArray(choices)) return choices;
    return [];
  };

  return (
    <div className="relative">
      {/* Info Button */}
      <button
        onClick={handleToggle}
        className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
        title="Plus d'informations"
      >
        <Info size={16} />
      </button>

      {/* Modal */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-25 z-40"
            onClick={handleToggle}
          />

          {/* Modal Content */}
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 bg-white border border-gray-200 rounded-lg shadow-xl p-4 overflow-y-auto max-w-md w-full max-h-[70vh]">
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-medium text-gray-900 pr-4">{option.platformService.label}</h3>
              <button
                onClick={handleToggle}
                className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
                type="button"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 text-sm">
              {/* Service Label */}
              <div>
                <span className="font-medium text-gray-800">Service:</span>
                <span className="text-gray-600 ml-1">{option.platformService.label}</span>
              </div>

              {/* Option Description */}
              {option.description && (
                <div>
                  <span className="font-medium text-gray-800">Description de l&apos;option:</span>
                  <span className="text-gray-600 ml-1">{option.description}</span>
                </div>
              )}

              {/* Service Description */}
              {option.platformService.description && (
                <div>
                  <span className="font-medium text-gray-800">Description du service:</span>
                  <span className="text-gray-600 ml-1">{option.platformService.description}</span>
                </div>
              )}

              {/* Data Fields */}
              {option.platformService.requires_data && option.platformService.dataFields && option.platformService.dataFields.length > 0 && (
                <div>
                  <span className="font-medium text-gray-800">Données requises:</span>
                  <div className="text-gray-600 ml-1 space-y-1">
                    {option.platformService.dataFields.map((field, index) => (
                      <div key={field.id} className="pl-2 border-l-2 border-gray-200">
                        <div className="font-medium">{field.label}</div>
                        {field.description && (
                          <div className="text-xs text-gray-500">{field.description}</div>
                        )}
                        <div className="text-xs">
                          Type: {getDataTypeDescription(field.data_type)}
                        </div>
                        {(field.data_type === 'SELECT' || field.data_type === 'RADIO') &&
                          field.choices && field.choices.length > 0 && (
                            <div className="text-xs">
                              Options: {field.choices.join(', ')}
                            </div>
                          )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Show what happens when no data is required */}
              {!option.platformService.requires_data && (
                <div>
                  <span className="font-medium text-gray-800">Données requises:</span>
                  <span className="text-gray-600 ml-1">
                    Aucune donnée requise. Ce service ne nécessite aucune information supplémentaire
                    de la part du freelance
                  </span>
                </div>
              )}

              {/* Response Data */}
              {option.response_data && (
                <div>
                  <span className="font-medium text-gray-800">Donnée de réponse:</span>
                  <span className="text-gray-600 ml-1">
                    {typeof option.response_data === 'object' && option.response_data !== null
                      ? Object.entries(option.response_data).map(([key, value]) => (
                          <div key={key} className="text-xs">
                            {key}: {Array.isArray(value) ? value.join(', ') : value}
                          </div>
                        ))
                      : option.response_data}
                  </span>
                </div>
              )}

              {/* Provider */}
              {option.platformService.user?.ownedCompany && (
                <div className="pt-2 border-t border-gray-200">
                  <span className="font-medium text-gray-800">Proposé par:</span>
                  <span className="text-gray-600 ml-1">
                    {option.platformService.user.ownedCompany.name}
                  </span>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default OptionInfoTooltip;
