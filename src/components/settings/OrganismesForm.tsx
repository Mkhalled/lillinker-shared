import { useState, useEffect } from 'react';

import { CotisationType } from '@prisma/client';

import { OrganismeWithCotisations, CreateOrganismeRequest } from '@/types/organisme';
import InputField from '@/components/form/input/InputField';
import TextAreaField from '@/components/form/input/TextAreaField';
import { StyledSelect } from '@/components/form/StyledSelect';

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
          }))
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
        alert('At least one cotisation is required to create an organisme.');
        return false;
      }

      // Validate that all cotisations have required fields
      for (const cotisation of organisme.cotisations) {
        if (!cotisation.label.trim()) {
          alert('All cotisations must have a label.');
          return false;
        }
        if (!cotisation.type) {
          alert('All cotisations must have a type selected.');
          return false;
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
        }))
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
        return true;
      } else {
        console.error('Failed to save organisme:', result.error);
        return false;
      }
    } catch (error) {
      console.error('Error saving organisme:', error);
      return false;
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
      cotisations: []
    };
    setCategories([...categories, newCategory]);
    setNextCategoryId(nextCategoryId - 1); // Decrement for next category
  };

  const updateCategoryName = (categoryId: number, label: string) => {
    setCategories(categories.map(cat => 
      cat.id === categoryId ? { ...cat, label } : cat
    ));
  };

  const updateCategoryDescription = (categoryId: number, description: string) => {
    setCategories(categories.map(cat => 
      cat.id === categoryId ? { ...cat, description } : cat
    ));
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

    setCategories(categories.map(cat => 
      cat.id === categoryId 
        ? { ...cat, cotisations: [...cat.cotisations, newSubCategory] }
        : cat
    ));
    setNextCotisationId(nextCotisationId - 1); // Decrement for next cotisation
  };

  const updateSubCategory = (categoryId: number, subCategoryId: number, updates: Partial<SubCategory>) => {
    setCategories(categories.map(cat => 
      cat.id === categoryId 
        ? {
            ...cat,
            cotisations: cat.cotisations.map(sub => 
              sub.id === subCategoryId ? { ...sub, ...updates } : sub
            )
          }
        : cat
    ));
  };

  const removeCategory = async (categoryId: number) => {
    if (categoryId > 0) {
      // Delete from backend (positive IDs are existing organismes)
      const success = await deleteOrganisme(categoryId);
      if (!success) {
        alert('Failed to delete organisme. Please try again.');
        return;
      }
    } else {
      // Remove from local state (negative IDs are new, unsaved categories)
      setCategories(categories.filter(cat => cat.id !== categoryId));
    }
  };

  const removeSubCategory = (categoryId: number, subCategoryId: number) => {
    setCategories(categories.map(cat => 
      cat.id === categoryId 
        ? {
            ...cat,
            cotisations: cat.cotisations.filter(sub => sub.id !== subCategoryId)
          }
        : cat
    ));
  };

  // Validation helper functions
  const isOrganismeValid = (category: Category) => {
    return category.label.trim() && category.cotisations.length > 0 && 
           category.cotisations.every(cot => cot.label.trim() && cot.type);
  };

  const getCotisationValidationMessage = (category: Category) => {
    if (category.label.trim() && category.cotisations.length === 0) {
      return 'At least one cotisation is required';
    }
    return null;
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      let allSuccess = true;
      const errors: string[] = [];

      for (const category of categories) {
        if (category.label.trim()) { // Only save categories with names
          // Validate before saving
          if (category.cotisations.length === 0) {
            errors.push(`Organisme "${category.label}" must have at least one cotisation.`);
            allSuccess = false;
            continue;
          }

          // Check if all cotisations have required fields
          const invalidCotisations = category.cotisations.filter(
            cot => !cot.label.trim() || !cot.type
          );
          
          if (invalidCotisations.length > 0) {
            errors.push(`Organisme "${category.label}" has cotisations with missing label or type.`);
            allSuccess = false;
            continue;
          }

          const success = await saveOrganisme(category);
          if (!success) {
            errors.push(`Failed to save organisme "${category.label}".`);
            allSuccess = false;
          }
        }
      }

      if (allSuccess) {
        alert('Organismes saved successfully!');
        await fetchOrganismes(); // Refresh the list
      } else {
        const errorMessage = errors.length > 0 
          ? `Validation errors:\n${errors.join('\n')}` 
          : 'Some organismes failed to save. Please check and try again.';
        alert(errorMessage);
      }
    } catch (error) {
      console.error('Error saving organismes:', error);
      alert('An error occurred while saving. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Organismes Management</h1>
            <p className="text-gray-600 mt-1">Configure contribution categories and rates</p>
          </div>
          <button
            onClick={addCategory}
            className="inline-flex items-center px-4 py-2 bg-[var(--primary-color)] text-white text-sm font-medium rounded-md hover:bg-[var(--primary-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] focus:ring-offset-2"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Organisme
          </button>
        </div>
      </div>

      {/* Categories List */}
      <div className="space-y-6">
        {categories.map((category) => (
          <div key={category.id} className={`border rounded-lg bg-white ${
            isOrganismeValid(category) ? 'border-gray-200' : 'border-red-300'
          }`}>
            {/* Category Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-start space-x-4">
                <div className="flex-1">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <InputField
                      label="Organisme Name"
                      type="text"
                      value={category.label}
                      onChange={(e) => updateCategoryName(category.id, e.target.value)}
                      placeholder="Enter organisme name"
                      error={!category.label.trim()}
                      required
                    />
                    <InputField
                      label="Description"
                      type="text"
                      value={category.description}
                      onChange={(e) => updateCategoryDescription(category.id, e.target.value)}
                      placeholder="Enter description"
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
                  onClick={() => removeCategory(category.id)}
                  className="p-2 text-gray-400 hover:text-red-600 focus:outline-none"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Cotisations Section */}
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Contributions</h3>
                <button
                  onClick={() => addSubCategory(category.id)}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] focus:ring-offset-2"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add Contribution
                </button>
              </div>
              
              {category.cotisations.length === 0 ? (
                <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-md">
                  No contributions added yet
                </div>
              ) : (
                <div className="space-y-4">
                  {category.cotisations.map((cotisation) => (
                    <div key={cotisation.id} className="border border-gray-200 rounded-md p-4 bg-gray-50">
                      <div className="flex items-start space-x-4">
                        <div className="flex-1">
                          <div className="space-y-4 mb-4">
                            {/* First row: Label and Type */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                              <InputField
                                label="Label"
                                type="text"
                                value={cotisation.label}
                                onChange={(e) => updateSubCategory(category.id, cotisation.id, { label: e.target.value })}
                                placeholder="Contribution label"
                                error={!cotisation.label.trim()}
                                required
                              />
                              <StyledSelect
                                label="Type"
                                value={cotisation.type}
                                onChange={(e) => updateSubCategory(category.id, cotisation.id, { type: e.target.value as CotisationType })}
                                options={[
                                  { value: CotisationType.PATRONAL, label: 'Employer Only' },
                                  { value: CotisationType.SALARIAL, label: 'Employee Only' },
                                  { value: CotisationType.DEUX, label: 'Both' },
                                ]}
                                required
                              />
                            </div>
                            
                            {/* Second row: Description (full width) */}
                            <TextAreaField
                              label="Description"
                              value={cotisation.description}
                              onChange={(e) => updateSubCategory(category.id, cotisation.id, { description: e.target.value })}
                              placeholder="Contribution description"
                              rows={2}
                            />
                          </div>

                          {/* Percentage Configuration */}
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {(cotisation.type === CotisationType.PATRONAL || cotisation.type === CotisationType.DEUX) && (
                              <InputField
                                label="Employer Rate (%)"
                                type="number"
                                value={cotisation.pourcentage_patronal || ''}
                                onChange={(e) => updateSubCategory(category.id, cotisation.id, { 
                                  pourcentage_patronal: e.target.value ? parseFloat(e.target.value) : null 
                                })}
                                placeholder="0.00"
                                min="0"
                                max="100"
                                step="0.01"
                              />
                            )}

                            {(cotisation.type === CotisationType.SALARIAL || cotisation.type === CotisationType.DEUX) && (
                              <InputField
                                label="Employee Rate (%)"
                                type="number"
                                value={cotisation.pourcentage_salarial || ''}
                                onChange={(e) => updateSubCategory(category.id, cotisation.id, { 
                                  pourcentage_salarial: e.target.value ? parseFloat(e.target.value) : null 
                                })}
                                placeholder="0.00"
                                min="0"
                                max="100"
                                step="0.01"
                              />
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => removeSubCategory(category.id, cotisation.id)}
                          className="p-2 text-gray-400 hover:text-red-600 focus:outline-none"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Save Button */}
      <div className="mt-8 flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center px-6 py-2 bg-[var(--primary-color)] text-white text-sm font-medium rounded-md hover:bg-[var(--primary-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}

export default OrganismesForm;