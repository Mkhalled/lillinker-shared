import { prisma } from '@/lib/prisma';
import { NewServiceData } from '@/types/platform';
export class PlatformDAO {
  static async getActivePlatformServices() {
    return prisma.platformService.findMany({
      where: {
        status: 'ACTIVE',
      },
      orderBy: {
        label: 'asc',
      },
    });
  }
  static async getPortages() {
    return prisma.portage.findMany({
      orderBy: {
        name: 'asc',
      },
    });
  }
  static async getMetiers() {
    return prisma.metier.findMany({
      orderBy: {
        name: 'asc',
      },
    });
  }
  static async createPlatformService(userId: number, serviceData: NewServiceData) {
    return prisma.platformService.create({
      data: {
        user_id: userId,
        label: serviceData.service_label,
        description: serviceData.service_description || '',
        data_type: serviceData.data_type,
        requires_data: serviceData.requires_data,
        data_label: serviceData.data_label || '',
        data_description: serviceData.data_description || '',
        choices:
          serviceData.choices && serviceData.choices.length > 0 ? serviceData.choices : undefined,
        status: 'PENDING',
      },
    });
  }
  static async createCompanyService(companyId: number, serviceId: number, isActive: boolean) {
    return prisma.companyService.create({
      data: {
        company_id: companyId,
        service_id: serviceId,
        is_active: isActive,
      },
    });
  }
}
