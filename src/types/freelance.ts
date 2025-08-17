import { BaseUserInfo, SelectedService, PortagePreference } from './user';

// Common interface for request data (without personal info)
export interface FreelanceRequestData {
  hasMission: string;
  clientName: string;
  clientAddress: string;
  clientSector: string;
  tjm: string;
  days: string;
  wantsPortage: PortagePreference;
  selectedPortages: string[];
  selectedServices: SelectedService[];
  newServices: string[];
  priority: string;
  comments?: string;
  wantSalaried?: boolean;
  salary?: number;
  startDate?: Date;
}

export interface FreelanceFormData extends BaseUserInfo, FreelanceRequestData {
  // Step 1: Personal info (inherited from BaseUserInfo)
  metierId: number;
}

export interface FreelanceRequest extends FreelanceRequestData {
  // Only request data, no personal info or metierId
}
export interface FreelanceRequestInput {
  mission_status: 'OPEN' | 'CLOSED' | 'PENDING';
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  tjm: number;
  days: number;
  wants_portage: boolean;
  want_salaried?: boolean;
  salary?: number;
  start_date?: Date;
  client_name?: string;
  client_address?: string;
  client_sector?: string;
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
    id?: number;
    freelance_id?: number;
    metier?: { name?: string };
  };
}
