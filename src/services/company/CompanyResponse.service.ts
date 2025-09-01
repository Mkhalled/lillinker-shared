import { CompanyResponseDAO } from '@/dao/CompanyResponseDAO';
import { logger } from '@/lib/logger';
import { CompanyResponseRequest, CompanyResponseData } from '@/types/company-response';

// Type for raw database field structure
interface RawDataField {
  id: number;
  label: string;
  description: string | null | undefined;
  data_type: string;
  choices: unknown; // Use unknown instead of any for better type safety
}

export class CompanyResponseService {
  static async getResponseData(
    requestId: number,
    companyId: number
  ): Promise<CompanyResponseData | null> {
    try {
      logger.info('Fetching company response data', {
        service: 'CompanyResponseService',
        operation: 'getResponseData',
        requestId,
        companyId,
      });

      // Get freelance request details
      const freelanceRequest = await CompanyResponseDAO.getFreelanceRequestDetails(requestId);
      if (!freelanceRequest) {
        logger.warn('Freelance request not found', {
          service: 'CompanyResponseService',
          operation: 'getResponseData',
          requestId,
          companyId,
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
        requestOptionsCount: freelanceRequest.options.length,
      });

      return {
        freelance_request: {
          ...freelanceRequest,
          options: freelanceRequest.options.map(option => ({
            ...option,
            response_data: option.response_data as Record<string, string | number | boolean | null>,
            platformService: {
              ...option.platformService,
              dataFields: Array.isArray(option.platformService.dataFields)
                ? option.platformService.dataFields.map((field: RawDataField) => ({
                    id: field.id,
                    label: field.label,
                    description: field.description ?? null,
                    data_type: field.data_type,
                    choices: Array.isArray(field.choices)
                      ? (field.choices as string[])
                      : field.choices === null || field.choices === undefined
                        ? null
                        : null, // fallback for unexpected types
                  }))
                : [],
              description: option.platformService.description as string | null | undefined,
            },
          })),
        },
        company_services: companyServices,
        organismes: [],
      };
    } catch (error) {
      logger.warn('Error getting response data', {
        service: 'CompanyResponseService',
        operation: 'getResponseData',
        requestId,
        companyId,
        error: error instanceof Error ? error.message : error,
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
        selectedOrganismesCount: data.selected_organismes.length,
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
          existingResponseId: existingResponse.id,
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
        responseId: response.id,
      });

      return response;
    } catch (error) {
      logger.warn('Error creating company response', {
        service: 'CompanyResponseService',
        operation: 'createResponse',
        requestId: data.request_id,
        companyId,
        error: error instanceof Error ? error.message : error,
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
        selectedOrganismesCount: data.selected_organismes.length,
      });

      const response = await CompanyResponseDAO.updateCompanyResponse(data, companyId);

      logger.info('Company response updated successfully', {
        service: 'CompanyResponseService',
        operation: 'updateResponse',
        requestId,
        companyId,
        responseId: response.id,
      });

      return response;
    } catch (error) {
      logger.warn('Error updating company response', {
        service: 'CompanyResponseService',
        operation: 'updateResponse',
        requestId,
        companyId,
        error: error instanceof Error ? error.message : error,
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
        companyId,
      });

      const response = await CompanyResponseDAO.deleteCompanyResponse(requestId, companyId);

      logger.info('Company response deleted successfully', {
        service: 'CompanyResponseService',
        operation: 'deleteResponse',
        requestId,
        companyId,
        deletedCount: response.count,
      });

      return response;
    } catch (error) {
      logger.warn('Error deleting company response', {
        service: 'CompanyResponseService',
        operation: 'deleteResponse',
        requestId,
        companyId,
        error: error instanceof Error ? error.message : error,
      });
      throw error;
    }
  }
}
