import { CotisationType } from '@prisma/client';

export interface OrganismePayload {
  label: string;
  description?: string;
  company_id: number;
}

export interface CotisationPayload {
  label: string;
  description?: string;
  type: CotisationType;
  pourcentage_salarial?: number;
  pourcentage_patronal?: number;
  organisme_id: number;
}

export interface OrganismeWithCotisations {
  id: number;
  company_id: number;
  label: string;
  description?: string;
  cotisations: CotisationData[];
}

export interface CotisationData {
  id: number;
  organisme_id: number;
  label: string;
  description?: string;
  type: CotisationType;
  pourcentage_salarial?: number;
  pourcentage_patronal?: number;
}

export interface CreateOrganismeRequest {
  label: string;
  description?: string;
  cotisations: CotisationInput[];
}

export interface CotisationInput {
  label: string;
  description?: string;
  type: CotisationType;
  pourcentage_salarial?: number;
  pourcentage_patronal?: number;
}

export interface UpdateOrganismeRequest {
  label?: string;
  description?: string;
  cotisations?: CotisationInput[];
}
