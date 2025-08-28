'use client';

import { useState, useEffect } from 'react';

import type { CompanyFormData } from '@/types/company';

const initialFormData: CompanyFormData = {
  // Step 1: General info
  companyName: '',
  siret: '',
  description: '',
  isPortage: 'no',
  date_creation: undefined,
  chiffre_affaires: undefined,
  adresse: '',
  site_web: '',
  convention_collective: '',
  code_naf_ape: '',
  logo: '',

  // Step 2: Consultants and fees
  consultantCount: '',
  managementFeeRateMin: '',
  managementFeeRateMax: '',

  // Step 3: Metiers selection
  selectedMetiers: [],

  // Step 4: Admin info
  adminFirstName: '',
  adminLastName: '',
  adminEmail: '',
  adminPhone: '',
  adminSex: '',

  // Step 5: Services selection and creation
  selectedPlatformServices: [],
  selectedPortages: [],
  newServices: [],
};

export const useCompanyForm = () => {
  // Initialize formData with localStorage data if available
  const [formData, setFormData] = useState<CompanyFormData>(() => {
    if (typeof window !== 'undefined') {
      const savedData = localStorage.getItem('company-modal-data');
      if (savedData) {
        try {
          return JSON.parse(savedData);
        } catch (error) {
          console.error('Error parsing saved form data:', error);
        }
      }
    }
    return initialFormData;
  });

  // Save form data to localStorage whenever formData changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('company-modal-data', JSON.stringify(formData));
    }
  }, [formData]);

  const updateFormData = (updates: Partial<CompanyFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const clearFormData = () => {
    setFormData(initialFormData);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('company-modal-data');
    }
  };

  return {
    formData,
    updateFormData,
    clearFormData,
  };
};
