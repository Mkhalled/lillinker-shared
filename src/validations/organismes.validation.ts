import { CotisationType } from '@prisma/client';
import { z } from 'zod';

// Cotisation validation schema
const cotisationSchema = z.object({
  id: z.number(),
  label: z.string().min(1, 'Le libellé de la cotisation est obligatoire'),
  description: z.string().optional(),
  type: z.nativeEnum(CotisationType, { required_error: 'Le type de cotisation est obligatoire' }),
  pourcentage_salarial: z.number().nullable(),
  pourcentage_patronal: z.number().nullable(),
}).refine((data) => {
  // Validate required percentage fields based on type
  if (data.type === CotisationType.PATRONAL || data.type === CotisationType.DEUX) {
    if (data.pourcentage_patronal === null || data.pourcentage_patronal === undefined) {
      return false;
    }
  }
  
  if (data.type === CotisationType.SALARIAL || data.type === CotisationType.DEUX) {
    if (data.pourcentage_salarial === null || data.pourcentage_salarial === undefined) {
      return false;
    }
  }
  
  return true;
}, {
  message: 'Les taux requis selon le type de cotisation doivent être renseignés',
});

// Organisme validation schema
const organismeSchema = z.object({
  id: z.number(),
  label: z.string().min(1, 'Le nom de l\'organisme est obligatoire'),
  description: z.string().optional(),
  cotisations: z.array(cotisationSchema).min(1, 'Au moins une cotisation est requise'),
});

// Type exports
export type ValidatedCotisation = z.infer<typeof cotisationSchema>;
export type ValidatedOrganisme = z.infer<typeof organismeSchema>;

// Validation functions

/**
 * Checks if an organisme is valid
 */
export function isOrganismeValid(organisme: {
  id: number;
  label: string;
  description: string;
  cotisations: Array<{
    id: number;
    label: string;
    description: string;
    type: CotisationType;
    pourcentage_salarial: number | null;
    pourcentage_patronal: number | null;
  }>;
}): boolean {
  if (!organisme.label.trim() || organisme.cotisations.length === 0) {
    return false;
  }
  
  return organisme.cotisations.every(cotisation => {
    // Check basic required fields
    if (!cotisation.label.trim() || !cotisation.type) {
      return false;
    }
    
    // Check required percentage fields based on type
    if (cotisation.type === CotisationType.PATRONAL || cotisation.type === CotisationType.DEUX) {
      if (cotisation.pourcentage_patronal === null || cotisation.pourcentage_patronal === undefined) {
        return false;
      }
    }
    
    if (cotisation.type === CotisationType.SALARIAL || cotisation.type === CotisationType.DEUX) {
      if (cotisation.pourcentage_salarial === null || cotisation.pourcentage_salarial === undefined) {
        return false;
      }
    }
    
    return true;
  });
}

/**
 * Checks if a cotisation is valid
 */
export function isCotisationValid(cotisation: {
  id: number;
  label: string;
  description: string;
  type: CotisationType;
  pourcentage_salarial: number | null;
  pourcentage_patronal: number | null;
}): boolean {
  // Check basic required fields
  if (!cotisation.label.trim() || !cotisation.type) {
    return false;
  }
  
  // Check required percentage fields based on type
  if (cotisation.type === CotisationType.PATRONAL || cotisation.type === CotisationType.DEUX) {
    if (cotisation.pourcentage_patronal === null || cotisation.pourcentage_patronal === undefined) {
      return false;
    }
  }
  
  if (cotisation.type === CotisationType.SALARIAL || cotisation.type === CotisationType.DEUX) {
    if (cotisation.pourcentage_salarial === null || cotisation.pourcentage_salarial === undefined) {
      return false;
    }
  }
  
  return true;
}

/**
 * Checks if there are incomplete cotisations in an organisme
 */
export function hasIncompleteCotisations(organisme: {
  cotisations: Array<{
    id: number;
    label: string;
    description: string;
    type: CotisationType;
    pourcentage_salarial: number | null;
    pourcentage_patronal: number | null;
  }>;
}): boolean {
  return organisme.cotisations.some(cotisation => !isCotisationValid(cotisation));
}

/**
 * Checks if there are any incomplete organismes
 */
export function hasIncompleteOrganismes(organismes: Array<{
  id: number;
  label: string;
  description: string;
  cotisations: Array<{
    id: number;
    label: string;
    description: string;
    type: CotisationType;
    pourcentage_salarial: number | null;
    pourcentage_patronal: number | null;
  }>;
}>): boolean {
  return organismes.some(organisme => {
    // Check if organisme name is missing
    if (!organisme.label.trim()) {
      return true;
    }
    
    // If organisme has no cotisations, it's incomplete
    if (organisme.cotisations.length === 0) {
      return true;
    }
    
    // Check if there are incomplete cotisations
    return hasIncompleteCotisations(organisme);
  });
}

/**
 * Gets validation message for cotisations
 */
export function getCotisationValidationMessage(organisme: {
  label: string;
  cotisations: Array<{
    id: number;
    label: string;
    description: string;
    type: CotisationType;
    pourcentage_salarial: number | null;
    pourcentage_patronal: number | null;
  }>;
}): string | null {
  if (organisme.label.trim() && organisme.cotisations.length === 0) {
    return 'Au moins une cotisation est requise';
  }
  return null;
}

/**
 * Checks if a new cotisation can be added to an organisme
 */
export function canAddCotisation(organisme: {
  label: string;
  cotisations: Array<{
    id: number;
    label: string;
    description: string;
    type: CotisationType;
    pourcentage_salarial: number | null;
    pourcentage_patronal: number | null;
  }>;
}): boolean {
  return organisme.label.trim().length > 0 && !hasIncompleteCotisations(organisme);
}

/**
 * Validates an organisme with Zod schema
 */
export function validateOrganisme(data: unknown): ValidatedOrganisme {
  return organismeSchema.parse(data);
}

/**
 * Validates an organisme with error handling
 */
export function validateOrganismeWithError(data: unknown): {
  success: boolean;
  data?: ValidatedOrganisme;
  error?: z.ZodError;
} {
  const result = organismeSchema.safeParse(data);
  return {
    success: result.success,
    data: result.success ? result.data : undefined,
    error: result.success ? undefined : result.error,
  };
}

/**
 * Validates a cotisation with Zod schema
 */
export function validateCotisation(data: unknown): ValidatedCotisation {
  return cotisationSchema.parse(data);
}

/**
 * Validates a cotisation with error handling
 */
export function validateCotisationWithError(data: unknown): {
  success: boolean;
  data?: ValidatedCotisation;
  error?: z.ZodError;
} {
  const result = cotisationSchema.safeParse(data);
  return {
    success: result.success,
    data: result.success ? result.data : undefined,
    error: result.success ? undefined : result.error,
  };
}
