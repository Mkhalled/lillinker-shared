import { OrganismeWithCotisations } from './organisme';
import { NewServiceData } from './platform';
import { PortagePreference } from './user';

export interface CompanyFormData {
  // Step 1: General info
  companyName: string;
  siret: string;
  description: string;
  isPortage: PortagePreference;
  date_creation?: Date;
  chiffre_affaires?: number;
  adresse?: string;
  site_web?: string;
  convention_collective?: string;
  code_naf_ape?: string;
  logo?: string ;

  // Step 2: Consultants and fees
  consultantCount: string;
  managementFeeRateMin: string;
  managementFeeRateMax: string;

  // Step 3: Metiers selection
  selectedMetiers: string[];

  // Step 4: Admin info
  adminFirstName: string;
  adminLastName: string;
  adminEmail: string;
  adminPhone: string;
  adminSex: 'MALE' | 'FEMALE' | '';

  // Step 5: Services selection and creation
  selectedPlatformServices: string[];
  selectedPortages: string[];
  newServices: NewServiceData[];
}

export interface CompanyPayload {
  id?: number;
  admin_user_id: number;
  name: string;
  description?: string;
  logo?: string;
  siret?: string;
  consultant_count: number;
  management_min: number;
  management_max: number;
  is_portage: boolean;
  date_creation?: Date;
  chiffre_affaires?: number;
  adresse?: string;
  site_web?: string;
  convention_collective?: string;
  code_naf_ape?: string;
}

export interface CompanyWithOrganismes extends CompanyPayload {
  organismes?: OrganismeWithCotisations[];
}

export interface ProfileData {
  user: {
    first_name?: string;
    last_name?: string;
    email?: string;
    phone_number?: string;
    sex?: string;
  };
  roleData?: {
    name?: string;
    consultant_count?: number;
    siret?: string;
    description?: string;
    management_fees?: number;
  };
}
