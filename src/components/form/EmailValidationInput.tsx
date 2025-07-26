'use client';

import { useState, useEffect } from 'react';

import InputField from './input/InputField';

interface EmailValidationInputProps {
  email: string;
  onEmailChange: (email: string) => void;
  onValidityChange?: (isValid: boolean) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  id?: string;
}

export const EmailValidationInput = ({
  email,
  onEmailChange,
  onValidityChange,
  label = 'Email *',
  placeholder = 'marie.martin@societe.com',
  required = true,
  id = 'email',
}: EmailValidationInputProps) => {
  const [emailExists, setEmailExists] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(false);

  // Email validation function
  const isValidBusinessEmail = (email: string): boolean => {
    // Basic email format check
    const basicEmailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!basicEmailRegex.test(email)) {
      return false;
    }

    // Check for excluded domains (Gmail, Yahoo)
    const domain = email.split('@')[1]?.toLowerCase();
    const excludedDomains = ['gmail.com', 'yahoo.com', 'yahoo.fr'];

    return !excludedDomains.includes(domain);
  };

  // Check if email exists when email changes
  useEffect(() => {
    const checkEmailExists = async () => {
      if (!email || email.length < 3) {
        setEmailExists(false);
        return;
      }

      // Only check if email format is valid
      if (!isValidBusinessEmail(email)) {
        setEmailExists(false);
        return;
      }

      setCheckingEmail(true);
      try {
        const response = await fetch('/api/check-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email }),
        });

        if (response.ok) {
          const data = await response.json();
          setEmailExists(data.exists);
        } else {
          console.warn('Email check failed with status:', response.status);
          setEmailExists(false); // Default to false if check fails
        }
      } catch (error) {
        console.error('Error checking email:', error);
        setEmailExists(false); // Default to false if check fails
      } finally {
        setCheckingEmail(false);
      }
    };

    // Debounce the email check
    const timeoutId = setTimeout(checkEmailExists, 500);
    return () => clearTimeout(timeoutId);
  }, [email]);

  // Notify parent about email validity changes
  useEffect(() => {
    const isValid = Boolean(email && isValidBusinessEmail(email) && !emailExists);
    onValidityChange?.(isValid);
  }, [email, emailExists, onValidityChange]);

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="relative">
        <InputField
          id={id}
          value={email}
          onChange={e => onEmailChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          error={emailExists}
          type="email"
          className="pr-10"
        />
        {checkingEmail && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
          </div>
        )}
      </div>

      {/* Email validation errors */}
      {email && !isValidBusinessEmail(email) && (
        <p className="text-xs text-red-600">
          Veuillez utiliser une adresse email professionnelle (Gmail et Yahoo non acceptés)
        </p>
      )}

      {/* Email exists error */}
      {emailExists && email && (
        <p className="text-xs text-red-600">Cette adresse email est déjà utilisée</p>
      )}
    </div>
  );
};

// Export validation functions for use in parent components
export const useEmailValidation = () => {
  const isValidBusinessEmail = (email: string): boolean => {
    const basicEmailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!basicEmailRegex.test(email)) {
      return false;
    }

    const domain = email.split('@')[1]?.toLowerCase();
    const excludedDomains = ['gmail.com', 'yahoo.com', 'yahoo.fr'];

    return !excludedDomains.includes(domain);
  };

  const checkEmailExists = async (email: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/check-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        const data = await response.json();
        return data.exists;
      }
      return false;
    } catch (error) {
      console.error('Error checking email:', error);
      return false;
    }
  };

  return { isValidBusinessEmail, checkEmailExists };
};
