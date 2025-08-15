import { CompanyResponseDAO } from '@/dao/CompanyResponseDAO';
import { CompanyResponseRequest, CompanyResponseData } from '@/types/company-response';
import { logger } from '@/lib/logger';

export class CompanyResponseService {
  static async getResponseData(requestId: number, companyId: number): Promise<CompanyResponseData | null> {
    try {
      logger.info('Fetching company response data', {
        service: 'CompanyResponseService',
        operation: 'getResponseData',
        requestId,
        companyId
      });

      // Get freelance request details
      const freelanceRequest = await CompanyResponseDAO.getFreelanceRequestDetails(requestId);
      if (!freelanceRequest) {
        logger.warn('Freelance request not found', {
          service: 'CompanyResponseService',
          operation: 'getResponseData',
          requestId,
          companyId
        });
        throw new Error('Freelance request not found');
      }

      // Get company services
      const companyServices = await CompanyResponseDAO.getCompanyServices(companyId);

      logger.info('Company response data retrieved successfully', {
        service: 'CompanyResponseService',
        operation: 'getResponseData',
        requestId,
        companyId,
        companyServicesCount: companyServices.length,
        requestOptionsCount: freelanceRequest.options.length
      });

      return {
        freelance_request: freelanceRequest,
        company_services: companyServices,
        organismes: [], // Will be fetched separately in the frontend
      };
    } catch (error) {
      logger.warn('Error getting response data', {
        service: 'CompanyResponseService',
        operation: 'getResponseData',
        requestId,
        companyId,
        error: error instanceof Error ? error.message : error
      });
      throw error;
    }
  }

  static async createResponse(data: CompanyResponseRequest, companyId: number) {
    try {
      logger.info('Creating company response', {
        service: 'CompanyResponseService',
        operation: 'createResponse',
        requestId: data.request_id,
        companyId,
        servicesCount: data.services.length,
        availableServicesCount: data.services.filter(s => s.is_available).length,
        selectedOrganismesCount: data.selected_organismes.length
      });

      // Check if response already exists
      const existingResponse = await CompanyResponseDAO.checkExistingResponse(
        data.request_id, 
        companyId
      );

      if (existingResponse) {
        logger.warn('Attempted to create duplicate response', {
          service: 'CompanyResponseService',
          operation: 'createResponse',
          requestId: data.request_id,
          companyId,
          existingResponseId: existingResponse.id
        });
        throw new Error('Response already exists for this request');
      }

      // Create the response
      const response = await CompanyResponseDAO.createCompanyResponse(data, companyId);
      
      logger.info('Company response created successfully', {
        service: 'CompanyResponseService',
        operation: 'createResponse',
        requestId: data.request_id,
        companyId,
        responseCount: Array.isArray(response) ? response.length : 1
      });

      return response;
    } catch (error) {
      logger.warn('Error creating company response', {
        service: 'CompanyResponseService',
        operation: 'createResponse',
        requestId: data.request_id,
        companyId,
        error: error instanceof Error ? error.message : error
      });
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

  static async updateResponse(requestId: number, companyId: number, data: CompanyResponseRequest) {
    try {
      logger.info('Updating company response', {
        service: 'CompanyResponseService',
        operation: 'updateResponse',
        requestId,
        companyId,
        servicesCount: data.services.length,
        availableServicesCount: data.services.filter(s => s.is_available).length,
        selectedOrganismesCount: data.selected_organismes.length
      });

      const response = await CompanyResponseDAO.updateCompanyResponse(data, companyId);
      
      logger.info('Company response updated successfully', {
        service: 'CompanyResponseService',
        operation: 'updateResponse',
        requestId,
        companyId,
        responseCount: Array.isArray(response) ? response.length : 1
      });

      return response;
    } catch (error) {
      logger.warn('Error updating company response', {
        service: 'CompanyResponseService',
        operation: 'updateResponse',
        requestId,
        companyId,
        error: error instanceof Error ? error.message : error
      });
      throw error;
    }
  }

  static async deleteResponse(requestId: number, companyId: number) {
    try {
      logger.info('Deleting company response', {
        service: 'CompanyResponseService',
        operation: 'deleteResponse',
        requestId,
        companyId
      });

      const response = await CompanyResponseDAO.deleteCompanyResponse(requestId, companyId);
      
      logger.info('Company response deleted successfully', {
        service: 'CompanyResponseService',
        operation: 'deleteResponse',
        requestId,
        companyId,
        deletedCount: response.count
      });

      return response;
    } catch (error) {
      logger.warn('Error deleting company response', {
        service: 'CompanyResponseService',
        operation: 'deleteResponse',
        requestId,
        companyId,
        error: error instanceof Error ? error.message : error
      });
      throw error;
    }
  }


}
