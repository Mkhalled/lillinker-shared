import { prisma } from '@/lib/prisma';

import { verifyEmail } from '@/lib/auth/email-verification';

// Mock the Prisma client

jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}));
describe('Email Verification', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('verifyEmail function', () => {
    it('should verify email for valid token', async () => {
      // Mock Prisma responses
      (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce({
        id: 1,
        email: 'test@example.com',
        emailVerified: false,
      });

      (prisma.user.update as jest.Mock).mockResolvedValueOnce({
        id: 1,
        email: 'test@example.com',
        emailVerified: true,
      });

      const result = await verifyEmail('valid-token');

      expect(result).toEqual({
        success: true,
        message: 'Email verified successfully',
      });

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { emailVerified: true },
      });
    });

    it('should handle invalid token', async () => {
      // Mock Prisma response
      (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const result = await verifyEmail('invalid-token');

      expect(result).toEqual({
        success: false,
        message: 'Invalid verification token',
      });
    });

    it('should handle already verified email', async () => {
      // Mock Prisma response
      (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce({
        id: 1,
        email: 'test@example.com',
        emailVerified: true,
      });

      const result = await verifyEmail('valid-token');

      expect(result).toEqual({
        success: true,
        message: 'Email already verified',
      });

      expect(prisma.user.update).not.toHaveBeenCalled();
    });

    it('should handle database errors', async () => {
      // Mock Prisma error
      (prisma.user.findUnique as jest.Mock).mockRejectedValueOnce(new Error('Database error'));

      await expect(verifyEmail('valid-token')).rejects.toThrow('Database error');
    });
  });
});
