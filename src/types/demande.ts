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
  platformService: {
    label: string;
    data_label?: string;
    description?: string | null;
    data_type: string;
    requires_data: boolean;
    data_description?: string | null;
    choices?: string[]; // Replace unknown with string[] or a more specific type if needed
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
  client_name?: string;
  client_sector?: string;
  client_address?: string;
  priority: string;
  tjm: number;
  days: number;
  wants_portage: boolean;
  created_at: string;
  portages?: PortageInfo[];
  options?: OptionInfo[];
  responses: Record<string, string | number | boolean | null>[];
}
