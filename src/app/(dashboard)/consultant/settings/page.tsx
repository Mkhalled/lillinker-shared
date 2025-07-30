'use client';
import { useEffect, useState } from 'react';

import Breadcrumb from '@/components/Breadcrumbs/Breadcrumb';
import Loader from '@/components/common/Loader';

interface ProfileData {
  user: {
    first_name?: string;
    last_name?: string;
    email?: string;
    phone_number?: string;
  };
  roleData?: {
    id?: number;
    freelance_id?: number;
    metier?: { name?: string };
  };
}

const Settings = () => {
  const [profile, setProfile] = useState<ProfileData | null>(null);

  useEffect(() => {
    async function fetchProfile() {
      const res = await fetch('/api/profile');
      const data = await res.json();
      setProfile(data);
    }
    fetchProfile();
  }, []);
  if (!profile) {
    return <Loader />;
  }

  const user = profile.user;
  const freelance = profile.roleData;
console.log(profile)
  return (
    <div className="mx-auto max-w-270">
      <Breadcrumb pageName="Paramètres" />
      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark mt-8">
        <div className="border-b border-stroke px-7 py-4 dark:border-strokedark">
          <h3 className="font-medium text-black dark:text-white">
            Informations personnelles et freelance
          </h3>
        </div>
        <div className="p-7">
          <form action="#">
            {/* Infos personnelles */}
            <div className="mb-5.5 flex flex-col gap-5.5 sm:flex-row">
              <div className="w-full sm:w-1/2">
                <label
                  className="mb-3 block text-sm font-medium text-black dark:text-white"
                  htmlFor="prenom"
                >
                  Prénom
                </label>
                <div className="relative">
                  <input
                    className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                    type="text"
                    name="prenom"
                    id="prenom"
                    placeholder="Prénom"
                    defaultValue={user?.first_name || ''}
                    readOnly
                  />
                </div>
              </div>
              <div className="w-full sm:w-1/2">
                <label
                  className="mb-3 block text-sm font-medium text-black dark:text-white"
                  htmlFor="nom"
                >
                  Nom
                </label>
                <div className="relative">
                  <input
                    className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                    type="text"
                    name="nom"
                    id="nom"
                    placeholder="Nom"
                    defaultValue={user?.last_name || ''}
                    readOnly
                  />
                </div>
              </div>
            </div>
            <div className="mb-5.5">
              <label
                className="mb-3 block text-sm font-medium text-black dark:text-white"
                htmlFor="emailAddress"
              >
                Adresse e-mail
              </label>
              <div className="relative">
                <input
                  className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                  type="email"
                  name="emailAddress"
                  id="emailAddress"
                  placeholder="Adresse e-mail"
                  defaultValue={user?.email || ''}
                  readOnly
                />
              </div>
            </div>
            <div className="mb-5.5">
              <label
                className="mb-3 block text-sm font-medium text-black dark:text-white"
                htmlFor="phoneNumber"
              >
                Numéro de téléphone
              </label>
              <input
                className="w-full rounded border border-stroke bg-gray px-4.5 py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                type="text"
                name="phoneNumber"
                id="phoneNumber"
                placeholder="Numéro de téléphone"
                defaultValue={user?.phone_number || ''}
                readOnly
              />
            </div>
            {/* Infos freelance */}
            <div className="mb-5.5 flex flex-col gap-5.5 sm:flex-row">
              <div className="w-full sm:w-1/3">
                <label
                  className="mb-3 block text-sm font-medium text-black dark:text-white"
                  htmlFor="metier"
                >
                  Métier
                </label>
                <input
                  className="w-full rounded border border-stroke bg-gray px-4.5 py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                  type="text"
                  name="metier"
                  id="metier"
                  placeholder="Métier ID"
                  defaultValue={freelance?.metier?.name || ''}
                  readOnly
                />
              </div>
            </div>
            <div className="flex justify-end gap-4.5">
              <button
                className="flex justify-center rounded border border-stroke px-6 py-2 font-medium text-black hover:shadow-1 dark:border-strokedark dark:text-white"
                type="button"
              >
                Annuler
              </button>
              <button
                className="flex justify-center rounded bg-primary px-6 py-2 font-medium text-gray hover:bg-opacity-90"
                type="submit"
              >
                Enregistrer
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Settings;
