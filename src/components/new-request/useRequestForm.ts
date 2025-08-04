'use client';

import { useState, useEffect } from 'react';

import { FreelanceRequest } from '@/types/freelance';

const initialFormData: FreelanceRequest = {
  // Step 2: Mission info
  hasMission: '',
  clientName: '',
  clientAddress: '',
  clientSector: '',
  tjm: '',
  days: '',
  wantsPortage: 'no',
  selectedPortages: [],

  // Salary preferences
  wantSalaried: false,
  salary: undefined,
  startDate: undefined,

  // Step 3: Services
  selectedServices: [],
  newServices: [],

  // Step 4: Priority
  priority: '',

  // Step 5: Summary
  comments: '',
};

export const useRequestForm = () => {
  // Initialize formData with localStorage data if available
  const [formData, setFormData] = useState<FreelanceRequest>(() => {
    if (typeof window !== 'undefined') {
      const savedData = localStorage.getItem('request-modal-data');
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
      localStorage.setItem('request-modal-data', JSON.stringify(formData));
    }
  }, [formData]);

  const updateFormData = (updater: (prev: FreelanceRequest) => FreelanceRequest) => {
    setFormData(updater);
  };

  const clearFormData = () => {
    setFormData(initialFormData);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('request-modal-data');
    }
  };

  const clearLocalStorage = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('request-modal-data');
      localStorage.removeItem('request-modal-step');
      localStorage.removeItem('request-modal-mission-step');
    }
  };

  return {
    formData,
    setFormData,
    updateFormData,
    clearFormData,
    clearLocalStorage,
  };
};
