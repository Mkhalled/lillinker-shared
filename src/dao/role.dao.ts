import { Role } from '@prisma/client';

import { prisma } from '@/lib/prisma';

export class RoleDAO {
  static async findByName(name: string): Promise<Role | null> {
    return prisma.role.findUnique({
      where: { name },
    });
  }
}
