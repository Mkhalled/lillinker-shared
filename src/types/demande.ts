export interface PortageInfo {
  id: number;
  portage?: {
    id: number;
    name: string;
  };
  name?: string;
}

export interface OptionInfo {
  id: number;
  freelance_request_id?: number;
  service_option_id?: number;
  is_required?: boolean;
  platformService: {
    id?: number;
    label: string;
    description?: string | null;
    requires_data: boolean;
    dataFields?: {
      id: number;
      label: string;
      description: string | null;
      data_type: string;
      choices: string[] | null;
    }[];
    user?: {
      first_name: string;
      last_name: string;
      ownedCompany: {
        name: string;
      } | null;
    };
  };
  response_data?: Record<string, string | number | boolean | null>;
  description?: string | null;
}

export interface demande {
  id: number;
  mission_status: string;
  client_name?: string | null;
  client_sector?: string | null;
  client_address?: string | null;
  priority: string;
  tjm: number;
  days: number;
  wants_portage: boolean;
  want_salaried?: boolean;
  salary?: number | null;
  start_date?: Date | null;
  created_at: Date | string;
  freelance?: {
    user: {
      first_name: string;
      last_name: string;
    };
  };
  portages?: PortageInfo[];
  options?: OptionInfo[];
  responses?: Record<string, string | number | boolean | null>[];
}
