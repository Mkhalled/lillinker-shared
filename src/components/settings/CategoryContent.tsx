import React from 'react';
import { CotisationType } from '@prisma/client';

import InputField from '@/components/form/input/InputField';
import TextAreaField from '@/components/form/input/TextAreaField';
import { StyledSelect } from '@/components/form/StyledSelect';
import { hasIncompleteCotisations, canAddCotisation } from '@/validations/organismes.validation';
import CollapsibleRow from './CollapsibleRow';

// Simple SVG icons
const PlusIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const TrashIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

// Types
interface SubCategory {
  id: number;
  label: string;
  description: string;
  type: CotisationType;
  pourcentage_salarial: number | null;
  pourcentage_patronal: number | null;
}

interface Category {
  id: number;
  label: string;
  description: string;
  cotisations: SubCategory[];
}

interface CategoryContentProps {
  category: Category;
  updateCategoryName: (id: number, label: string) => void;
  updateCategoryDescription: (id: number, desc: string) => void;
  removeCategory: (id: number) => void;
  getCotisationValidationMessage: (cat: Category) => string | null;
  addSubCategory: (id: number) => void;
  updateSubCategory: (catId: number, subId: number, updates: Partial<SubCategory>) => void;
  removeSubCategory: (catId: number, subId: number) => void;
}

