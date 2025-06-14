import type { User, Prisma } from '@prisma/client';

import { logger } from '@/lib/logger';
import { prisma } from '@/lib/prisma';

export class UserDAO {
  static async findByEmailOrUsername(email: string, username: string): Promise<User | null> {
    logger.debug('Searching for user by email or username', { email, username });
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });
    logger.debug('User search result', { found: !!user, email, username });
    return user;
  }

  static async create(data: {
    firstname: string;
    lastname: string;
    email: string;
    username: string;
    password: string;
    roleId: number;
    isActive: boolean;
    emailVerified: boolean;
    phone?: string;
    companyId?: string;
    emailVerificationToken?: string;
    emailVerificationTokenExpiresAt?: Date;
  }): Promise<User> {
    logger.info('Creating new user', { email: data.email, roleId: data.roleId });
    const { roleId, companyId, ...userData } = data;
    const user = await prisma.user.create({
      data: {
        ...userData,
        role: {
          connect: {
            id: roleId,
          },
        },
        ...(companyId && {
          company: {
            connect: {
              id: companyId,
            },
          },
        }),
      },
    });
    logger.info('User created successfully', { userId: user.id, email: user.email });
    return user;
  }

  static async findById(id: string): Promise<User | null> {
    logger.debug('Searching for user by ID', { userId: id });
    const user = await prisma.user.findUnique({
      where: { id },
    });
    logger.debug('User search by ID result', { found: !!user, userId: id });
    return user;
  }

  static async findByEmail(email: string): Promise<User | null> {
    logger.debug('Searching for user by email', { email });
    const user = await prisma.user.findUnique({
      where: { email },
    });
    logger.debug('User search by email result', { found: !!user, email });
    return user;
  }

  static async update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    logger.info('Updating user', { userId: id });
    const user = await prisma.user.update({
      where: { id },
      data,
    });
    logger.info('User updated successfully', { userId: user.id });
    return user;
  }

  static async delete(id: string): Promise<User> {
    logger.info('Deleting user', { userId: id });
    const user = await prisma.user.delete({
      where: { id },
    });
    logger.info('User deleted successfully', { userId: user.id });
    return user;
  }
  static async findUserBasicInfoById(
    userId: string
  ): Promise<{ firstname: string; lastname: string; email: string } | null> {
    logger.debug('Searching for user basic info by ID', { userId });
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { firstname: true, lastname: true, email: true },
    });
    logger.debug('User basic info search result', { found: !!user, userId });
    return user;
  }
  static async findInactiveVerifiedUsers() {
    logger.debug('Searching for inactive but verified users');
    const users = await prisma.user.findMany({
      where: {
        emailVerified: true,
        isActive: false,
      },
      select: {
        firstname: true,
        lastname: true,
        email: true,
        role: {
          select: {
            name: true,
          },
        },
        company: true,
      },
    });
    logger.debug('Found inactive verified users', { count: users.length });
    return users;
  }
}
