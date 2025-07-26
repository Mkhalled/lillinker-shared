import { NewService, PortagePreference } from './user';

export interface CompanyFormData {
  // Step 1: General info
  companyName: string;
  siret: string;
  description: string;
  isPortage: PortagePreference;

  // Step 2: Consultants and fees
  consultantCount: string;
  managementFeeRate: string;

  // Step 3: Metiers selection
  selectedMetiers: string[];

  // Step 4: Admin info
  adminFirstName: string;
  adminLastName: string;
  adminEmail: string;
  adminPhone: string;

  // Step 5: Services selection and creation
  selectedPlatformServices: string[];
  selectedPortages: string[];
  newServices: NewService[];
}
