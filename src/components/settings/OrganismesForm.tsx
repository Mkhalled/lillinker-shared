import { useState } from 'react';

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

interface SubCategory {
  id: string;
  label: string;
  isPatronial: boolean;
  isSalarial: boolean;
  patronialPercentage: string;
  salarialPercentage: string;
}

interface Category {
  id: string;
  name: string;
  subCategories: SubCategory[];
}

const OrganismesForm = () => {
  const [categories, setCategories] = useState<Category[]>([
    {
      id: '1',
      name: 'Healthcare',
      subCategories: [
        {
          id: '1-1',
          label: 'Medical Insurance',
          isPatronial: false,
          isSalarial: false,
          patronialPercentage: '',
          salarialPercentage: ''
        }
      ]
    }
  ]);

  const addCategory = () => {
    const newCategory: Category = {
      id: Date.now().toString(),
      name: '',
      subCategories: []
    };
    setCategories([...categories, newCategory]);
  };

  const updateCategoryName = (categoryId: string, name: string) => {
    setCategories(categories.map(cat => 
      cat.id === categoryId ? { ...cat, name } : cat
    ));
  };

  const addSubCategory = (categoryId: string) => {
    const newSubCategory: SubCategory = {
      id: `${categoryId}-${Date.now()}`,
      label: '',
      isPatronial: false,
      isSalarial: false,
      patronialPercentage: '',
      salarialPercentage: ''
    };

    setCategories(categories.map(cat => 
      cat.id === categoryId 
        ? { ...cat, subCategories: [...cat.subCategories, newSubCategory] }
        : cat
    ));
  };

  const updateSubCategory = (categoryId: string, subCategoryId: string, updates: Partial<SubCategory>) => {
    setCategories(categories.map(cat => 
      cat.id === categoryId 
        ? {
            ...cat,
            subCategories: cat.subCategories.map(sub => 
              sub.id === subCategoryId ? { ...sub, ...updates } : sub
            )
          }
        : cat
    ));
  };

  const removeCategory = (categoryId: string) => {
    setCategories(categories.filter(cat => cat.id !== categoryId));
  };

  const removeSubCategory = (categoryId: string, subCategoryId: string) => {
    setCategories(categories.map(cat => 
      cat.id === categoryId 
        ? {
            ...cat,
            subCategories: cat.subCategories.filter(sub => sub.id !== subCategoryId)
          }
        : cat
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h4 className="text-lg font-medium text-gray-900">Organismes Management</h4>
        <button
          onClick={addCategory}
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors duration-200"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Category
        </button>
      </div>

      {categories.map((category) => (
        <div key={category.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
          <div className="flex items-center justify-between mb-4">
            <input
              type="text"
              value={category.name}
              onChange={(e) => updateCategoryName(category.id, e.target.value)}
              placeholder="Category name"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mr-4"
            />
            <button
              onClick={() => removeCategory(category.id)}
              className="p-2 text-red-600 hover:text-red-800 focus:outline-none"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-4">
            {category.subCategories.map((subCategory) => (
              <div key={subCategory.id} className="bg-white p-4 rounded-md border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <input
                    type="text"
                    value={subCategory.label}
                    onChange={(e) => updateSubCategory(category.id, subCategory.id, { label: e.target.value })}
                    placeholder="Subcategory label"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mr-4"
                  />
                  <button
                    onClick={() => removeSubCategory(category.id, subCategory.id)}
                    className="p-2 text-red-600 hover:text-red-800 focus:outline-none"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={subCategory.isPatronial}
                        onChange={(e) => updateSubCategory(category.id, subCategory.id, { 
                          isPatronial: e.target.checked,
                          patronialPercentage: e.target.checked ? subCategory.patronialPercentage : ''
                        })}
                        className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="text-sm font-medium text-gray-700">Patronial</span>
                    </label>
                    {subCategory.isPatronial && (
                      <input
                        type="number"
                        value={subCategory.patronialPercentage}
                        onChange={(e) => updateSubCategory(category.id, subCategory.id, { patronialPercentage: e.target.value })}
                        placeholder="Percentage"
                        min="0"
                        max="100"
                        step="0.01"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={subCategory.isSalarial}
                        onChange={(e) => updateSubCategory(category.id, subCategory.id, { 
                          isSalarial: e.target.checked,
                          salarialPercentage: e.target.checked ? subCategory.salarialPercentage : ''
                        })}
                        className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="text-sm font-medium text-gray-700">Salarial</span>
                    </label>
                    {subCategory.isSalarial && (
                      <input
                        type="number"
                        value={subCategory.salarialPercentage}
                        onChange={(e) => updateSubCategory(category.id, subCategory.id, { salarialPercentage: e.target.value })}
                        placeholder="Percentage"
                        min="0"
                        max="100"
                        step="0.01"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    )}
                  </div>
                </div>
              </div>
            ))}

            <button
              onClick={() => addSubCategory(category.id)}
              className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 text-sm"
            >
              <PlusIcon className="h-4 w-4 mr-1" />
              Add Subcategory
            </button>
          </div>
        </div>
      ))}

      <div className="flex justify-end">
        <button
          type="button"
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
        >
          Save Organismes
        </button>
      </div>
    </div>
  );
}

export default OrganismesForm;