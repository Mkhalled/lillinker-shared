import { hasRequiredRole } from '@/lib/auth/role-based-access';
import { prisma } from '@/lib/prisma';

// Mock Prisma client
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
    },
  },
}));

describe('Role-Based Access Control', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('hasRequiredRole function', () => {
    it('should allow access for platform admin role', async () => {
      // Mock Prisma response
      (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce({
        id: 1,
        email: 'admin@example.com',
        role: {
          name: 'PLATFORM_ADMIN',
        },
      });

      const result = await hasRequiredRole(1, ['PLATFORM_ADMIN']);

      expect(result).toBe(true);
    });

    it('should allow access for company admin role', async () => {
      // Mock Prisma response
      (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce({
        id: 2,
        email: 'company-admin@example.com',
        role: {
          name: 'COMPANY_ADMIN',
        },
      });

      const result = await hasRequiredRole(2, ['COMPANY_ADMIN']);

      expect(result).toBe(true);
    });

    it('should allow access for company manager role', async () => {
      // Mock Prisma response
      (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce({
        id: 3,
        email: 'manager@example.com',
        role: {
          name: 'COMPANY_MANAGER',
        },
      });

      const result = await hasRequiredRole(3, ['COMPANY_MANAGER']);

      expect(result).toBe(true);
    });

    it('should allow access for consultant role', async () => {
      // Mock Prisma response
      (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce({
        id: 4,
        email: 'consultant@example.com',
        role: {
          name: 'CONSULTANT',
        },
      });

      const result = await hasRequiredRole(4, ['CONSULTANT']);

      expect(result).toBe(true);
    });

    it('should deny access when role does not match', async () => {
      // Mock Prisma response
      (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce({
        id: 1,
        email: 'manager@example.com',
        role: {
          name: 'COMPANY_MANAGER',
        },
      });

      const result = await hasRequiredRole(1, ['PLATFORM_ADMIN']);

      expect(result).toBe(false);
    });

    it('should handle non-existent user', async () => {
      // Mock Prisma response
      (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const result = await hasRequiredRole(999, ['PLATFORM_ADMIN']);

      expect(result).toBe(false);
    });

    it('should handle database errors', async () => {
      // Mock Prisma error
      (prisma.user.findUnique as jest.Mock).mockRejectedValueOnce(new Error('Database error'));

      await expect(hasRequiredRole(1, ['PLATFORM_ADMIN'])).rejects.toThrow(
        'Failed to check user role'
      );
    });

    it('should allow access for multiple allowed roles', async () => {
      // Mock Prisma response
      (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce({
        id: 1,
        email: 'admin@example.com',
        role: {
          name: 'PLATFORM_ADMIN',
        },
      });

      const result = await hasRequiredRole(1, ['PLATFORM_ADMIN', 'COMPANY_ADMIN']);

      expect(result).toBe(true);
    });

    it('should handle user without role', async () => {
      // Mock Prisma response
      (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce({
        id: 1,
        email: 'user@example.com',
        role: null,
      });

      const result = await hasRequiredRole(1, ['PLATFORM_ADMIN']);

      expect(result).toBe(false);
    });
  });
});
