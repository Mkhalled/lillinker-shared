import { Prisma } from '@prisma/client';

import { prisma } from '@/lib/prisma';

export class CompanyDAO {
  static async create(data: Prisma.CompanyCreateInput) {
    return prisma.company.create({
      data,
    });
  }

  static async findById(id: string) {
    return prisma.company.findUnique({
      where: { id },
    });
  }

  static async findBySiret(siret: string) {
    return prisma.company.findUnique({
      where: { siret },
    });
  }

  static async update(id: string, data: Prisma.CompanyUpdateInput) {
    return prisma.company.update({
      where: { id },
      data,
    });
  }

  static async delete(id: string) {
    return prisma.company.delete({
      where: { id },
    });
  }
}
