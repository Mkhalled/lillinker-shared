import { BaseUserInfo, SelectedService, PortagePreference } from './user';

export interface FreelanceFormData extends BaseUserInfo {
  // Step 1: Personal info (inherited from BaseUserInfo)
  metierId: number;

  // Step 2: Mission info
  hasMission: string;
  clientName: string;
  clientAddress: string;
  clientSector: string;
  tjm: string;
  days: string;
  wantsPortage: PortagePreference;
  selectedPortages: string[];

  // Step 3: Services
  selectedServices: SelectedService[];
  newServices: string[];

  // Step 4: Priority
  priority: string;

  // Step 5: Summary
  comments?: string;
}
