import type { User, Prisma } from '@prisma/client';

import { logger } from '@/lib/logger';
import { prisma } from '@/lib/prisma';

export class UserDAO {
  static async create(data: {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    role: 'ADMIN' | 'COMPANY' | 'MANAGER' | 'FREELANCE';
    status?: boolean;
    phone_number?: string;
    email_verified?: boolean;
    verification_token?: string;
    verification_token_expires?: Date;
  }): Promise<User> {
    logger.info('Creating new user', { email: data.email, role: data.role });
    const user = await prisma.user.create({
      data: {
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        password: data.password,
        role: data.role,
        status: data.status ?? true,
        phone_number: data.phone_number,
        email_verified: data.email_verified ?? false,
        verification_token: data.verification_token,
        verification_token_expires: data.verification_token_expires,
      },
    });
    logger.info('User created successfully', { userId: user.id, email: user.email });
    return user;
  }

  static async findById(id: number): Promise<User | null> {
    logger.debug('Searching for user by ID', { userId: id });
    const user = (await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        first_name: true,
        last_name: true,
        email: true,
        role: true,
        status: true,
        phone_number: true,
      },
    })) as User | null;
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

  static async update(id: number, data: Prisma.UserUpdateInput): Promise<User> {
    logger.info('Updating user', { userId: id });
    const user = await prisma.user.update({
      where: { id },
      data,
    });
    logger.info('User updated successfully', { userId: user.id });
    return user;
  }

  static async delete(id: number): Promise<User> {
    logger.info('Deleting user', { userId: id });
    const user = await prisma.user.delete({
      where: { id },
    });
    logger.info('User deleted successfully', { userId: user.id });
    return user;
  }

  static async findInactiveVerifiedUsers() {
    logger.debug('Searching for inactive but verified users');
    const users = await prisma.user.findMany({
      where: {
        email_verified: true,
        status: false,
      },
      select: {
        first_name: true,
        last_name: true,
        email: true,
        role: true,
        ownedCompany: true,
      },
    });
    logger.debug('Found inactive verified users', { count: users.length });
    return users;
  }
  static async findByVerificationToken(token: string): Promise<User | null> {
    return prisma.user.findFirst({
      where: {
        verification_token: token,
        verification_token_expires: {
          gt: new Date(),
        },
      },
    });
  }

  static async setPasswordAndVerifyEmail(userId: number, hashedPassword: string): Promise<User> {
    return prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        email_verified: true,
        verification_token: null,
        verification_token_expires: null,
      },
    });
  }
}
