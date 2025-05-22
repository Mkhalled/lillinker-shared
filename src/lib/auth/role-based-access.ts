import { logger } from '@/lib/logger';
import { prisma } from '@/lib/prisma';

export async function hasRequiredRole(userId: number, requiredRoles: string[]): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId.toString() },
      include: {
        role: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!user || !user.role) {
      return false;
    }

    return requiredRoles.includes(user.role.name);
  } catch (error) {
    logger.error('Role check error', error as Error);
    throw new Error('Failed to check user role');
  }
}

export async function checkUserRole(userId: string, requiredRoles: string[]) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { role: true },
    });

    if (!user) {
      return false;
    }

    return requiredRoles.includes(user.role.name);
  } catch (error) {
    logger.error('Role check error', error as Error);
    throw new Error('Failed to check user role');
  }
}
