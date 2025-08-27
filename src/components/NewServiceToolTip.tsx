'use client';
import { Info, X } from 'lucide-react';
import { useState } from 'react';

import type { NewServiceData } from '@/types/platform';

interface NewServiceToolTipProps {
  service: NewServiceData;
}

const NewServiceToolTip = ({ service }: NewServiceToolTipProps) => {
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
              <h3 className="font-medium text-gray-900 pr-4">{service.service_label}</h3>
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
              {service.service_description && (
                <div>
                  <span className="font-medium text-gray-800">Description:</span>
                  <span className="text-gray-600 ml-1">{service.service_description}</span>
                </div>
              )}
              {/* Data Requirements */}
              {service.requires_data && (service.dataFields?.length ?? 0) > 0 && (
                <div>
                  <span className="font-medium text-gray-800">Champs de données requis:</span>
                  <div className="text-gray-600 ml-1 space-y-2">
                    {service.dataFields?.map((field, index) => (
                      <div key={index}>
                        <span>{field.label}</span>
                        {field.description && <span>, {field.description}</span>}
                        <span> ({getDataTypeDescription(field.data_type)})</span>
                        {(field.data_type === 'SELECT' || field.data_type === 'RADIO') &&
                          field.choices && field.choices.length > 0 && (
                            <span>. Options: {field.choices.filter(c => c.trim() !== '').join(', ')}</span>
                          )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {/* Show what happens when no data is required */}
              {!service.requires_data && (
                <div>
                  <span className="font-medium text-gray-800">Données requises:</span>
                  <span className="text-gray-600 ml-1">
                    Aucune donnée requise. Ce service ne nécessite aucune information supplémentaire
                    de la part du freelance
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

export default NewServiceToolTip;