'use client';

import { useState, useEffect } from 'react';
import InputField from './input/InputField';

interface BasicEmailInputProps {
  email: string;
  onEmailChange: (email: string) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  id?: string;
}

export const BasicEmailInput = ({
  email,
  onEmailChange,
  label = "Email *",
  placeholder = "marie.martin@email.com",
  required = true,
  id = "email"
}: BasicEmailInputProps) => {
  const [emailExists, setEmailExists] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(false);

  // Basic email validation - only checks format, not domain restrictions
  const isValidEmail = (email: string): boolean => {
    const basicEmailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return basicEmailRegex.test(email);
  };

  // Check if email exists when email changes
  useEffect(() => {
    const checkEmailExists = async () => {
      if (!email || email.length < 3) {
        setEmailExists(false);
        return;
      }

      // Only check if email format is valid
      if (!isValidEmail(email)) {
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

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-sm font-medium text-gray-700">{label}</label>
      <div className="relative">
        <InputField
          id={id}
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
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
      
      {/* Basic email format validation */}
      {email && !isValidEmail(email) && (
        <p className="text-xs text-red-600">Veuillez saisir une adresse email valide</p>
      )}
      
      {/* Email exists error */}
      {emailExists && email && (
        <p className="text-xs text-red-600">Cette adresse email est déjà utilisée</p>
      )}
    </div>
  );
};
