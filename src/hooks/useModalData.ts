'use client';

import { useState, useEffect } from 'react';

import type { PlatformService } from '@/types/platform';

export interface Metier {
  id: number;
  name: string;
}

export interface Portage {
  id: number;
  name: string;
  description: string | null;
}

export const useModalData = () => {
  const [platformServices, setPlatformServices] = useState<PlatformService[]>([]);
  const [metiers, setMetiers] = useState<Metier[]>([]);
  const [portages, setPortages] = useState<Portage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Fetch platform services, metiers, and portages in parallel
        const [servicesResponse, metiersResponse, portagesResponse] = await Promise.all([
          fetch('/api/platform-services'),
          fetch('/api/metiers'),
          fetch('/api/portages'),
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

        if (portagesResponse.ok) {
          const portagesData = await portagesResponse.json();
          setPortages(portagesData.data || []);
        } else {
          console.warn('Failed to fetch portages');
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
    portages,
    isLoading,
    error,
  };
};
