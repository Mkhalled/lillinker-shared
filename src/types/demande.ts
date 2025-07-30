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
  portages?: any[];
  options?: any[];
  responses: Array<any>;
}
