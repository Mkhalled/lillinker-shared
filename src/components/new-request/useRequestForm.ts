'use client';

import { FreelanceRequest } from '@/types/freelance';
import { useState, useEffect } from 'react';


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

  // Step 3: Services
  selectedServices: [],
  newServices: [],

  // Step 4: Priority
  priority: '',

  // Step 5: Summary
  comments: '',
};

export const useFreelanceForm = () => {
  // Initialize formData with localStorage data if available
  const [formData, setFormData] = useState<FreelanceRequest>(() => {
    if (typeof window !== 'undefined') {
      const savedData = localStorage.getItem('freelance-modal-data');
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
      localStorage.setItem('freelance-modal-data', JSON.stringify(formData));
    }
  }, [formData]);

  const updateFormData = (updater: (prev: FreelanceRequest) => FreelanceRequest) => {
    setFormData(updater);
  };

  const clearFormData = () => {
    setFormData(initialFormData);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('freelance-modal-data');
    }
  };

  const clearLocalStorage = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('freelance-modal-data');
      localStorage.removeItem('freelance-modal-step');
      localStorage.removeItem('freelance-modal-mission-step');
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
