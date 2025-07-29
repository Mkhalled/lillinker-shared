import { prisma } from '@/lib/prisma';
import { FreelanceRequestInput } from '@/types/freelance';

export class FreelanceDao {
  static async createFreelanceProfile(userId: number, metierId: number) {
    return prisma.freelance.create({
      data: {
        freelance_id: userId,
        metier_id: metierId,
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
    responseDataJson?: any
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
  static async createFreelanceRequestPortages(freelanceRequestId: number, portageIds: number[]) {
    return prisma.freelanceRequestPortage.createMany({
      data: portageIds.map(portageId => ({
        freelance_request_id: freelanceRequestId,
        portage_id: portageId,
      })),
    });
  }
}
