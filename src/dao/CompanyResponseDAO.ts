import { prisma } from '@/lib/prisma';
import { CompanyResponseRequest } from '@/types/company-response';
import { logger } from '@/lib/logger';

export class CompanyResponseDAO {
  static async getFreelanceRequestDetails(requestId: number) {
    return await prisma.freelanceRequest.findUnique({
      where: { id: requestId },
      include: {
        freelance: {
          include: {
            user: {
              select: {
                first_name: true,
                last_name: true,
              },
            },
          },
        },
        options: {
          include: {
            platformService: {
              select: {
                id: true,
                label: true,
                description: true,
                data_type: true,
                requires_data: true,
              },
            },
          },
        },
      },
    });
  }

  static async getCompanyServices(companyId: number) {
    return await prisma.companyService.findMany({
      where: { 
        company_id: companyId,
        is_active: true,
      },
      include: {
        service: {
          select: {
            id: true,
            label: true,
            description: true,
          },
        },
      },
    });
  }

  static async getCompanyOrganismes(companyId: number) {
    return await prisma.organisme.findMany({
      where: { company_id: companyId },
      include: {
        cotisations: true,
      },
    });
  }


  static async createCompanyResponse(data: CompanyResponseRequest, companyId: number) {
    logger.info('Creating company response in database', {
      dao: 'CompanyResponseDAO',
      operation: 'createCompanyResponse',
      requestId: data.request_id,
      companyId,
      servicesCount: data.services.length,
      availableServicesCount: data.services.filter(s => s.is_available).length,
      selectedOrganismesCount: data.selected_organismes.length
    });

    return await prisma.$transaction(async (tx) => {
      const responses = [];
      
      // Create responses for each selected service
      for (const service of data.services) {
        if (service.is_available) {
          const response = await tx.companyResponse.create({
            data: {
              request_id: data.request_id,
              company_id: companyId,
              platform_service_id: service.service_id,
              management_fees: service.management_fee,
              response_data: {
                comment: service.comment || '',
                selected_organismes_details: data.selected_organismes,
              },
            },
          });
          responses.push(response);
        }
      }

      // Link organismes to each response with detailed cotisation data
      if (responses.length > 0 && data.selected_organismes.length > 0) {
        for (const response of responses) {
          await tx.companyResponseOrganisme.createMany({
            data: data.selected_organismes.map(organisme => ({
              company_response_id: response.id,
              organisme_id: organisme.organisme_id,
              additional_data: {
                organisme_label: organisme.label,
                total_patronal: organisme.total_patronal,
                total_salarial: organisme.total_salarial,
              },
            })),
          });
        }
      }

      logger.info('Company response creation completed successfully', {
        dao: 'CompanyResponseDAO',
        operation: 'createCompanyResponse',
        requestId: data.request_id,
        companyId,
        totalResponsesCreated: responses.length,
        organismesLinked: responses.length > 0 ? data.selected_organismes.length : 0
      });

      return responses;
    });
  }

  static async getCompanyResponsesByRequest(requestId: number, companyId: number) {
    return await prisma.companyResponse.findMany({
      where: {
        request_id: requestId,
        company_id: companyId,
      },
      include: {
        platformService: {
          select: {
            id: true,
            label: true,
            description: true,
          },
        },
        organismes: {
          include: {
            organisme: {
              include: {
                cotisations: true,
              },
            },
          },
        },
      },
    });
  }

  static async updateCompanyResponse(data: CompanyResponseRequest, companyId: number) {
    logger.info('Updating company response in database', {
      dao: 'CompanyResponseDAO',
      operation: 'updateCompanyResponse',
      requestId: data.request_id,
      companyId,
      servicesCount: data.services.length,
      availableServicesCount: data.services.filter(s => s.is_available).length,
      selectedOrganismesCount: data.selected_organismes.length
    });

    return await prisma.$transaction(async (tx) => {
      // First, delete all existing responses for this request
      const existingResponses = await tx.companyResponse.findMany({
        where: {
          request_id: data.request_id,
          company_id: companyId,
        },
        select: { id: true },
      });

      // Delete organisme relationships first
      for (const response of existingResponses) {
        await tx.companyResponseOrganisme.deleteMany({
          where: { company_response_id: response.id },
        });
      }

      // Delete existing responses
      await tx.companyResponse.deleteMany({
        where: {
          request_id: data.request_id,
          company_id: companyId,
        },
      });

      // Create new responses
      const responses = [];
      
      for (const service of data.services) {
        if (service.is_available) {
          const response = await tx.companyResponse.create({
            data: {
              request_id: data.request_id,
              company_id: companyId,
              platform_service_id: service.service_id,
              management_fees: service.management_fee,
              response_data: {
                comment: service.comment || '',
                selected_organismes_details: data.selected_organismes,
              },
            },
          });
          responses.push(response);
        }
      }

      // Link organismes to each response
      if (responses.length > 0 && data.selected_organismes.length > 0) {
        for (const response of responses) {
          await tx.companyResponseOrganisme.createMany({
            data: data.selected_organismes.map(organisme => ({
              company_response_id: response.id,
              organisme_id: organisme.organisme_id,
              additional_data: {
                organisme_label: organisme.label,
                total_patronal: organisme.total_patronal,
                total_salarial: organisme.total_salarial,
              },
            })),
          });
        }
      }

      logger.info('Company response update completed successfully', {
        dao: 'CompanyResponseDAO',
        operation: 'updateCompanyResponse',
        requestId: data.request_id,
        companyId,
        totalResponsesUpdated: responses.length,
        organismesLinked: responses.length > 0 ? data.selected_organismes.length : 0
      });

      return responses;
    });
  }

  static async deleteCompanyResponse(requestId: number, companyId: number) {
    logger.info('Deleting company response in database', {
      dao: 'CompanyResponseDAO',
      operation: 'deleteCompanyResponse',
      requestId,
      companyId
    });

    return await prisma.$transaction(async (tx) => {
      // Get all responses for this request
      const responses = await tx.companyResponse.findMany({
        where: {
          request_id: requestId,
          company_id: companyId,
        },
        select: { id: true },
      });

      // Delete organisme relationships first
      for (const response of responses) {
        await tx.companyResponseOrganisme.deleteMany({
          where: { company_response_id: response.id },
        });
      }

      // Delete the responses
      const deletedResponses = await tx.companyResponse.deleteMany({
        where: {
          request_id: requestId,
          company_id: companyId,
        },
      });

      logger.info('Company response deletion completed successfully', {
        dao: 'CompanyResponseDAO',
        operation: 'deleteCompanyResponse',
        requestId,
        companyId,
        deletedCount: deletedResponses.count
      });

      return deletedResponses;
    });
  }

  static async checkExistingResponse(requestId: number, companyId: number) {
    return await prisma.companyResponse.findFirst({
      where: {
        request_id: requestId,
        company_id: companyId,
      },
    });
  }
}
