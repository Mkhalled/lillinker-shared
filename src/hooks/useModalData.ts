'use client';

import { useState, useEffect } from 'react';

export interface PlatformService {
  id: number;
  label: string;
  description: string | null;
  data_type: string;
  requires_data: boolean;
  data_label: string;
  data_description: string | null;
  choices: unknown;
  status?: string;
  user?: {
    first_name: string;
    last_name: string;
    ownedCompany: {
      name: string;
    } | null;
  };
}

export interface Metier {
  id: number;
  name: string;
}

export const useModalData = () => {
  const [platformServices, setPlatformServices] = useState<PlatformService[]>([]);
  const [metiers, setMetiers] = useState<Metier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Fetch platform services and metiers in parallel
        const [servicesResponse, metiersResponse] = await Promise.all([
          fetch('/api/platform-services'),
          fetch('/api/metiers')
        ]);

        if (servicesResponse.ok) {
          const servicesData = await servicesResponse.json();
          setPlatformServices(servicesData.data || []);
        } else {
          console.warn('Failed to fetch platform services');
        }

        if (metiersResponse.ok) {
          const metiersData = await metiersResponse.json();
          setMetiers(metiersData.data || []);
        } else {
          console.warn('Failed to fetch metiers');
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Erreur lors du chargement des données');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return {
    platformServices,
    metiers,
    isLoading,
    error
  };
};
