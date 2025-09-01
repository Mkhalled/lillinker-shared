import { useState, useEffect } from 'react';

import { ProfileData as company } from '@/types/company';
import { ProfileData as freelance } from '@/types/freelance';

interface SecteurActivite {
  id: number;
  code: string;
  name: string;
}

interface PersonalInfoFormProps {
  profile: company | freelance;
  onUpdate?: () => void;
}

const PersonalInfoForm = ({ profile, onUpdate }: PersonalInfoFormProps) => {
  const user = profile.user;
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  
  // Secteur activities state
  const [secteurActivites, setSecteurActivites] = useState<SecteurActivite[]>([]);
  const [loadingSecteurs, setLoadingSecteurs] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    phone_number: user?.phone_number || '',
    sex: user?.sex || '',
  });

  // Freelance-specific form state
  const [freelanceData, setFreelanceData] = useState({
    secteur_activite_id: (user as any)?.role === 'FREELANCE' ? 
      ((profile as any).roleData?.secteur_activite_id || '') : ''
  });

  // Fetch secteur activities when component mounts or when editing starts
  useEffect(() => {
    if ((user as any)?.role === 'FREELANCE' && isEditing && secteurActivites.length === 0) {
      fetchSecteurActivites();
    }
  }, [isEditing, user]);

  const fetchSecteurActivites = async () => {
    setLoadingSecteurs(true);
    try {
      const response = await fetch('/api/metiers');
      const data = await response.json();
      if (response.ok && data.success) {
        setSecteurActivites(data.data);
      }
    } catch (error) {
      console.error('Error fetching secteur activities:', error);
    } finally {
      setLoadingSecteurs(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFreelanceInputChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFreelanceData(prev => ({ ...prev, [name]: parseInt(value) || '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      // Update user information
      const userResponse = await fetch('/api/profile/user', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!userResponse.ok) {
        const userData = await userResponse.json();
        throw new Error(userData.error || 'Erreur lors de la mise à jour des informations utilisateur');
      }

      // If user is freelance and secteur_activite_id has changed, update freelance info
      if ((user as any)?.role === 'FREELANCE' && freelanceData.secteur_activite_id) {
        const freelanceResponse = await fetch('/api/profile/freelance', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ secteur_activite_id: freelanceData.secteur_activite_id }),
        });

        if (!freelanceResponse.ok) {
          const freelanceResponseData = await freelanceResponse.json();
          throw new Error(freelanceResponseData.error || 'Erreur lors de la mise à jour du secteur d\'activité');
        }
      }

      setMessage({
        type: 'success',
        text: 'Informations mises à jour avec succès',
      });
      setIsEditing(false);
      onUpdate?.();
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Erreur lors de la mise à jour',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset form data to original values
    setFormData({
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      phone_number: user?.phone_number || '',
      sex: user?.sex || '',
    });
    setFreelanceData({
      secteur_activite_id: (user as any)?.role === 'FREELANCE' ? 
        ((profile as any).roleData?.secteur_activite_id || '') : ''
    });
    setIsEditing(false);
    setMessage(null);
  };

  return (
    <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
      <div className="p-7">
        {message && (
          <div className={`mb-4 p-3 rounded ${
            message.type === 'success' 
              ? 'bg-green-100 text-green-700 border border-green-300' 
              : 'bg-red-100 text-red-700 border border-red-300'
          }`}>
            {message.text}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          {/* Informations de base */}
          <div className="mb-5.5 flex flex-col gap-5.5 sm:flex-row">
            <div className="w-full sm:w-1/2">
              <label
                className="mb-3 block text-sm font-medium text-black dark:text-white"
                htmlFor="first_name"
              >
                Prénom *
              </label>
              <div className="relative">
                <input
                  className={`w-full rounded border border-stroke py-3 px-4.5 text-black focus:border-[var(--primary-color)] focus-visible:outline-none dark:border-strokedark dark:text-white dark:focus:border-[var(--primary-color)] ${
                    isEditing ? 'bg-white dark:bg-meta-4' : 'bg-gray dark:bg-meta-4'
                  }`}
                  type="text"
                  name="first_name"
                  id="first_name"
                  placeholder="Prénom"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  readOnly={!isEditing}
                  required
                />
              </div>
            </div>
            <div className="w-full sm:w-1/2">
              <label
                className="mb-3 block text-sm font-medium text-black dark:text-white"
                htmlFor="last_name"
              >
                Nom *
              </label>
              <div className="relative">
                <input
                  className={`w-full rounded border border-stroke py-3 px-4.5 text-black focus:border-[var(--primary-color)] focus-visible:outline-none dark:border-strokedark dark:text-white dark:focus:border-[var(--primary-color)] ${
                    isEditing ? 'bg-white dark:bg-meta-4' : 'bg-gray dark:bg-meta-4'
                  }`}
                  type="text"
                  name="last_name"
                  id="last_name"
                  placeholder="Nom"
                  value={formData.last_name}
                  onChange={handleInputChange}
                  readOnly={!isEditing}
                  required
                />
              </div>
            </div>
          </div>

          <div className="mb-5.5 flex flex-col gap-5.5 sm:flex-row">
            <div className="w-full sm:w-1/2">
              <label
                className="mb-3 block text-sm font-medium text-black dark:text-white"
                htmlFor="email"
              >
                Adresse e-mail
              </label>
              <div className="relative">
                <input
                  className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-[var(--primary-color)] focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-[var(--primary-color)]"
                  type="email"
                  name="email"
                  id="email"
                  placeholder="Adresse e-mail"
                  value={user?.email || ''}
                  readOnly
                  title="L'email ne peut pas être modifié"
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                L'adresse e-mail ne peut pas être modifiée
              </p>
            </div>
            <div className="w-full sm:w-1/2">
              <label
                className="mb-3 block text-sm font-medium text-black dark:text-white"
                htmlFor="sex"
              >
                Sexe
              </label>
              <div className="relative">
                <select
                  className={`w-full rounded border border-stroke py-3 px-4.5 text-black focus:border-[var(--primary-color)] focus-visible:outline-none dark:border-strokedark dark:text-white dark:focus:border-[var(--primary-color)] ${
                    isEditing ? 'bg-white dark:bg-meta-4' : 'bg-gray dark:bg-meta-4'
                  }`}
                  name="sex"
                  id="sex"
                  value={formData.sex}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                >
                  <option value="">Sélectionner</option>
                  <option value="MALE">Homme</option>
                  <option value="FEMALE">Femme</option>
                </select>
              </div>
            </div>
          </div>

          <div className="mb-5.5">
            <label
              className="mb-3 block text-sm font-medium text-black dark:text-white"
              htmlFor="phone_number"
            >
              Numéro de téléphone
            </label>
            <input
              className={`w-full rounded border border-stroke px-4.5 py-3 text-black focus:border-[var(--primary-color)] focus-visible:outline-none dark:border-strokedark dark:text-white dark:focus:border-[var(--primary-color)] ${
                isEditing ? 'bg-white dark:bg-meta-4' : 'bg-gray dark:bg-meta-4'
              }`}
              type="tel"
              name="phone_number"
              id="phone_number"
              placeholder="Numéro de téléphone"
              value={formData.phone_number}
              onChange={handleInputChange}
              readOnly={!isEditing}
            />
          </div>

          {/* Additional user information */}
          <div className="mb-5.5 flex flex-col gap-5.5 sm:flex-row">
            <div className="w-full sm:w-1/2">
              <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                Rôle
              </label>
              <input
                className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-[var(--primary-color)] focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
                type="text"
                value={(user as any)?.role || ''}
                readOnly
              />
            </div>
            <div className="w-full sm:w-1/2">
              <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                Statut du compte
              </label>
              <input
                className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-[var(--primary-color)] focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
                type="text"
                value={(user as any)?.status ? 'Actif' : 'Inactif'}
                readOnly
              />
            </div>
          </div>

          {/* Show secteur d'activité for freelancers */}
          {(user as any)?.role === 'FREELANCE' && (profile as any).roleData && (
            <div className="mb-5.5">
              <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                Secteur d&apos;activité *
              </label>
              {isEditing ? (
                <select
                  className="w-full rounded border border-stroke py-3 px-4.5 text-black focus:border-[var(--primary-color)] focus-visible:outline-none dark:border-strokedark dark:text-white dark:focus:border-[var(--primary-color)] bg-white dark:bg-meta-4"
                  name="secteur_activite_id"
                  value={freelanceData.secteur_activite_id}
                  onChange={handleFreelanceInputChange}
                  disabled={loadingSecteurs}
                  required
                >
                  <option value="">Sélectionner un secteur d&apos;activité</option>
                  {secteurActivites.map((secteur) => (
                    <option key={secteur.id} value={secteur.id}>
                      {secteur.name}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-[var(--primary-color)] focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
                  type="text"
                  value={((profile as any).roleData as any)?.secteurActivite?.name || 'Non défini'}
                  readOnly
                />
              )}
              {!isEditing && ((profile as any).roleData as any)?.secteurActivite?.code && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Code: {((profile as any).roleData as any).secteurActivite.code}
                </p>
              )}
              {loadingSecteurs && isEditing && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Chargement des secteurs d&apos;activité...
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

export default PersonalInfoForm;
