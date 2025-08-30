export interface NewServiceData {
  service_label: string;
  service_description?: string;
  requires_data: boolean;
  dataFields?: {
    label: string;
    description?: string;
    data_type: 'TEXT' | 'NUMBER' | 'SELECT' | 'RADIO';
    choices?: string[];
  }[];
}

export interface PlatformServiceDataField {
  id: number;
  label: string;
  description: string | null;
  data_type: 'TEXT' | 'NUMBER' | 'SELECT' | 'RADIO';
  choices: string[] | null;
}

export interface PlatformService {
  id: number;
  label: string;
  description: string | null;
  requires_data: boolean;
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING';
  user?: {
    first_name: string;
    last_name: string;
    ownedCompany: {
      name: string;
    } | null;
  };
  dataFields: PlatformServiceDataField[];
}