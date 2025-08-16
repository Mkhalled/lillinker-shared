import type { demande, OptionInfo } from '@/types/demande';
import type { OrganismeWithCotisations } from '@/types/organisme';

// === COMPANY RESPONSE SPECIFIC TYPES (not duplicated elsewhere) ===
export interface CompanyResponse {
  id: number;
  request_id: number;
  company_id: number;
  service_id: number;
  management_fee: number;
  comment?: string;
  is_available: boolean;
  additional_data?: Record<string, unknown>;
  created_at: Date;
  updated_at: Date;
}

export interface CompanyResponseOrganisme {
  id: number;
  company_response_id: number;
  organisme_id: number;
  additional_data?: Record<string, unknown>;
  organisme: OrganismeWithCotisations;
}

export interface ServiceResponse {
  service_id: number;
  service_name: string;
  service_description: string;
  is_available: boolean;
  management_fee: number;
  comment: string;
  requirements?: Record<string, unknown>;
}

export interface SelectedOrganisme {
  organisme_id: number;
  label: string;
  total_patronal: number;
  total_salarial: number;
}

export interface CompanyResponseRequest {
  request_id: number;
  services: ServiceResponse[];
  selected_organismes: SelectedOrganisme[];
}

export interface CompanyService {
  id: number;
  service: {
    id: number;
    label: string;
    description?: string | null;
  };
  is_active: boolean;
}

export interface CompanyResponseData {
  freelance_request: demande;
  company_services: CompanyService[];
  organismes: OrganismeWithCotisations[];
}

export interface ExistingCompanyResponse {
  id: number;
  request_id: number;
  company_id: number;
  platform_service_id: number;
  management_fees: number;
  response_data: Record<string, unknown>;
  platformService: {
    id: number;
    label: string;
    description?: string | null;
  };
  organismes: CompanyResponseOrganisme[];
}

// === COMPONENT PROP INTERFACES ===
export interface CompanyResponseProps {
  requestId: number;
  onClose: () => void;
}

export interface ModalState {
  isOpen: boolean;
  type: 'success' | 'error' | 'info';
  title: string;
  message: string;
  onConfirm?: () => void;
}

export interface RequestOverviewProps {
  freelanceRequest: demande;
}

export interface RequestedServicesProps {
  options: OptionInfo[];
}
