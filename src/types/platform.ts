export interface NewServiceData {
  service_label: string;
  service_description?: string;
  data_type: 'TEXT' | 'NUMBER' | 'SELECT' | 'RADIO';
  requires_data: boolean;
  data_label?: string;
  data_description?: string;
  choices?: string[];
}

export interface PlatformService {
  id: number;
  label: string;
  description: string | null;
  data_type: string;
  requires_data: boolean;
  data_label: string;
  data_description: string | null;
  choices: unknown;
  status?: string;
  user?: {
    first_name: string;
    last_name: string;
    ownedCompany: {
      name: string;
    } | null;
  };
}
