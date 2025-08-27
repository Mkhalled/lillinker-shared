import { prisma } from '@/lib/prisma';
import { NewServiceData } from '@/types/platform';
export class PlatformDAO {
  static async getActivePlatformServices() {
    return prisma.platformService.findMany({
      where: {
        status: 'ACTIVE',
      },
      include: {dataFields:true},
      orderBy: {
        label: 'asc',
      },
    });
  }
  static async getLabelSyndicat() {
    return prisma.labelSyndicat.findMany({
      orderBy: {
        name: 'asc',
      },
    });
  }
  static async getSecteurActivite() {
    return prisma.secteurActivite.findMany({
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
        description: serviceData.service_description || null,
        requires_data: serviceData.requires_data,
        status: 'PENDING',
        dataFields: {
          create: serviceData.dataFields?.map(field => ({
            label: field.label,
            description: field.description || null,
            data_type: field.data_type,
            choices: field.choices !== undefined ? field.choices : undefined, // Ensure choices is JSON-compatible
          })) || [],
        },
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
