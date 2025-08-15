export interface CompanyResponse {
  id: number;
  request_id: number;
  company_id: number;
  service_id: number;
  management_fee: number;
  comment?: string;
  is_available: boolean;
  additional_data?: Record<string, any>;
  created_at: Date;
  updated_at: Date;
}

export interface CompanyResponseOrganisme {
  id: number;
  company_response_id: number;
  organisme_id: number;
  additional_data?: Record<string, any>;
  organisme: Organisme;
}

export interface Organisme {
  id: number;
  company_id: number;
  label: string;
  description?: string;
  cotisations: Cotisation[];
}

export interface Cotisation {
  id: number;
  organisme_id: number;
  label: string;
  description?: string;
  type: 'PATRONAL' | 'SALARIAL' | 'DEUX';
  pourcentage_salarial?: number;
  pourcentage_patronal?: number;
}

export interface ServiceResponse {
  service_id: number;
  service_name: string;
  service_description: string;
  is_available: boolean;
  management_fee: number;
  comment: string;
  requirements?: Record<string, any>;
}

export interface CompanyResponseRequest {
  request_id: number;
  services: ServiceResponse[];
  selected_organismes: {
    organisme_id: number;
    label: string;
    cotisations: {
      id: number;
      label: string;
      type: 'PATRONAL' | 'SALARIAL' | 'DEUX';
      pourcentage_patronal?: number | null;
      pourcentage_salarial?: number | null;
    }[];
  }[];
  cotisation_summary: {
    total_patronal: number;
    total_salarial: number;
    total_combined: number;
  };
  overall_message: string;
}

export interface CompanyResponseData {
  freelance_request: {
    id: number;
    freelance: {
      user: {
        first_name: string;
        last_name: string;
      };
    };
    tjm: number;
    days: number;
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
    mission_status: 'OPEN' | 'PENDING' | 'CLOSED';
    client_name?: string | null;
    client_address?: string | null;
    client_sector?: string | null;
    options: {
      id: number;
      freelance_request_id: number;
      service_option_id: number;
      is_required: boolean;
      response_data: any;
      platformService: {
        id: number;
        label: string;
        description?: string | null;
        data_type: string;
        requires_data: boolean;
      };
    }[];
  };
  company_services: {
    id: number;
    service: {
      id: number;
      label: string;
      description?: string | null;
    };
    is_active: boolean;
  }[];
  organismes: {
    id: number;
    company_id: number;
    label: string;
    description?: string | null;
    cotisations: {
      id: number;
      organisme_id: number;
      label: string;
      description?: string | null;
      type: 'PATRONAL' | 'SALARIAL' | 'DEUX';
      pourcentage_salarial?: number | null;
      pourcentage_patronal?: number | null;
    }[];
  }[];
}

// Add interface for existing response
export interface ExistingCompanyResponse {
  id: number;
  request_id: number;
  company_id: number;
  platform_service_id: number;
  management_fees: number;
  response_data: Record<string, any>;
  platformService: {
    id: number;
    label: string;
    description?: string | null;
  };
  organismes: {
    id: number;
    company_response_id: number;
    organisme_id: number;
    additional_data?: Record<string, any>;
    organisme: {
      id: number;
      company_id: number;
      label: string;
      description?: string | null;
      cotisations: {
        id: number;
        organisme_id: number;
        label: string;
        description?: string | null;
        type: 'PATRONAL' | 'SALARIAL' | 'DEUX';
        pourcentage_salarial?: number | null;
        pourcentage_patronal?: number | null;
      }[];
    };
  }[];
}
