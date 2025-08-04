// Common user-related types used across different modals

export interface BaseUserInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  sex?: 'MALE' | 'FEMALE';
}

export interface SelectedService {
  serviceId: number;
  isRequired: boolean;
  responseData?: string;
}

export interface NewService {
  id: string;
  label: string;
  description: string;
  requiresData: boolean;
  dataType: string;
  dataLabel: string;
  dataDescription: string;
  choices: string[];
}

export interface BaseModalProps {
  onClose: () => void;
}

export type PortagePreference = 'yes' | 'no';
export type PriorityLevel = 'HIGH' | 'MEDIUM' | 'LOW';
