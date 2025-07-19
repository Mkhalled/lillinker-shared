import type { User, Prisma } from '@prisma/client';

import { logger } from '@/lib/logger';
import { prisma } from '@/lib/prisma';

export class UserDAO {
  static async findByEmailOrUsername(email: string, username: string): Promise<User | null> {
    logger.debug('Searching for user by email or username', { email, username });
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { email: username }], // Username field removed from schema
      },
    });
    logger.debug('User search result', { found: !!user, email, username });
    return user;
  }

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
  static async findUserBasicInfoById(
    userId: number
  ): Promise<{ first_name: string; last_name: string; email: string } | null> {
    logger.debug('Searching for user basic info by ID', { userId });
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { first_name: true, last_name: true, email: true },
    });
    logger.debug('User basic info search result', { found: !!user, userId });
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
    logger.debug('Searching for user by verification token');
    const user = await prisma.user.findUnique({
      where: { verification_token: token },
    });
    logger.debug('User search by verification token result', { found: !!user });
    return user;
  }

  static async findByResetToken(token: string): Promise<User | null> {
    logger.debug('Searching for user by reset token');
    const user = await prisma.user.findUnique({
      where: { reset_token: token },
    });
    logger.debug('User search by reset token result', { found: !!user });
    return user;
  }

  static async updateVerificationStatus(id: number, verified: boolean): Promise<User> {
    logger.info('Updating user verification status', { userId: id, verified });
    const user = await prisma.user.update({
      where: { id },
      data: {
        email_verified: verified,
        verification_token: null,
        verification_token_expires: null,
      },
    });
    logger.info('User verification status updated', { userId: user.id });
    return user;
  }

  static async setResetToken(id: number, token: string, expiresAt: Date): Promise<User> {
    logger.info('Setting reset token for user', { userId: id });
    const user = await prisma.user.update({
      where: { id },
      data: {
        reset_token: token,
        reset_token_expires: expiresAt,
      },
    });
    logger.info('Reset token set for user', { userId: user.id });
    return user;
  }

  static async clearResetToken(id: number): Promise<User> {
    logger.info('Clearing reset token for user', { userId: id });
    const user = await prisma.user.update({
      where: { id },
      data: {
        reset_token: null,
        reset_token_expires: null,
      },
    });
    logger.info('Reset token cleared for user', { userId: user.id });
    return user;
  }
}
