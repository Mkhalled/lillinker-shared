import { hash } from 'bcryptjs';
import { randomBytes } from 'crypto';

import { logger } from '@/lib/logger';
import { prisma } from '@/lib/prisma';
import { AuthService } from '@/services/auth.service';
import type {
  InitialRegistration,
} from '@/lib/validations/auth.validation';

// Mock dependencies
jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
}));

jest.mock('crypto', () => ({
  randomBytes: jest.fn(),
}));

jest.mock('@/lib/logger', () => ({
  logger: {
    info: jest.fn(),
    debug: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock('@/lib/mailer', () => ({
  sendVerificationEmail: jest.fn(),
}));

jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    company: {
      create: jest.fn(),
    },
    freelance: {
      create: jest.fn(),
    },
    freelanceRequest: {
      create: jest.fn(),
    },
    companyService: {
      create: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
    },
    platformService: {
      create: jest.fn(),
    },
    freelanceRequestOption: {
      create: jest.fn(),
    },
    userPlatformService: {
      create: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}));

const mockHash = hash as jest.MockedFunction<typeof hash>;
const mockRandomBytes = randomBytes as jest.MockedFunction<typeof randomBytes>;
const mockPrisma = prisma as any;
const mockLogger = logger as any;

describe('AuthService - Onboarding Flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (mockHash as any).mockResolvedValue('hashedPassword');
    // Create a buffer that will be hex-encoded to the expected string
    (mockRandomBytes as any).mockReturnValue(Buffer.from('mocktoken1234567890abcdef1234567890abcdef', 'utf8'));
  });

  describe('initiateRegistration', () => {
    const mockRegistrationData: InitialRegistration = {
      email: 'test@example.com',
      first_name: 'John',
      last_name: 'Doe',
      role: 'COMPANY',
      phone_number: '+1234567890',
    };

    const mockUser = {
      id: 1,
      email: 'test@example.com',
      first_name: 'John',
      last_name: 'Doe',
      role: 'COMPANY',
      phone_number: '+1234567890',
      email_verified: false,
      verification_token: '6d6f636b746f6b656e3132333435363738393061626364656631323334353637383930616263646566',
      verification_token_expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      status: false,
      password: 'hashedPassword',
      created_at: new Date(),
      updated_at: new Date(),
    };

    it('should successfully initiate registration for new user', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue(mockUser);

      const result = await AuthService.initiateRegistration(mockRegistrationData);

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });

      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: {
          first_name: 'John',
          last_name: 'Doe',
          email: 'test@example.com',
          password: 'hashedPassword',
          role: 'COMPANY',
          phone_number: '+1234567890',
          email_verified: false,
          verification_token: '6d6f636b746f6b656e3132333435363738393061626364656631323334353637383930616263646566',
          verification_token_expires: expect.any(Date),
          status: false,
        },
      });

      expect(result.user).toEqual(mockUser);
      expect(result.verificationToken).toBe('6d6f636b746f6b656e3132333435363738393061626364656631323334353637383930616263646566');

      expect(mockLogger.info).toHaveBeenCalledWith(
        'Starting user registration process',
        expect.objectContaining({
          operation: 'initiateRegistration',
          email: 'test@example.com',
          role: 'COMPANY',
        })
      );

      expect(mockLogger.info).toHaveBeenCalledWith(
        'User registration completed successfully',
        expect.objectContaining({
          userId: 1,
          firstName: 'John',
          lastName: 'Doe',
        })
      );
    });

    it('should throw error if user already exists', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      await expect(AuthService.initiateRegistration(mockRegistrationData)).rejects.toThrow(
        'Un utilisateur avec cette adresse e-mail existe déjà'
      );

      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Registration attempt with existing email',
        expect.objectContaining({
          existingUserId: 1,
        })
      );

      expect(mockLogger.error).toHaveBeenCalledWith(
        'User registration failed',
        expect.any(Error),
        expect.objectContaining({
          operation: 'initiateRegistration',
        })
      );
    });

    it('should handle database errors gracefully', async () => {
      const dbError = new Error('Database connection failed');
      mockPrisma.user.findUnique.mockRejectedValue(dbError);

      await expect(AuthService.initiateRegistration(mockRegistrationData)).rejects.toThrow(
        'Database connection failed'
      );

      expect(mockLogger.error).toHaveBeenCalledWith(
        'User registration failed',
        dbError,
        expect.objectContaining({
          operation: 'initiateRegistration',
        })
      );
    });
  });

  describe('verifyEmailAndSetPassword', () => {
    const mockToken = 'valid-token-123';
    const mockPassword = 'newPassword123';

    const mockUser = {
      id: 1,
      email: 'test@example.com',
      first_name: 'John',
      last_name: 'Doe',
      verification_token: mockToken,
      verification_token_expires: new Date(Date.now() + 60 * 60 * 1000), // 1 hour from now
      email_verified: false,
    };

    const mockUpdatedUser = {
      ...mockUser,
      password: 'hashedPassword',
      email_verified: true,
      verification_token: null,
      verification_token_expires: null,
    };

    it('should successfully verify email and set password', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.user.update.mockResolvedValue(mockUpdatedUser);

      const result = await AuthService.verifyEmailAndSetPassword(mockToken, mockPassword);

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: {
          verification_token: mockToken,
          verification_token_expires: {
            gt: expect.any(Date),
          },
        },
      });

      expect(mockHash).toHaveBeenCalledWith(mockPassword, 12);

      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          password: 'hashedPassword',
          email_verified: true,
          verification_token: null,
          verification_token_expires: null,
        },
      });

      expect(result).toEqual({
        success: true,
        message: 'Email vérifié et mot de passe défini avec succès',
      });

      expect(mockLogger.info).toHaveBeenCalledWith(
        'Starting email verification and password setting',
        expect.objectContaining({
          operation: 'verifyEmailAndSetPassword',
        })
      );
    });

    it('should throw error for invalid or expired token', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(AuthService.verifyEmailAndSetPassword(mockToken, mockPassword)).rejects.toThrow(
        'Token de vérification invalide ou expiré'
      );

      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Invalid or expired verification token',
        expect.objectContaining({
          token: 'valid-to...',
        })
      );

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Email verification and password setting failed',
        expect.any(Error),
        expect.objectContaining({
          operation: 'verifyEmailAndSetPassword',
        })
      );
    });
  });

  describe('finalizeRegistration', () => {
    const mockUserId = 1;
    const mockUser = {
      id: mockUserId,
      email: 'test@example.com',
      first_name: 'John',
    };

    it('should successfully finalize registration', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.user.update.mockResolvedValue({
        ...mockUser,
        verification_token: 'new-token',
        verification_token_expires: new Date(),
      });

      const { sendVerificationEmail } = require('@/lib/mailer');
      sendVerificationEmail.mockResolvedValue(true);

      const result = await AuthService.finalizeRegistration(mockUserId);

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: mockUserId },
      });

      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: mockUserId },
        data: {
          verification_token: expect.any(String),
          verification_token_expires: expect.any(Date),
        },
      });

      expect(sendVerificationEmail).toHaveBeenCalledWith(
        'test@example.com',
        expect.any(String),
        'John'
      );

      expect(result).toEqual({
        success: true,
        message: 'Verification email sent',
      });

      expect(mockLogger.info).toHaveBeenCalledWith(
        'Registration finalization completed successfully',
        expect.objectContaining({
          email: 'test@example.com',
          firstName: 'John',
        })
      );
    });

    it('should throw error if user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(AuthService.finalizeRegistration(mockUserId)).rejects.toThrow(
        'User not found'
      );

      expect(mockLogger.warn).toHaveBeenCalledWith(
        'User not found during registration finalization',
        expect.objectContaining({
          operation: 'finalizeRegistration',
          userId: mockUserId,
        })
      );
    });
  });

  describe('getAvailableServices', () => {
    const mockServices = [
      {
        id: 1,
        company_id: 1,
        service_id: 1,
        is_active: true,
        service: {
          id: 1,
          label: 'Service 1',
          status: 'ACTIVE',
        },
        company: {
          id: 1,
          name: 'Company 1',
        },
      },
      {
        id: 2,
        company_id: 2,
        service_id: 2,
        is_active: true,
        service: {
          id: 2,
          label: 'Service 2',
          status: 'ACTIVE',
        },
        company: {
          id: 2,
          name: 'Company 2',
        },
      },
    ];

    it('should successfully fetch available services', async () => {
      mockPrisma.companyService.findMany.mockResolvedValue(mockServices);

      const result = await AuthService.getAvailableServices();

      expect(mockPrisma.companyService.findMany).toHaveBeenCalledWith({
        where: {
          is_active: true,
          service: {
            status: 'ACTIVE',
          },
        },
        include: {
          service: true,
          company: true,
        },
      });

      expect(result).toEqual(mockServices);

      expect(mockLogger.info).toHaveBeenCalledWith(
        'Available services fetched successfully',
        expect.objectContaining({
          servicesCount: 2,
        })
      );
    });

    it('should handle database errors when fetching services', async () => {
      const dbError = new Error('Database query failed');
      mockPrisma.companyService.findMany.mockRejectedValue(dbError);

      await expect(AuthService.getAvailableServices()).rejects.toThrow(
        'Database query failed'
      );

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Failed to fetch available services',
        dbError,
        expect.objectContaining({
          operation: 'getAvailableServices',
        })
      );
    });
  });
});
