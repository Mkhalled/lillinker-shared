'use client';

import { Info, X } from 'lucide-react';
import { useState } from 'react';

interface ServiceInfoTooltipProps {
  service: {
    id: number;
    label: string;
    description: string | null;
    data_type: string;
    requires_data: boolean;
    data_label: string;
    data_description: string | null;
    choices: unknown;
    user ?: {
      first_name: string;
      last_name: string;
      ownedCompany: {
        name: string;
      } | null;
    };
  };
}

const ServiceInfoTooltip = ({ service }: ServiceInfoTooltipProps) => {
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

  const parseChoices = (choices: unknown): string[] => {
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
        type="button"
      >
        <Info className="h-4 w-4" />
      </button>

      {/* Tooltip Modal */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-25 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Tooltip Content - Compact design */}
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 bg-white border border-gray-200 rounded-lg shadow-xl p-4 overflow-y-auto max-w-md w-full max-h-[70vh]">
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-medium text-gray-900 pr-4">{service.label}</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
                type="button"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 text-sm">
              {/* Description */}
              {service.description && (
                <div>
                  <span className="font-medium text-gray-800">Description:</span>
                  <span className="text-gray-600 ml-1">{service.description}</span>
                </div>
              )}

              {/* Data Type */}
              <div>
                <span className="font-medium text-gray-800">Type de données:</span>
                <span className="text-gray-600 ml-1">{getDataTypeDescription(service.data_type)}</span>
              </div>

              {/* Data Requirements */}
              {service.requires_data && (
                <div>
                  <span className="font-medium text-gray-800">Données requises:</span>
                  <div className="text-gray-600 ml-1">
                    {service.data_label && <span>{service.data_label}</span>}
                    {service.data_description && (
                      <span>{service.data_label ? ', ' : ''}{service.data_description}</span>
                    )}
                    
                    {/* Show choices for SELECT and RADIO types */}
                    {(service.data_type === 'SELECT' || service.data_type === 'RADIO') && parseChoices(service.choices).length > 0 && (
                      <span>. Options: {parseChoices(service.choices).join(', ')}</span>
                    )}
                    
                    {/* Show example for TEXT type */}
                    {service.data_type === 'TEXT' && (
                      <span>. Format: Texte libre (ex: description, commentaire, adresse)</span>
                    )}

                    {/* Show format for NUMBER type */}
                    {service.data_type === 'NUMBER' && (
                      <span>. Format: Valeur numérique (ex: 25, 1500.50, 3)</span>
                    )}
                  </div>
                </div>
              )}

              {/* Show what happens when no data is required */}
              {!service.requires_data && (
                <div>
                  <span className="font-medium text-gray-800">Données requises:</span>
                  <span className="text-gray-600 ml-1">Aucune donnée requise. Ce service ne nécessite aucune information supplémentaire de la part du freelance</span>
                </div>
              )}

              {/* Provider */}
              {service.user?.ownedCompany && (
                <div className="pt-2 border-t border-gray-200">
                  <span className="font-medium text-gray-800">Proposé par:</span>
                  <span className="text-gray-600 ml-1">{service.user.ownedCompany.name}</span>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ServiceInfoTooltip;
