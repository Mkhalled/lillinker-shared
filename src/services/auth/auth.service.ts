import { randomBytes } from 'crypto';
import { hash } from 'bcryptjs';

import { logger } from '@/lib/logger';
import { sendVerificationEmail } from '@/lib/mailer';
import { prisma } from '@/lib/prisma';
import type { InitialRegistration } from '@/lib/validations/auth.validation';

export class AuthService {
  /**
   * Create a new user account with verification token
   */
  static async createUser(data: InitialRegistration) {
    const logContext = {
      operation: 'createUser',
      email: data.email,
      role: data.role,
    };

    try {
      logger.info('Starting user creation process', logContext);

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: data.email },
      });

      if (existingUser) {
        logger.warn('User creation attempt with existing email', {
          ...logContext,
          existingUserId: existingUser.id,
        });
        throw new Error('Un utilisateur avec cette adresse e-mail existe déjà');
      }

      // Generate verification token
      const verificationToken = randomBytes(32).toString('hex');
      const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      logger.debug('Generated verification token', {
        ...logContext,
        tokenLength: verificationToken.length,
        expiresAt: verificationTokenExpires,
      });

      // Create user with temporary password (will be set during email verification)
      const tempPassword = await hash(randomBytes(32).toString('hex'), 12);

      const user = await prisma.user.create({
        data: {
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email,
          password: tempPassword,
          role: data.role,
          phone_number: data.phone_number,
          email_verified: false,
          verification_token: verificationToken,
          verification_token_expires: verificationTokenExpires,
          status: false, // Will be activated after onboarding completion
        },
      });

      logger.info('User created successfully', {
        ...logContext,
        userId: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
      });

      return { user, verificationToken };
    } catch (error) {
      logger.error('User creation failed', error as Error, logContext);
      throw error;
    }
  }

  /**
   * Send verification email to user
   */
  static async sendVerificationEmail(userId: number) {
    const logContext = {
      operation: 'sendVerificationEmail',
      userId,
    };

    try {
      logger.info('Starting verification email process', logContext);

      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        logger.warn('User not found for verification email', logContext);
        throw new Error('User not found');
      }

      // Generate verification token and send email
      const verificationToken = randomBytes(32).toString('hex');
      const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

      await prisma.user.update({
        where: { id: userId },
        data: {
          verification_token: verificationToken,
          verification_token_expires: verificationTokenExpires,
        },
      });

      logger.debug('Verification token updated', {
        ...logContext,
        email: user.email,
        expiresAt: verificationTokenExpires,
      });

      // Send verification email
      await sendVerificationEmail(
        user.email,
        verificationToken,
        user.first_name
      );

      logger.info('Verification email sent successfully', {
        ...logContext,
        email: user.email,
        firstName: user.first_name,
      });

      return { success: true, message: 'Verification email sent' };
    } catch (error) {
      logger.error('Verification email sending failed', error as Error, logContext);
      throw error;
    }
  }

  /**
   * Verify email and set user password
   */
  static async verifyEmailAndSetPassword(token: string, password: string) {
    const logContext = {
      operation: 'verifyEmailAndSetPassword',
      tokenLength: token.length,
    };

    try {
      logger.info('Starting email verification and password setting', logContext);

      const user = await prisma.user.findUnique({
        where: { 
          verification_token: token,
          verification_token_expires: {
            gt: new Date(),
          },
        },
      });

      if (!user) {
        logger.warn('Invalid or expired verification token', {
          ...logContext,
          token: token.substring(0, 8) + '...', // Log partial token for debugging
        });
        throw new Error('Token de vérification invalide ou expiré');
      }

      logger.debug('Valid verification token found', {
        ...logContext,
        userId: user.id,
        email: user.email,
      });

      const hashedPassword = await hash(password, 12);

      await prisma.user.update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
          email_verified: true,
          verification_token: null,
          verification_token_expires: null,
        },
      });

      logger.info('Email verification and password setting completed successfully', {
        ...logContext,
        userId: user.id,
        email: user.email,
        firstName: user.first_name,
      });

      return { success: true, message: 'Email vérifié et mot de passe défini avec succès' };
    } catch (error) {
      logger.error('Email verification and password setting failed', error as Error, logContext);
      throw error;
    }
  }

  /**
   * Check if email exists in the system
   */
  static async checkEmailExists(email: string): Promise<boolean> {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    return !!existingUser;
  }
}
