import { useState, useEffect } from 'react';

import { StyledCheckbox } from '@/components/form/StyledCheckbox';
import { ProfileData } from '@/types/company';

interface LabelPortage {
  id: number;
  name: string;
  description?: string;
}

interface CompanyLabel {
  label_syndicat_id: number;
  labelSyndicat?: {
    id: number;
    name: string;
  };
}

interface ExtendedCompanyData {
  name?: string;
  description?: string;
  consultant_count?: number;
  siret?: string;
  management_min?: number;
  management_max?: number;
  is_portage?: boolean;
  date_creation?: string | Date;
  chiffre_affaires?: number;
  adresse?: string;
  site_web?: string;
  convention_collective?: string;
  code_naf_ape?: string;
  labels?: CompanyLabel[];
}

interface ExtendedProfileData extends ProfileData {
  roleData?: ExtendedCompanyData;
}

interface CompanyInfoFormProps {
  profile: ExtendedProfileData;
  onUpdate?: () => void;
  onMessage?: (message: { type: 'success' | 'error'; text: string } | null) => void;
}

const CompanyInfoForm = ({ profile, onUpdate, onMessage }: CompanyInfoFormProps) => {
  const company = profile.roleData as ExtendedCompanyData;
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Label portages state (using same logic as onboarding)
  const [labelPortages, setLabelPortages] = useState<LabelPortage[]>([]);
  const [loadingLabels, setLoadingLabels] = useState(false);
  const [selectedPortages, setSelectedPortages] = useState<string[]>([]);

  // Form state
  const [formData, setFormData] = useState({
    name: company?.name || '',
    description: company?.description || '',
    consultant_count: company?.consultant_count || 0,
    siret: company?.siret || '',
    management_min: company?.management_min || '',
    management_max: company?.management_max || '',
    is_portage: company?.is_portage || false,
    date_creation: company?.date_creation
      ? new Date(company.date_creation).toISOString().split('T')[0]
      : '',
    chiffre_affaires: company?.chiffre_affaires || '',
    adresse: company?.adresse || '',
    site_web: company?.site_web || '',
    convention_collective: company?.convention_collective || '',
    code_naf_ape: company?.code_naf_ape || '',
  });

  // Fetch label portages when component mounts or when is_portage changes to true
  useEffect(() => {
    if (formData.is_portage) {
      fetchLabelPortages();
    }
  }, [formData.is_portage]);

  // Fetch labels on component mount if company is already a portage company
  useEffect(() => {
    if (company?.is_portage) {
      fetchLabelPortages();
    }
  }, [company?.is_portage]);

  // Initialize selected portages from company data (using same logic as onboarding)
  useEffect(() => {
    if (company?.labels && Array.isArray(company.labels)) {
      const portageIds = company.labels.map((label: CompanyLabel) =>
        label.label_syndicat_id.toString()
      );
      setSelectedPortages(portageIds);
    }
  }, [company]);

  const fetchLabelPortages = async () => {
    setLoadingLabels(true);
    try {
      const response = await fetch('/api/portages');
      const data = await response.json();
      if (response.ok && data.success) {
        setLabelPortages(data.data);
      }
    } catch (error) {
      console.error('Error fetching label portages:', error);
    } finally {
      setLoadingLabels(false);
    }
  };

  const togglePortageSelection = (portageId: number) => {
    const portageIdStr = portageId.toString();
    const newSelectedPortages = selectedPortages.includes(portageIdStr)
      ? selectedPortages.filter((id: string) => id !== portageIdStr)
      : [...selectedPortages, portageIdStr];

    setSelectedPortages(newSelectedPortages);
  };

  const handlePortageChange = (portageId: number) => (_e: React.ChangeEvent<HTMLInputElement>) => {
    togglePortageSelection(portageId);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    onMessage?.(null);

    try {
      // Prepare the data to send
      const submitData = {
        ...formData,
        // Include selected portages if the company is a portage company (convert strings to numbers)
        ...(formData.is_portage && { selected_labels: selectedPortages.map(id => parseInt(id)) }),
      };

      const response = await fetch('/api/profile/company', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      const data = await response.json();

      if (response.ok) {
        onMessage?.({
          type: 'success',
          text: "Informations de l'entreprise mises à jour avec succès",
        });
        setIsEditing(false);
        onUpdate?.();
      } else {
        onMessage?.({
          type: 'error',
          text: data.error || "Erreur lors de la mise à jour des informations de l'entreprise",
        });
      }
    } catch (error) {
      onMessage?.({
        type: 'error',
        text: error instanceof Error ? error.message : 'Erreur de connexion lors de la mise à jour',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset form data to original values
    setFormData({
      name: company?.name || '',
      description: company?.description || '',
      consultant_count: company?.consultant_count || 0,
      siret: company?.siret || '',
      management_min: company?.management_min || '',
      management_max: company?.management_max || '',
      is_portage: company?.is_portage || false,
      date_creation: company?.date_creation
        ? new Date(company.date_creation).toISOString().split('T')[0]
        : '',
      chiffre_affaires: company?.chiffre_affaires || '',
      adresse: company?.adresse || '',
      site_web: company?.site_web || '',
      convention_collective: company?.convention_collective || '',
      code_naf_ape: company?.code_naf_ape || '',
    });
    // Reset selected portages
    if (company?.labels && Array.isArray(company.labels)) {
      const portageIds = company.labels.map((label: CompanyLabel) =>
        label.label_syndicat_id.toString()
      );
      setSelectedPortages(portageIds);
    } else {
      setSelectedPortages([]);
    }
    setIsEditing(false);
    onMessage?.(null);
  };

  return (
    <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
      <div className="p-7">
        <form onSubmit={handleSubmit}>
          {/* Informations principales */}
          <div className="mb-5.5 flex flex-col gap-5.5 sm:flex-row">
            <div className="w-full sm:w-1/2">
              <label
                className="mb-3 block text-sm font-medium text-black dark:text-white"
                htmlFor="name"
              >
                Nom de l&apos;entreprise *
              </label>
              <input
                className={`w-full rounded border border-stroke py-3 px-4.5 text-black focus:border-[var(--primary-color)] focus-visible:outline-none dark:border-strokedark dark:text-white dark:focus:border-[var(--primary-color)] ${
                  isEditing ? 'bg-white dark:bg-meta-4' : 'bg-gray dark:bg-meta-4'
                }`}
                type="text"
                name="name"
                id="name"
                placeholder="Nom de l'entreprise"
                value={formData.name}
                onChange={handleInputChange}
                readOnly={!isEditing}
                required
              />
            </div>
            <div className="w-full sm:w-1/2">
              <label
                className="mb-3 block text-sm font-medium text-black dark:text-white"
                htmlFor="consultant_count"
              >
                Nombre de consultants *
              </label>
              <input
                className={`w-full rounded border border-stroke py-3 px-4.5 text-black focus:border-[var(--primary-color)] focus-visible:outline-none dark:border-strokedark dark:text-white dark:focus:border-[var(--primary-color)] ${
                  isEditing ? 'bg-white dark:bg-meta-4' : 'bg-gray dark:bg-meta-4'
                }`}
                type="number"
                name="consultant_count"
                id="consultant_count"
                placeholder="Nombre de consultants"
                min={0}
                value={formData.consultant_count}
                onChange={handleInputChange}
                readOnly={!isEditing}
                required
              />
            </div>
          </div>

          <div className="mb-5.5 flex flex-col gap-5.5 sm:flex-row">
            <div className="w-full sm:w-1/2">
              <label
                className="mb-3 block text-sm font-medium text-black dark:text-white"
                htmlFor="siret"
              >
                SIRET
              </label>
              <input
                className={`w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-[var(--primary-color)] focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-[var(--primary-color)]`}
                type="text"
                name="siret"
                id="siret"
                placeholder="Numéro SIRET"
                value={formData.siret}
                readOnly
              />
            </div>
            <div className="w-full sm:w-1/2">
              <label
                className="mb-3 block text-sm font-medium text-black dark:text-white"
                htmlFor="code_naf_ape"
              >
                Code NAF/APE
              </label>
              <input
                className={`w-full rounded border border-stroke py-3 px-4.5 text-black focus:border-[var(--primary-color)] focus-visible:outline-none dark:border-strokedark dark:text-white dark:focus:border-[var(--primary-color)] ${
                  isEditing ? 'bg-white dark:bg-meta-4' : 'bg-gray dark:bg-meta-4'
                }`}
                type="text"
                name="code_naf_ape"
                id="code_naf_ape"
                placeholder="Code NAF/APE"
                value={formData.code_naf_ape}
                onChange={handleInputChange}
                readOnly={!isEditing}
              />
            </div>
          </div>

          <div className="mb-5.5">
            <label
              className="mb-3 block text-sm font-medium text-black dark:text-white"
              htmlFor="description"
            >
              Description de l&apos;entreprise
            </label>
            <textarea
              className={`w-full rounded border border-stroke py-3 px-4.5 text-black focus:border-[var(--primary-color)] focus-visible:outline-none dark:border-strokedark dark:text-white dark:focus:border-[var(--primary-color)] ${
                isEditing ? 'bg-white dark:bg-meta-4' : 'bg-gray dark:bg-meta-4'
              }`}
              name="description"
              id="description"
              placeholder="Description de l'entreprise"
              rows={3}
              value={formData.description}
              onChange={handleInputChange}
              readOnly={!isEditing}
            />
          </div>

          <div className="mb-5.5">
            <label
              className="mb-3 block text-sm font-medium text-black dark:text-white"
              htmlFor="adresse"
            >
              Adresse
            </label>
            <textarea
              className={`w-full rounded border border-stroke py-3 px-4.5 text-black focus:border-[var(--primary-color)] focus-visible:outline-none dark:border-strokedark dark:text-white dark:focus:border-[var(--primary-color)] ${
                isEditing ? 'bg-white dark:bg-meta-4' : 'bg-gray dark:bg-meta-4'
              }`}
              name="adresse"
              id="adresse"
              placeholder="Adresse complète de l'entreprise"
              rows={2}
              value={formData.adresse}
              onChange={handleInputChange}
              readOnly={!isEditing}
            />
          </div>

          {/* Informations financières */}
          <div className="mb-5.5 flex flex-col gap-5.5 sm:flex-row">
            <div className="w-full sm:w-1/3">
              <label
                className="mb-3 block text-sm font-medium text-black dark:text-white"
                htmlFor="management_min"
              >
                Frais de gestion min (%)
              </label>
              <input
                className={`w-full rounded border border-stroke py-3 px-4.5 text-black focus:border-[var(--primary-color)] focus-visible:outline-none dark:border-strokedark dark:text-white dark:focus:border-[var(--primary-color)] ${
                  isEditing ? 'bg-white dark:bg-meta-4' : 'bg-gray dark:bg-meta-4'
                }`}
                type="number"
                step="0.1"
                min="0"
                max="100"
                name="management_min"
                id="management_min"
                placeholder="0.0"
                value={formData.management_min}
                onChange={handleInputChange}
                readOnly={!isEditing}
              />
            </div>
            <div className="w-full sm:w-1/3">
              <label
                className="mb-3 block text-sm font-medium text-black dark:text-white"
                htmlFor="management_max"
              >
                Frais de gestion max (%)
              </label>
              <input
                className={`w-full rounded border border-stroke py-3 px-4.5 text-black focus:border-[var(--primary-color)] focus-visible:outline-none dark:border-strokedark dark:text-white dark:focus:border-[var(--primary-color)] ${
                  isEditing ? 'bg-white dark:bg-meta-4' : 'bg-gray dark:bg-meta-4'
                }`}
                type="number"
                step="0.1"
                min="0"
                max="100"
                name="management_max"
                id="management_max"
                placeholder="0.0"
                value={formData.management_max}
                onChange={handleInputChange}
                readOnly={!isEditing}
              />
            </div>
            <div className="w-full sm:w-1/3">
              <label
                className="mb-3 block text-sm font-medium text-black dark:text-white"
                htmlFor="chiffre_affaires"
              >
                Chiffre d&apos;affaires (€)
              </label>
              <input
                className={`w-full rounded border border-stroke py-3 px-4.5 text-black focus:border-[var(--primary-color)] focus-visible:outline-none dark:border-strokedark dark:text-white dark:focus:border-[var(--primary-color)] ${
                  isEditing ? 'bg-white dark:bg-meta-4' : 'bg-gray dark:bg-meta-4'
                }`}
                type="number"
                step="0.01"
                min="0"
                name="chiffre_affaires"
                id="chiffre_affaires"
                placeholder="0.00"
                value={formData.chiffre_affaires}
                onChange={handleInputChange}
                readOnly={!isEditing}
              />
            </div>
          </div>

          {/* Informations complémentaires */}
          <div className="mb-5.5 flex flex-col gap-5.5 sm:flex-row">
            <div className="w-full sm:w-1/2">
              <label
                className="mb-3 block text-sm font-medium text-black dark:text-white"
                htmlFor="site_web"
              >
                Site web
              </label>
              <input
                className={`w-full rounded border border-stroke py-3 px-4.5 text-black focus:border-[var(--primary-color)] focus-visible:outline-none dark:border-strokedark dark:text-white dark:focus:border-[var(--primary-color)] ${
                  isEditing ? 'bg-white dark:bg-meta-4' : 'bg-gray dark:bg-meta-4'
                }`}
                type="url"
                name="site_web"
                id="site_web"
                placeholder="https://www.example.com"
                value={formData.site_web}
                onChange={handleInputChange}
                readOnly={!isEditing}
              />
            </div>
            <div className="w-full sm:w-1/2">
              <label
                className="mb-3 block text-sm font-medium text-black dark:text-white"
                htmlFor="date_creation"
              >
                Date de création
              </label>
              <input
                className={`w-full rounded border border-stroke py-3 px-4.5 text-black focus:border-[var(--primary-color)] focus-visible:outline-none dark:border-strokedark dark:text-white dark:focus:border-[var(--primary-color)] ${
                  isEditing ? 'bg-white dark:bg-meta-4' : 'bg-gray dark:bg-meta-4'
                }`}
                type="date"
                name="date_creation"
                id="date_creation"
                value={formData.date_creation}
                onChange={handleInputChange}
                readOnly={!isEditing}
              />
            </div>
          </div>

          <div className="mb-5.5">
            <label
              className="mb-3 block text-sm font-medium text-black dark:text-white"
              htmlFor="convention_collective"
            >
              Convention collective
            </label>
            <input
              className={`w-full rounded border border-stroke py-3 px-4.5 text-black focus:border-[var(--primary-color)] focus-visible:outline-none dark:border-strokedark dark:text-white dark:focus:border-[var(--primary-color)] ${
                isEditing ? 'bg-white dark:bg-meta-4' : 'bg-gray dark:bg-meta-4'
              }`}
              type="text"
              name="convention_collective"
              id="convention_collective"
              placeholder="Convention collective applicable"
              value={formData.convention_collective}
              onChange={handleInputChange}
              readOnly={!isEditing}
            />
          </div>

          <div className="mb-5.5">
            <StyledCheckbox
              name="is_portage"
              checked={formData.is_portage}
              onChange={handleInputChange}
              disabled={!isEditing}
              label="Société de portage salarial"
            />
          </div>

          {/* Label Portages Selection - Only show if company is portage */}
          {formData.is_portage && (
            <div className="mb-5.5">
              <h2 className="mb-3 block text-sm font-medium text-black dark:text-white">
                Services de portage proposés
              </h2>
              {loadingLabels ? (
                <div className="p-4 text-center text-gray-500">
                  Chargement des services de portage...
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {labelPortages.map(label => (
                    <div
                      key={label.id}
                      className={`p-3 border rounded-lg transition-all duration-200 ${
                        selectedPortages.includes(label.id.toString())
                          ? 'border-[var(--primary-color)] bg-blue-50'
                          : 'border-stroke'
                      }`}
                    >
                      <StyledCheckbox
                        checked={selectedPortages.includes(label.id.toString())}
                        onChange={handlePortageChange(label.id)}
                        disabled={!isEditing}
                        label={label.name}
                      />
                    </div>
                  ))}
                </div>
              )}
              {!isEditing && selectedPortages.length === 0 && labelPortages.length > 0 && (
                <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                  Aucun service de portage sélectionné
                </p>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-4.5">
            {isEditing ? (
              <>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex justify-center rounded border border-stroke px-6 py-2 font-medium text-black hover:shadow-1 dark:border-strokedark dark:text-white"
                  disabled={saving}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex justify-center rounded bg-[var(--primary-color)] px-6 py-2 font-medium text-gray hover:bg-[var(--primary-hover)] disabled:opacity-50"
                  disabled={saving}
                >
                  {saving ? 'Sauvegarde...' : 'Enregistrer'}
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="flex justify-center rounded bg-[var(--primary-color)] px-6 py-2 font-medium text-gray hover:bg-[var(--primary-hover)]"
              >
                Modifier
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default CompanyInfoForm;
