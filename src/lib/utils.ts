import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Generate a clean field key from a field label
 * This function creates consistent keys for storing and retrieving response data
 */
export function generateFieldKey(fieldLabel: string, fieldId?: number): string {
  const cleanLabel = fieldLabel
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '') // Remove special characters
    .replace(/\s+/g, '_') // Replace spaces with underscores
    .trim();
  
  return cleanLabel || `field_${fieldId}`;
}

/**
 * Generate a field key from a field object
 */
export function generateFieldKeyFromField(field: { label: string; id: number }): string {
  return generateFieldKey(field.label, field.id);
}
