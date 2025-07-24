'use client';

import { useState, useEffect } from 'react';

import type { FreelanceFormData } from '../../../types/freelance';

const initialFormData: FreelanceFormData = {
  // Step 1: Personal info
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  metierId: 0,

  // Step 2: Mission info
  hasMission: "",
  clientName: "",
  clientAddress: "",
  clientSector: "",
  tjm: "",
  days: "",
  wantsPortage: "no",
  selectedPortages: [],

  // Step 3: Services
  selectedServices: [],
  newServices: [],

  // Step 4: Priority
  priority: "",

  // Step 5: Summary
  comments: "",
};

export const useFreelanceForm = () => {
  // Initialize formData with localStorage data if available
  const [formData, setFormData] = useState<FreelanceFormData>(() => {
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

  const updateFormData = (updater: (prev: FreelanceFormData) => FreelanceFormData) => {
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
