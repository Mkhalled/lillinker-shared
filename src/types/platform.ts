export interface NewServiceData {
  service_label: string;
  service_description?: string;
  data_type: 'TEXT' | 'NUMBER' | 'SELECT' | 'RADIO';
  requires_data: boolean;
  data_label?: string;
  data_description?: string;
  choices?: string[];
}