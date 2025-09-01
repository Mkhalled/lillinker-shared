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
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

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

  const handleMessage = (newMessage: { type: 'success' | 'error'; text: string } | null) => {
    setMessage(newMessage);
    // Auto clear success messages after 5 seconds
    if (newMessage?.type === 'success') {
      setTimeout(() => setMessage(null), 5000);
    }
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
      
      {message && (
        <div className={`mb-6 p-4 rounded-lg border ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-800 border-green-200' 
            : 'bg-red-50 text-red-800 border-red-200'
        }`}>
          <div className="flex items-center justify-between">
            <span>{message.text}</span>
            <button
              onClick={() => setMessage(null)}
              className="ml-4 text-sm hover:opacity-70"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <div className="space-y-6">
        <CollapsibleRow title="Informations personnelles">
          <PersonalInfoForm profile={profile} onUpdate={handleProfileUpdate} onMessage={handleMessage} />
        </CollapsibleRow>

        <CollapsibleRow title="Informations de société">
          <CompanyInfoForm profile={profile} onUpdate={handleProfileUpdate} onMessage={handleMessage} />
        </CollapsibleRow>

        <CollapsibleRow title="Management des organismes">
          <OrganismesForm />
        </CollapsibleRow>
      </div>
    </div>
  );
};

export default Settings;
