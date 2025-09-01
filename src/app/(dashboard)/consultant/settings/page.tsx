'use client';
import { useEffect, useState } from 'react';

import Breadcrumb from '@/components/Breadcrumbs/Breadcrumb';
import Loader from '@/components/common/Loader';
import CollapsibleRow from '@/components/settings/CollapsibleRow';
import PersonalInfoForm from '@/components/settings/PersonalInfoForm';
import { ProfileData } from '@/types/freelance';

const Settings = () => {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/profile');
      const data = await res.json();
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleProfileUpdate = () => {
    // Refresh profile data after updates
    fetchProfile();
  };

  if (loading) {
    return <Loader />;
  }

  if (!profile) {
    return (
      <div className="mx-auto max-w-270">
        <Breadcrumb pageName="Paramètres" />
        <div className="text-center py-8">
          <p className="text-red-600">Erreur lors du chargement des données du profil</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-270">
      <Breadcrumb pageName="Paramètres" />
      <div className="space-y-6">
        <CollapsibleRow title="Informations personnelles" defaultOpen={true}>
          <PersonalInfoForm profile={profile} onUpdate={handleProfileUpdate} />
        </CollapsibleRow>
      </div>
    </div>
  );
};

export default Settings;
