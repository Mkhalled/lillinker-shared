import { CotisationType } from '@prisma/client';
import { useState, useEffect } from 'react';

import { OrganismeWithCotisations, CreateOrganismeRequest } from '@/types/organisme';
import {
  isOrganismeValid,
  hasIncompleteOrganismes,
  getCotisationValidationMessage,
} from '@/validations/organismes.validation';

import CategoryContent from './CategoryContent';
import CollapsibleRow from './CollapsibleRow';

// Simple SVG icons
const PlusIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

// Map the backend types to form types
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

const OrganismesForm = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [nextCategoryId, setNextCategoryId] = useState(-1);
  const [nextCotisationId, setNextCotisationId] = useState(-1);

  // Fetch organismes on component mount
  useEffect(() => {
    fetchOrganismes();
  }, []);

  const fetchOrganismes = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/company/admin/organismes');
      const result = await response.json();

      if (result.success) {
        // Transform backend data to form data
        const transformedData = result.data.map((organisme: OrganismeWithCotisations) => ({
          id: organisme.id,
          label: organisme.label,
          description: organisme.description || '',
          cotisations: organisme.cotisations.map(cotisation => ({
            id: cotisation.id,
            label: cotisation.label,
            description: cotisation.description || '',
            type: cotisation.type,
            pourcentage_salarial: cotisation.pourcentage_salarial,
            pourcentage_patronal: cotisation.pourcentage_patronal,
          })),
        }));
        setCategories(transformedData);
      } else {
        console.error('Failed to fetch organismes:', result.error);
      }
    } catch (error) {
      console.error('Error fetching organismes:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveOrganisme = async (organisme: Category) => {
    try {
      // Frontend validation: ensure at least one cotisation exists
      if (organisme.cotisations.length === 0) {
        return {
          success: false,
          error: 'Au moins une cotisation est requise pour créer un organisme.',
        };
      }

      // Validate that all cotisations have required fields
      for (const cotisation of organisme.cotisations) {
        if (!cotisation.label.trim()) {
          return { success: false, error: 'Toutes les cotisations doivent avoir un libellé.' };
        }
        if (!cotisation.type) {
          return {
            success: false,
            error: 'Toutes les cotisations doivent avoir un type sélectionné.',
          };
        }

        // Validate required percentage fields based on type
        if (
          cotisation.type === CotisationType.PATRONAL ||
          cotisation.type === CotisationType.DEUX
        ) {
          if (
            cotisation.pourcentage_patronal === null ||
            cotisation.pourcentage_patronal === undefined
          ) {
            return {
              success: false,
              error: `La cotisation "${cotisation.label}" nécessite un taux patronal.`,
            };
          }
        }

        if (
          cotisation.type === CotisationType.SALARIAL ||
          cotisation.type === CotisationType.DEUX
        ) {
          if (
            cotisation.pourcentage_salarial === null ||
            cotisation.pourcentage_salarial === undefined
          ) {
            return {
              success: false,
              error: `La cotisation "${cotisation.label}" nécessite un taux salarial.`,
            };
          }
        }
      }

      const requestData: CreateOrganismeRequest = {
        label: organisme.label,
        description: organisme.description,
        cotisations: organisme.cotisations.map(cotisation => ({
          label: cotisation.label,
          description: cotisation.description,
          type: cotisation.type,
          pourcentage_salarial: cotisation.pourcentage_salarial ?? undefined,
          pourcentage_patronal: cotisation.pourcentage_patronal ?? undefined,
          // Don't send the temporary frontend ID - let the database auto-increment
        })),
      };

      let response;
      if (organisme.id && organisme.id > 0) {
        // Update existing organisme
        response = await fetch(`/api/company/admin/organismes/${organisme.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestData),
        });
      } else {
        // Create new organisme
        response = await fetch('/api/company/admin/organismes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestData),
        });
      }

      const result = await response.json();
      if (result.success) {
        await fetchOrganismes(); // Refresh the list
        return { success: true };
      } else {
        console.error('Failed to save organisme:', result.error);
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Error saving organisme:', error);
      return { success: false, error: "Une erreur est survenue lors de l'enregistrement." };
    }
  };

  const deleteOrganisme = async (organismeId: number) => {
    try {
      const response = await fetch(`/api/company/admin/organismes/${organismeId}`, {
        method: 'DELETE',
      });

      const result = await response.json();
      if (result.success) {
        await fetchOrganismes(); // Refresh the list
        return true;
      } else {
        console.error('Failed to delete organisme:', result.error);
        return false;
      }
    } catch (error) {
      console.error('Error deleting organisme:', error);
      return false;
    }
  };

  const addCategory = () => {
    const newCategory: Category = {
      id: nextCategoryId, // Use auto-incrementing negative ID
      label: '',
      description: '',
      cotisations: [],
    };
    setCategories([...categories, newCategory]);
    setNextCategoryId(nextCategoryId - 1); // Decrement for next category
  };

  const updateCategoryName = (categoryId: number, label: string) => {
    setCategories(categories.map(cat => (cat.id === categoryId ? { ...cat, label } : cat)));
  };

  const updateCategoryDescription = (categoryId: number, description: string) => {
    setCategories(categories.map(cat => (cat.id === categoryId ? { ...cat, description } : cat)));
  };

  const addSubCategory = (categoryId: number) => {
    const newSubCategory: SubCategory = {
      id: nextCotisationId, // Use auto-incrementing negative ID for React keys
      label: '',
      description: '',
      type: CotisationType.DEUX,
      pourcentage_salarial: null,
      pourcentage_patronal: null,
    };

    setCategories(
      categories.map(cat =>
        cat.id === categoryId ? { ...cat, cotisations: [...cat.cotisations, newSubCategory] } : cat
      )
    );
    setNextCotisationId(nextCotisationId - 1); // Decrement for next cotisation
  };

  const updateSubCategory = (
    categoryId: number,
    subCategoryId: number,
    updates: Partial<SubCategory>
  ) => {
    setCategories(
      categories.map(cat =>
        cat.id === categoryId
          ? {
              ...cat,
              cotisations: cat.cotisations.map(sub =>
                sub.id === subCategoryId ? { ...sub, ...updates } : sub
              ),
            }
          : cat
      )
    );
  };

  const removeCategory = async (categoryId: number) => {
    if (categoryId > 0) {
      // Delete from backend (positive IDs are existing organismes)
      const success = await deleteOrganisme(categoryId);
      if (!success) {
        // Could add inline error handling here instead of alert
        console.error("Échec de la suppression de l'organisme");
        return;
      }
    } else {
      // Remove from local state (negative IDs are new, unsaved categories)
      setCategories(categories.filter(cat => cat.id !== categoryId));
    }
  };

  const removeSubCategory = (categoryId: number, subCategoryId: number) => {
    setCategories(
      categories.map(cat =>
        cat.id === categoryId
          ? {
              ...cat,
              cotisations: cat.cotisations.filter(sub => sub.id !== subCategoryId),
            }
          : cat
      )
    );
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setSaveMessage(null);
      let allSuccess = true;
      const errors: string[] = [];

      for (const category of categories) {
        if (category.label.trim()) {
          // Only save categories with names
          // Validate before saving
          if (category.cotisations.length === 0) {
            errors.push(`L'organisme "${category.label}" doit avoir au moins une cotisation.`);
            allSuccess = false;
            continue;
          }

          // Check if all cotisations have required fields
          const invalidCotisations = category.cotisations.filter(cot => {
            // Check basic required fields
            if (!cot.label.trim() || !cot.type) {
              return true;
            }

            // Check required percentage fields based on type
            if (cot.type === CotisationType.PATRONAL || cot.type === CotisationType.DEUX) {
              if (cot.pourcentage_patronal === null || cot.pourcentage_patronal === undefined) {
                return true;
              }
            }

            if (cot.type === CotisationType.SALARIAL || cot.type === CotisationType.DEUX) {
              if (cot.pourcentage_salarial === null || cot.pourcentage_salarial === undefined) {
                return true;
              }
            }

            return false;
          });

          if (invalidCotisations.length > 0) {
            errors.push(
              `L'organisme "${category.label}" a des cotisations avec des champs obligatoires manquants (libellé, type ou taux requis).`
            );
            allSuccess = false;
            continue;
          }

          const result = await saveOrganisme(category);
          if (!result.success) {
            errors.push(
              `Échec de l'enregistrement de l'organisme "${category.label}": ${result.error}`
            );
            allSuccess = false;
          }
        }
      }

      if (allSuccess) {
        setSaveMessage({ type: 'success', message: 'Organismes enregistrés avec succès!' });
        await fetchOrganismes(); // Refresh the list
      } else {
        const errorMessage =
          errors.length > 0
            ? errors.join('\n')
            : "Certains organismes n'ont pas pu être enregistrés. Veuillez vérifier et réessayer.";
        setSaveMessage({ type: 'error', message: errorMessage });
      }
    } catch (error) {
      console.error('Error saving organismes:', error);
      setSaveMessage({
        type: 'error',
        message: "Une erreur est survenue lors de l'enregistrement. Veuillez réessayer.",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-gray-600">Chargement...</div>
      </div>
    );
  }

  // Calculate if button should be disabled
  const hasIncompleteOrgs = hasIncompleteOrganismes(categories);

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Gestion des Organismes</h1>
            <p className="text-gray-600 mt-1">Configurer les catégories et taux de cotisations</p>
          </div>
          <button
            onClick={addCategory}
            disabled={hasIncompleteOrgs}
            className={`inline-flex items-center px-4 py-2 text-white text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              hasIncompleteOrgs
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-[var(--primary-color)] hover:bg-[var(--primary-hover)] focus:ring-[var(--primary-color)]'
            }`}
            title={
              hasIncompleteOrgs
                ? "Veuillez d'abord compléter tous les organismes existants (nom + au moins une cotisation complète)"
                : ''
            }
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Ajouter un organisme
          </button>
        </div>
      </div>

      {/* Categories List */}
      <div className="space-y-6">
        {categories.map(category => (
          <div
            key={category.id}
            className={`border rounded-lg bg-white ${
              isOrganismeValid(category) ? 'border-gray-200' : 'border-red-300'
            }`}
          >
            {/* Only wrap in CollapsibleRow if category is saved (positive ID) AND has a label */}
            {category.id > 0 && category.label.trim() ? (
              <CollapsibleRow title={category.label}>
                <CategoryContent
                  category={category}
                  updateCategoryName={updateCategoryName}
                  updateCategoryDescription={updateCategoryDescription}
                  removeCategory={removeCategory}
                  getCotisationValidationMessage={getCotisationValidationMessage}
                  addSubCategory={addSubCategory}
                  updateSubCategory={updateSubCategory}
                  removeSubCategory={removeSubCategory}
                />
              </CollapsibleRow>
            ) : (
              /* New/unsaved categories (negative IDs) should not be collapsed */
              <CategoryContent
                category={category}
                updateCategoryName={updateCategoryName}
                updateCategoryDescription={updateCategoryDescription}
                removeCategory={removeCategory}
                getCotisationValidationMessage={getCotisationValidationMessage}
                addSubCategory={addSubCategory}
                updateSubCategory={updateSubCategory}
                removeSubCategory={removeSubCategory}
              />
            )}
          </div>
        ))}
      </div>

      {/* Save Button */}
      <div className="mt-8">
        {/* Save Message */}
        {saveMessage && (
          <div
            className={`mb-4 p-4 rounded-md ${
              saveMessage.type === 'success'
                ? 'bg-green-50 border border-green-200 text-green-800'
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}
          >
            <div className="whitespace-pre-line">{saveMessage.message}</div>
          </div>
        )}

        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center px-6 py-2 bg-[var(--primary-color)] text-white text-sm font-medium rounded-md hover:bg-[var(--primary-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrganismesForm;
