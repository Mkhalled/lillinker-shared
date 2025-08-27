import { randomBytes } from 'crypto';

import { Prisma } from '@prisma/client';
import { hash } from 'bcryptjs';

import { UserDAO } from '@/dao/user.dao';
import { logger } from '@/lib/logger';
import { sendVerificationEmail } from '@/lib/mailer';
import type { InitialRegistration } from '@/lib/validations/auth.validation';

type TransactionClient = Prisma.TransactionClient;
export class AuthService {
  /**
   * Create a new user account with verification token
   */
  static async createUser(data: InitialRegistration, tx: TransactionClient) {
    const logContext = {
      operation: 'createUser',
      email: data.email,
      role: data.role,
    };

    try {
      logger.info('Starting user creation process within transaction', logContext);

      // Check if user already exists using the transactional client 'tx'
      const existingUser = await tx.user.findUnique({
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
        expiresAt: verificationTokenExpires,
      });

      // Create user with temporary password using the transactional client 'tx'
      const tempPassword = await hash(randomBytes(32).toString('hex'), 12);

      const user = await tx.user.create({
        data: {
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email,
          password: tempPassword,
          role: data.role,
          phone_number: data.phone_number,
          sex: data.sex,
          email_verified: false,
          verification_token: verificationToken,
          verification_token_expires: verificationTokenExpires,
          status: false,
        },
      });

      logger.info('User created successfully within transaction', {
        ...logContext,
        userId: user.id,
      });

      // The user object now contains the token. We can just return the user.
      return { user };
    } catch (error) {
      logger.error('User creation failed within transaction', error as Error, logContext);
      throw error; // This will cause the transaction to roll back
    }
  }
  /**
   * Send verification email to user
   */
  static async sendVerificationEmail(userId: number, tx: TransactionClient) {
    const logContext = {
      operation: 'sendVerificationEmail',
      userId,
    };

    try {
      logger.info('Starting verification email process', logContext);

      // Find the user using the transactional client 'tx'
      // This read is consistent within the transaction
      const user = await tx.user.findUnique({
        where: { id: userId },
      });

      // It's crucial to check if the user and token exist.
      if (!user) {
        logger.warn('User not found for verification email', logContext);
        throw new Error('User not found');
      }

      if (!user.verification_token) {
        logger.warn('User found, but has no verification token', logContext);
        throw new Error('User does not have a verification token.');
      }

      // The method's only job is now to perform the side-effect: sending the email.
      // It uses the token that was created in the 'createUser' step.
      await sendVerificationEmail(user.email, user.verification_token, user.first_name);

      logger.info('Verification email sent successfully', {
        ...logContext,
        email: user.email,
      });

      return { success: true, message: 'Verification email sent' };
    } catch (error) {
      logger.error('Verification email sending failed', error as Error, logContext);
      throw error; // This will cause the transaction to roll back
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

      const user = await UserDAO.findByVerificationToken(token);

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

      await UserDAO.update(user.id, {
        password: hashedPassword,
        email_verified: true,
        verification_token: null,
        verification_token_expires: null,
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
    const existingUser = await UserDAO.findByEmail(email.toLowerCase());
    return !!existingUser;
  }
  /**
   * Login user with email and password
   */
  static async login(email: string, password: string) {
    const logContext = {
      operation: 'login_service',
      email,
    };

    try {
      logger.info('Login service attempt started', logContext);

      if (!email || !password) {
        logger.warn('Login service attempt with missing credentials', logContext);
        throw new Error('Email et mot de passe sont requis');
      }

      const user = await UserDAO.findByEmail(email);

      if (!user) {
        logger.warn('Login service attempt with non-existent email', logContext);
        throw new Error('Email ou mot de passe invalide');
      }

      logger.debug('User found for login service attempt', {
        ...logContext,
        userId: user.id,
        emailVerified: user.email_verified,
        status: user.status,
        role: user.role,
      });

      if (!user.email_verified) {
        logger.warn('Login service blocked - email not verified', {
          ...logContext,
          userId: user.id,
          reason: 'email_not_verified',
        });
        throw new Error('Veuillez vérifier votre adresse email');
      }

      if (!user.status) {
        logger.warn('Login service blocked - account not validated by administrator', {
          ...logContext,
          userId: user.id,
          reason: 'account_not_validated',
        });
        throw new Error("Votre compte est en cours de validation par l'administrateur");
      }

      const isValid = await import('bcryptjs').then(({ compare }) =>
        compare(password, user.password)
      );

      if (!isValid) {
        logger.warn('Login service attempt with invalid password', {
          ...logContext,
          userId: user.id,
          reason: 'invalid_password',
        });
        throw new Error('Email ou mot de passe invalide');
      }

      logger.info('Login service validation successful', {
        ...logContext,
        userId: user.id,
        role: user.role,
        firstName: user.first_name,
      });

      return {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          role: user.role,
        },
      };
    } catch (error) {
      logger.error('Login service failed', error as Error, logContext);
      throw error;
    }
  }
  /**
   * Delete user by ID
   */
  static async deleteUserById(id: number) {
    const logContext = {
      operation: 'deleteUserById',
      userId: id,
    };

    try {
      logger.info('Starting user deletion process', logContext);

      const deletedUser = await UserDAO.deleteById(id);

      if (!deletedUser) {
        logger.warn('User not found for deletion', logContext);
        throw new Error('Utilisateur non trouvé');
      }

      logger.info('User deleted successfully', {
        ...logContext,
        email: deletedUser.email,
      });

      return { success: true, message: 'Utilisateur supprimé avec succès' };
    } catch (error) {
      logger.error('User deletion failed', error as Error, logContext);
      throw error;
    }
  }
}
