import { Prisma } from '@prisma/client';

import { logger } from '@/lib/logger';
import { prisma } from '@/lib/prisma';
import {
  CompanyResponseRequest,
  CompanyResponseContent,
  ServiceResponseData,
} from '@/types/company-response';

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
              include: { dataFields: true },
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
            status: true,
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
      selectedOrganismesCount: data.selected_organismes.length,
    });

    return await prisma.$transaction(async tx => {
      // Transform ServiceResponse[] to ServiceResponseData[]
      const serviceResponses: ServiceResponseData[] = data.services
        .filter(service => service.is_available)
        .map(service => ({
          service_id: service.service_id,
          service_name: service.service_name,
          service_description: service.service_description,
          is_available: service.is_available,
          charge_pro: service.charge_pro,
          comment: service.comment || '',
        }));

      // Create the response data structure
      const responseData: CompanyResponseContent = {
        services: serviceResponses,
        selected_organismes: data.selected_organismes,
        frais_de_gestion: data.frais_de_gestion,
      };

      // Create single response record
      const response = await tx.companyResponse.create({
        data: {
          request_id: data.request_id,
          company_id: companyId,
          response_data: responseData as unknown as Prisma.InputJsonValue,
        },
      });

      // Link organismes to the response
      if (data.selected_organismes.length > 0) {
        await tx.companyResponseOrganisme.createMany({
          data: data.selected_organismes.map(organisme => ({
            company_response_id: response.id,
            organisme_id: organisme.organisme_id,
            additional_data: {
              organisme_label: organisme.label,
              total_patronal: organisme.total_patronal,
              total_salarial: organisme.total_salarial,
            } as unknown as Prisma.InputJsonValue,
          })),
        });
      }

      logger.info('Company response creation completed successfully', {
        dao: 'CompanyResponseDAO',
        operation: 'createCompanyResponse',
        requestId: data.request_id,
        companyId,
        responseId: response.id,
        servicesCount: serviceResponses.length,
        organismesLinked: data.selected_organismes.length,
      });

      return response;
    });
  }

  static async getCompanyResponsesByRequest(requestId: number, companyId: number) {
    return await prisma.companyResponse.findFirst({
      where: {
        request_id: requestId,
        company_id: companyId,
      },
      include: {
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
      selectedOrganismesCount: data.selected_organismes.length,
    });

    return await prisma.$transaction(async tx => {
      // Find existing response
      const existingResponse = await tx.companyResponse.findFirst({
        where: {
          request_id: data.request_id,
          company_id: companyId,
        },
        select: { id: true },
      });

      if (!existingResponse) {
        throw new Error('No existing response found to update');
      }

      // Delete existing organisme relationships
      await tx.companyResponseOrganisme.deleteMany({
        where: { company_response_id: existingResponse.id },
      });

      // Transform ServiceResponse[] to ServiceResponseData[]
      const serviceResponses: ServiceResponseData[] = data.services
        .filter(service => service.is_available)
        .map(service => ({
          service_id: service.service_id,
          service_name: service.service_name,
          service_description: service.service_description,
          is_available: service.is_available,
          charge_pro: service.charge_pro,
          comment: service.comment || '',
        }));

      // Create the response data structure
      const responseData: CompanyResponseContent = {
        services: serviceResponses,
        selected_organismes: data.selected_organismes,
        frais_de_gestion: data.frais_de_gestion,
      };

      // Update the response
      const response = await tx.companyResponse.update({
        where: { id: existingResponse.id },
        data: {
          response_data: responseData as unknown as Prisma.InputJsonValue,
          updated_at: new Date(),
        },
      });

      // Create new organisme relationships
      if (data.selected_organismes.length > 0) {
        await tx.companyResponseOrganisme.createMany({
          data: data.selected_organismes.map(organisme => ({
            company_response_id: response.id,
            organisme_id: organisme.organisme_id,
            additional_data: {
              organisme_label: organisme.label,
              total_patronal: organisme.total_patronal,
              total_salarial: organisme.total_salarial,
            } as unknown as Prisma.InputJsonValue,
          })),
        });
      }

      logger.info('Company response update completed successfully', {
        dao: 'CompanyResponseDAO',
        operation: 'updateCompanyResponse',
        requestId: data.request_id,
        companyId,
        responseId: response.id,
        servicesCount: serviceResponses.length,
        organismesLinked: data.selected_organismes.length,
      });

      return response;
    });
  }

  static async deleteCompanyResponse(requestId: number, companyId: number) {
    logger.info('Deleting company response in database', {
      dao: 'CompanyResponseDAO',
      operation: 'deleteCompanyResponse',
      requestId,
      companyId,
    });

    return await prisma.$transaction(async tx => {
      // Get the response for this request
      const response = await tx.companyResponse.findFirst({
        where: {
          request_id: requestId,
          company_id: companyId,
        },
        select: { id: true },
      });

      if (!response) {
        logger.warn('No response found to delete', {
          dao: 'CompanyResponseDAO',
          operation: 'deleteCompanyResponse',
          requestId,
          companyId,
        });
        return { count: 0 };
      }

      // Delete organisme relationships first
      await tx.companyResponseOrganisme.deleteMany({
        where: { company_response_id: response.id },
      });

      // Delete the response
      const deletedResponse = await tx.companyResponse.delete({
        where: { id: response.id },
      });

      logger.info('Company response deletion completed successfully', {
        dao: 'CompanyResponseDAO',
        operation: 'deleteCompanyResponse',
        requestId,
        companyId,
        responseId: deletedResponse.id,
      });

      return { count: 1 };
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
