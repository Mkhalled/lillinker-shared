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
  logo: undefined, // This will be a string (file path) after upload

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

// Helper function to safely serialize form data for localStorage
const serializeFormData = (data: CompanyFormData) => {
  const serializable = { ...data };
  // Convert Date objects to strings for serialization
  if (serializable.date_creation instanceof Date) {
    serializable.date_creation = serializable.date_creation.toISOString();
  }
  return JSON.stringify(serializable);
};

// Helper function to safely deserialize form data from localStorage
const deserializeFormData = (jsonString: string): CompanyFormData => {
  const data = JSON.parse(jsonString);
  // Convert date strings back to Date objects if needed
  if (data.date_creation && typeof data.date_creation === 'string') {
    data.date_creation = new Date(data.date_creation);
  }
  return data;
};

export const useCompanyForm = () => {
  // Initialize formData with localStorage data if available
  const [formData, setFormData] = useState<CompanyFormData>(() => {
    if (typeof window !== 'undefined') {
      const savedData = localStorage.getItem('company-modal-data');
      if (savedData) {
        try {
          return deserializeFormData(savedData);
        } catch (error) {
          console.error('Error parsing saved form data:', error);
        }
      }
    }
    return initialFormData;
  });

  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Save form data to localStorage whenever formData changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('company-modal-data', serializeFormData(formData));
      } catch (error) {
        console.error('Error saving form data to localStorage:', error);
      }
    }
  }, [formData]);

  const updateFormData = async (updates: Partial<CompanyFormData>) => {
    // Check if we're updating with a File object (logo upload)
    if (updates.logo instanceof File) {
      // Handle file upload to API
      setIsUploading(true);
      setUploadError(null);
      try {
        const formDataForUpload = new FormData();
        formDataForUpload.append('logo', updates.logo);

        const response = await fetch('/api/auth/upload-logo', {
          method: 'POST',
          body: formDataForUpload,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `HTTP ${response.status}: Failed to upload logo`);
        }

        const { filePath } = await response.json();
        
        // Update form data with the file path (string) instead of File object
        setFormData(prev => ({ 
          ...prev, 
          logo: filePath // This is now a string path, not a File object
        }));
      } catch (error) {
        console.error('Logo upload error:', error);
        setUploadError(error instanceof Error ? error.message : 'Unknown error occurred while uploading');
        // Don't update logo in formData if upload failed
      } finally {
        setIsUploading(false);
      }
    } else {
      // Handle regular form data updates
      setFormData(prev => ({ ...prev, ...updates }));
    }
  };

  const clearFormData = () => {
    setFormData(initialFormData);
    setUploadError(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('company-modal-data');
    }
  };

  return {
    formData,
    updateFormData,
    clearFormData,
    isUploading,
    uploadError,
  };
};