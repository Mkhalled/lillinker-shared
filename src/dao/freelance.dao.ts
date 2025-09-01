import { Prisma } from '@prisma/client';

import { prisma } from '@/lib/prisma';
import { FreelanceRequestInput } from '@/types/freelance';

export class FreelanceDao {
  static async findByFreelanceId(id: number) {
    return prisma.freelance.findUnique({
      where: { freelance_id: id },
      include: { secteurActivite: true },
    });
  }
  static async createFreelanceProfile(userId: number, metierId: number) {
    return prisma.freelance.create({
      data: {
        freelance_id: userId,
        secteur_activite_id: metierId,
      },
    });
  }

  static async update(freelanceUserId: number, data: number) {
    return prisma.freelance.update({
      where: { freelance_id: freelanceUserId },
      data: {
        secteur_activite_id: data
      },
    });
  }

  static async createFreelanceRequest(freelanceId: number, data: FreelanceRequestInput) {
    return prisma.freelanceRequest.create({
      data: {
        ...data,
        freelance: { connect: { id: freelanceId } },
      },
    });
  }

  static async createFreelanceRequestOption(
    freelanceRequestId: number,
    service_option_id: number,
    is_required: boolean,
    responseDataJson?: Prisma.InputJsonValue
  ) {
    const option = await prisma.freelanceRequestOption.create({
      data: {
        freelance_request_id: freelanceRequestId,
        service_option_id: service_option_id,
        is_required: is_required,
        response_data: responseDataJson,
      },
    });
    return option;
  }
  static async createFreelanceRequestLabelSelected(freelanceRequestId: number, portageIds: number[]) {
    return prisma.requestLabelSelected.createMany({
      data: portageIds.map(portageId => ({
        freelance_request_id: freelanceRequestId,
        label_syndicat_id: portageId,
      })),
    });
  }
  static async getFreelanceRequestsByUserId(
    userId: number,
    page: number = 1,
    pageSize: number = 10
  ) {
    // Find the freelance record by userId
    const freelance = await prisma.freelance.findUnique({
      where: { freelance_id: userId },
      select: { id: true },
    });
    if (!freelance) return { data: [], total: 0 };

    const skip = (page - 1) * pageSize;
    const [data, total] = await Promise.all([
      prisma.freelanceRequest.findMany({
        where: { freelance_id: freelance.id },
        include: {
          freelance: true,
          options: {
            include: {
              platformService: {
                include: {
                  dataFields: true,
                },
              },
            },
          },
          responses: true,
          requestLabelsSelected: {
            include: {
              labelSyndicat: true,
            },
          },
        },
        skip,
        take: pageSize,
        orderBy: { created_at: 'desc' },
      }),
      prisma.freelanceRequest.count({
        where: { freelance_id: freelance.id },
      }),
    ]);

    return { data, total, page, pageSize };
  }
  // get freelance request details by request id
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
              include: {
                dataFields: true,
              },
            },
          },
        },
        responses: {
          include: {
            company: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });
  }
}
