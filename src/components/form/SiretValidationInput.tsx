'use client';

import { useState, useEffect } from 'react';

import InputField from './input/InputField';

interface SiretValidationInputProps {
  siret: string;
  onSiretChange: (siret: string) => void;
  onSiretExistsChange?: (exists: boolean) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  id?: string;
}

export const SiretValidationInput = ({
  siret,
  onSiretChange,
  onSiretExistsChange,
  label = 'SIRET *',
  placeholder = '12345678901234',
  required = true,
  id = 'siret',
}: SiretValidationInputProps) => {
  const [siretExists, setSiretExists] = useState(false);
  const [checkingSiret, setCheckingSiret] = useState(false);

  // Check if SIRET exists when SIRET changes
  useEffect(() => {
    const checkSiretExists = async () => {
      if (!siret || siret.length < 3) {
        setSiretExists(false);
        return;
      }

      setCheckingSiret(true);
      try {
        const cleanSiret = siret.replace(/[\s-]/g, '');
        const response = await fetch('/api/check-siret', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ siret: cleanSiret }),
        });

        if (response.ok) {
          const data = await response.json();
          setSiretExists(data.exists);
          onSiretExistsChange?.(data.exists);
        } else {
          console.warn('SIRET check failed with status:', response.status);
          setSiretExists(false); // Default to false if check fails
          onSiretExistsChange?.(false);
        }
      } catch (error) {
        console.error('Error checking SIRET:', error);
        setSiretExists(false); // Default to false if check fails
        onSiretExistsChange?.(false);
      } finally {
        setCheckingSiret(false);
      }
    };

    // Debounce the SIRET check
    const timeoutId = setTimeout(checkSiretExists, 500);
    return () => clearTimeout(timeoutId);
  }, [siret, onSiretExistsChange]);

  const handleSiretChange = (value: string) => {
    // Allow only digits and spaces/dashes
    const cleanValue = value.replace(/[^\d\s-]/g, '');
    onSiretChange(cleanValue);
  };

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="relative">
        <InputField
          id={id}
          value={siret}
          onChange={e => handleSiretChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          error={siretExists}
          className="pr-10"
          type="text"
        />
        {checkingSiret && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
          </div>
        )}
      </div>

      {/* SIRET exists error */}
      {siretExists && siret && (
        <p className="text-xs text-red-600">
          Ce numéro SIRET est déjà utilisé par une autre société
        </p>
      )}
    </div>
  );
};

// Export validation functions for use in parent components
export const useSiretValidation = () => {
  const checkSiretExists = async (siret: string): Promise<boolean> => {
    try {
      const cleanSiret = siret.replace(/[\s-]/g, '');
      const response = await fetch('/api/check-siret', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ siret: cleanSiret }),
      });

      if (response.ok) {
        const data = await response.json();
        return data.exists;
      }
      return false;
    } catch (error) {
      console.error('Error checking SIRET:', error);
      return false;
    }
  };

  const formatSiret = (value: string): string => {
    const cleanValue = value.replace(/[\s-]/g, '');
    return cleanValue.replace(/(.{3})/g, '$1 ').trim();
  };

  return { checkSiretExists, formatSiret };
};
