import { prisma } from '@/lib/prisma';
import { CompanyResponseRequest } from '@/types/company-response';

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
                is_available: service.is_available,
                requirements: service.requirements || {},
                overall_message: data.overall_message,
                cotisation_summary: data.cotisation_summary,
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
                cotisations: organisme.cotisations,
                cotisation_summary: data.cotisation_summary,
                overall_message: data.overall_message,
              },
            })),
          });
        }
      }

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

  static async updateCompanyResponse(responseId: number, data: Partial<{ management_fees: number; response_data: any }>) {
    return await prisma.companyResponse.update({
      where: { id: responseId },
      data: {
        management_fees: data.management_fees,
        response_data: data.response_data,
      },
    });
  }

  static async deleteCompanyResponse(responseId: number) {
    return await prisma.$transaction(async (tx) => {
      // Delete organisme relationships first
      await tx.companyResponseOrganisme.deleteMany({
        where: { company_response_id: responseId },
      });

      // Delete the response
      await tx.companyResponse.delete({
        where: { id: responseId },
      });
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