// Component to render cotisation content
const CotisationContent = ({ 
  category, 
  cotisation, 
  updateSubCategory, 
  removeSubCategory 
}: {
  category: Category;
  cotisation: SubCategory;
  updateSubCategory: (catId: number, subId: number, updates: Partial<SubCategory>) => void;
  removeSubCategory: (catId: number, subId: number) => void;
}) => (
  <div className="flex items-start space-x-4">
    <div className="flex-1">
      <div className="space-y-4 mb-4">
        {/* First row: Label and Type */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <InputField
            label="Libellé"
            type="text"
            value={cotisation.label}
            onChange={(e) => updateSubCategory(category.id, cotisation.id, { label: e.target.value })}
            placeholder="Libellé de la cotisation"
            error={!cotisation.label.trim()}
            hint={!cotisation.label.trim() ? "Le libellé est obligatoire" : ""}
            required
          />
          <StyledSelect
            label="Type"
            value={cotisation.type}
            onChange={(e) => updateSubCategory(category.id, cotisation.id, { type: e.target.value as CotisationType })}
            options={[
              { value: CotisationType.PATRONAL, label: 'Patronale uniquement' },
              { value: CotisationType.SALARIAL, label: 'Salariale uniquement' },
              { value: CotisationType.DEUX, label: 'Patronale et salariale' },
            ]}
            required
          />
        </div>
        
        {/* Second row: Description (full width) */}
        <TextAreaField
          label="Description"
          value={cotisation.description}
          onChange={(e) => updateSubCategory(category.id, cotisation.id, { description: e.target.value })}
          placeholder="Description de la cotisation"
          rows={2}
        />
      </div>

      {/* Percentage Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {(cotisation.type === CotisationType.PATRONAL || cotisation.type === CotisationType.DEUX) && (
          <InputField
            label="Taux patronal (%)"
            type="number"
            value={cotisation.pourcentage_patronal || ''}
            onChange={(e) => updateSubCategory(category.id, cotisation.id, { 
              pourcentage_patronal: e.target.value ? parseFloat(e.target.value) : null 
            })}
            placeholder="0.00"
            min="0"
            max="100"
            step="0.01"
            error={cotisation.pourcentage_patronal === null || cotisation.pourcentage_patronal === undefined}
            hint={
              (cotisation.pourcentage_patronal === null || cotisation.pourcentage_patronal === undefined) 
                ? "Le taux patronal est obligatoire" 
                : ""
            }
            required
          />
        )}

        {(cotisation.type === CotisationType.SALARIAL || cotisation.type === CotisationType.DEUX) && (
          <InputField
            label="Taux salarial (%)"
            type="number"
            value={cotisation.pourcentage_salarial || ''}
            onChange={(e) => updateSubCategory(category.id, cotisation.id, { 
              pourcentage_salarial: e.target.value ? parseFloat(e.target.value) : null 
            })}
            placeholder="0.00"
            min="0"
            max="100"
            step="0.01"
            error={cotisation.pourcentage_salarial === null || cotisation.pourcentage_salarial === undefined}
            hint={
              (cotisation.pourcentage_salarial === null || cotisation.pourcentage_salarial === undefined) 
                ? "Le taux salarial est obligatoire" 
                : ""
            }
            required
          />
        )}
      </div>
    </div>
    <button
      onClick={() => {
        // Only show confirmation for saved cotisations (positive IDs)
        if (cotisation.id > 0) {
          if (window.confirm(`Êtes-vous sûr de vouloir supprimer la cotisation "${cotisation.label}" ? Cette action est irréversible.`)) {
            removeSubCategory(category.id, cotisation.id);
          }
        } else {
          // For new/unsaved cotisations, delete directly without confirmation
          removeSubCategory(category.id, cotisation.id);
        }
      }}
      className="p-2 text-gray-400 hover:text-red-600 focus:outline-none"
    >
      <TrashIcon className="h-4 w-4" />
    </button>
  </div>
);

// Main CategoryContent component
const CategoryContent: React.FC<CategoryContentProps> = ({ 
  category, 
  updateCategoryName, 
  updateCategoryDescription, 
  removeCategory, 
  getCotisationValidationMessage, 
  addSubCategory, 
  updateSubCategory, 
  removeSubCategory 
}) => (
  <>
    {/* Category Header */}
    <div className="p-6 border-b border-gray-200">
      <div className="flex items-start space-x-4">
        <div className="flex-1">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <InputField
              label="Nom de l'organisme"
              type="text"
              value={category.label}
              onChange={(e) => updateCategoryName(category.id, e.target.value)}
              placeholder="Saisir le nom de l'organisme"
              error={!category.label.trim()}
              hint={!category.label.trim() ? "Le nom de l'organisme est obligatoire" : ""}
              required
            />
            <TextAreaField
              label="Description"
              value={category.description}
              onChange={(e) => updateCategoryDescription(category.id, e.target.value)}
              placeholder="Saisir la description"
              rows={2}
            />
          </div>
          {/* Validation message */}
          {getCotisationValidationMessage(category) && (
            <div className="mt-2 text-red-600 text-sm font-medium bg-red-50 p-2 rounded border border-red-200">
              ⚠️ {getCotisationValidationMessage(category)}
            </div>
          )}
        </div>
        <button
          onClick={() => {
            // Only show confirmation for saved organismes (positive IDs)
            if (category.id > 0) {
              if (window.confirm(`Êtes-vous sûr de vouloir supprimer l'organisme "${category.label}" et toutes ses cotisations ? Cette action est irréversible.`)) {
                removeCategory(category.id);
              }
            } else {
              // For new/unsaved organismes, delete directly without confirmation
              removeCategory(category.id);
            }
          }}
          className="p-2 text-gray-400 hover:text-red-600 focus:outline-none"
        >
          <TrashIcon className="h-5 w-5" />
        </button>
      </div>
    </div>

    {/* Cotisations Section */}
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900">Cotisations</h3>
        <button
          onClick={() => addSubCategory(category.id)}
          disabled={!canAddCotisation(category)}
          className={`inline-flex items-center px-3 py-2 border text-sm font-medium rounded-md focus:outline-none ${
            !canAddCotisation(category)
              ? 'border-gray-200 text-gray-400 bg-gray-100 cursor-not-allowed'
              : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:ring-2 focus:ring-[var(--primary-color)] focus:ring-offset-2'
          }`}
          title={
            !category.label.trim() 
              ? "Veuillez d'abord saisir le nom de l'organisme" 
              : hasIncompleteCotisations(category)
              ? "Veuillez d'abord compléter toutes les cotisations existantes"
              : ""
          }
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Ajouter une cotisation
        </button>
      </div>
      
      {category.cotisations.length === 0 ? (
        <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-md">
          Aucune cotisation ajoutée pour le moment
        </div>
      ) : (
        <div className="space-y-4">
          {category.cotisations.map((cotisation) => (
            <div key={cotisation.id}>
              {/* Only wrap in CollapsibleRow if cotisation is complete (has positive ID, meaning it's saved) */}
              {cotisation.id > 0 && cotisation.label.trim() ? (
                <CollapsibleRow title={cotisation.label}>
                  <CotisationContent 
                    category={category}
                    cotisation={cotisation}
                    updateSubCategory={updateSubCategory}
                    removeSubCategory={removeSubCategory}
                  />
                </CollapsibleRow>
              ) : (
                /* New/unsaved cotisations (negative IDs) should not be collapsed */
                <div className="border border-gray-200 rounded-md p-4 bg-gray-50">
                  <CotisationContent 
                    category={category}
                    cotisation={cotisation}
                    updateSubCategory={updateSubCategory}
                    removeSubCategory={removeSubCategory}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  </>
);

export default CategoryContent;
