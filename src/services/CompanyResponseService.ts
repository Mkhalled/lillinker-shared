import { CompanyResponseDAO } from '@/dao/CompanyResponseDAO';
import { CompanyResponseRequest, CompanyResponseData } from '@/types/company-response';

export class CompanyResponseService {
  static async getResponseData(requestId: number, companyId: number): Promise<CompanyResponseData | null> {
    try {
      // Get freelance request details
      const freelanceRequest = await CompanyResponseDAO.getFreelanceRequestDetails(requestId);
      if (!freelanceRequest) {
        throw new Error('Freelance request not found');
      }

      // Get company services
      const companyServices = await CompanyResponseDAO.getCompanyServices(companyId);

      return {
        freelance_request: freelanceRequest,
        company_services: companyServices,
        organismes: [], // Will be fetched separately in the frontend
      };
    } catch (error) {
      console.error('Error getting response data:', error);
      throw error;
    }
  }

  static async createResponse(data: CompanyResponseRequest, companyId: number) {
    try {
      // Check if response already exists
      const existingResponse = await CompanyResponseDAO.checkExistingResponse(
        data.request_id, 
        companyId
      );

      if (existingResponse) {
        throw new Error('Response already exists for this request');
      }

      // Create the response
      const response = await CompanyResponseDAO.createCompanyResponse(data, companyId);
      return response;
    } catch (error) {
      console.error('Error creating company response:', error);
      throw error;
    }
  }

  static async getExistingResponse(requestId: number, companyId: number) {
    try {
      return await CompanyResponseDAO.getCompanyResponsesByRequest(requestId, companyId);
    } catch (error) {
      console.error('Error getting existing response:', error);
      throw error;
    }
  }

  static async updateResponse(responseId: number, data: any) {
    try {
      return await CompanyResponseDAO.updateCompanyResponse(responseId, data);
    } catch (error) {
      console.error('Error updating company response:', error);
      throw error;
    }
  }

  static async deleteResponse(responseId: number) {
    try {
      return await CompanyResponseDAO.deleteCompanyResponse(responseId);
    } catch (error) {
      console.error('Error deleting company response:', error);
      throw error;
    }
  }

  static calculateTotalCotisations(organismes: any[], selectedOrganismeIds: number[]) {
    let totalPatronal = 0;
    let totalSalarial = 0;

    organismes.forEach(organisme => {
      if (selectedOrganismeIds.includes(organisme.id)) {
        organisme.cotisations.forEach((cotisation: any) => {
          if (cotisation.type === 'PATRONAL' && cotisation.pourcentage_patronal) {
            totalPatronal += cotisation.pourcentage_patronal;
          } else if (cotisation.type === 'SALARIAL' && cotisation.pourcentage_salarial) {
            totalSalarial += cotisation.pourcentage_salarial;
          } else if (cotisation.type === 'DEUX') {
            if (cotisation.pourcentage_patronal) {
              totalPatronal += cotisation.pourcentage_patronal;
            }
            if (cotisation.pourcentage_salarial) {
              totalSalarial += cotisation.pourcentage_salarial;
            }
          }
        });
      }
    });

    return {
      totalPatronal: Math.round(totalPatronal * 100) / 100,
      totalSalarial: Math.round(totalSalarial * 100) / 100,
      totalCombined: Math.round((totalPatronal + totalSalarial) * 100) / 100,
    };
  }
}
