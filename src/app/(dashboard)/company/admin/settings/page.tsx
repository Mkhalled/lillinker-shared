'use client';
import { useEffect, useState } from 'react';

import Breadcrumb from '@/components/Breadcrumbs/Breadcrumb';
import Loader from '@/components/common/Loader';
import CollapsibleRow from '@/components/settings/CollapsibleRow';
import CompanyInfoForm from '@/components/settings/CompanyInfoForm';
import OrganismesForm from '@/components/settings/OrganismesForm';
import PersonalInfoForm from '@/components/settings/PersonalInfoForm';
import { ProfileData } from '@/types/company';

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

  return (
    <div className="mx-auto max-w-270">
      <Breadcrumb pageName="Paramètres" />
      <div className="space-y-6">
        <CollapsibleRow title="Informations de société">
          <CompanyInfoForm profile={profile} />
        </CollapsibleRow>

        <CollapsibleRow title="Informations de l'administrateur">
          <PersonalInfoForm profile={profile} />
        </CollapsibleRow>

        <CollapsibleRow title="Management des organismes">
          <OrganismesForm />
        </CollapsibleRow>
      </div>
    </div>
  );
};

export default Settings;
