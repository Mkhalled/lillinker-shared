import { Prisma } from '@prisma/client';

import { prisma } from '@/lib/prisma';
import { CompanyPayload } from '@/types/company';

export class CompanyDAO {
  static async create(data: CompanyPayload) {
    return prisma.company.create({
      data,
    });
  }

  static async findByUserId(id: number) {
    return prisma.company.findUnique({
      where: { admin_user_id: id },
    });
  }

  static async findBySiret(siret: string) {
    return prisma.company.findUnique({
      where: {
        siret: siret.trim(),
      },
    });
  }

  static async update(id: number, data: Prisma.CompanyUpdateInput) {
    return prisma.company.update({
      where: { id: id },
      data,
    });
  }

  static async delete(id: number) {
    return prisma.company.delete({
      where: { id: id },
    });
  }
  static async addCompanyService(companyId: number, serviceId: number) {
    return prisma.companyService.create({
      data: {
        company_id: companyId,
        service_id: serviceId,
        is_active: true,
      },
    });
  }
  static async addCompanyMetiers(companyId: number, metierIds: number[]) {
    return prisma.companyMetier.createMany({
      data: metierIds.map(metierId => ({
        company_id: companyId,
        metier_id: metierId,
      })),
    });
  }
  static async addCompanyPortages(companyId: number, portageIds: number[]) {
    return prisma.companyPortage.createMany({
      data: portageIds.map(portageId => ({
        company_id: companyId,
        portage_id: portageId,
      })),
    });
  }
}
