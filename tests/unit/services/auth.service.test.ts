import { RoleEnum } from '@/constants/Role.enum';
import { RoleDAO } from '@/dao/role.dao';
import { UserDAO } from '@/dao/user.dao';
import { AuthService } from '@/services/auth.service';
import {
  ConsultantRegistration,
  CompanyAdminRegistration,
  CompanyManagerRegistration,
} from '@/validations/user.validation';

// Mock Prisma client
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
    role: {
      findUnique: jest.fn(),
    },
  },
}));

// Mock bcrypt
jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('hashedPassword'),
}));

jest.mock('@/dao/user.dao');
jest.mock('@/dao/role.dao');

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('registerUser', () => {
    const consultantData: ConsultantRegistration = {
      firstname: 'John',
      lastname: 'Doe',
      email: 'john.doe@example.com',
      username: 'johndoe',
      password: 'password123',
      phone: '+1234567890',
      role: RoleEnum.CONSULTANT,
    };

    const adminData: CompanyAdminRegistration = {
      firstname: 'Admin',
      lastname: 'User',
      email: 'admin@example.com',
      username: 'adminuser',
      password: 'password123',
      phone: '+1234567890',
      role: RoleEnum.COMPANY_ADMIN,
      companyId: 'company-123',
    };

    const managerData: CompanyManagerRegistration = {
      firstname: 'Manager',
      lastname: 'User',
      email: 'manager@example.com',
      username: 'manageruser',
      password: 'password123',
      phone: '+1234567890',
      role: RoleEnum.COMPANY_MANAGER,
      companyId: 'company-123',
    };

    const mockConsultantRole = {
      id: 1,
      name: RoleEnum.CONSULTANT,
      displayName: 'Consultant',
      description: 'Consultant role',
      isSystem: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockAdminRole = {
      id: 2,
      name: RoleEnum.COMPANY_ADMIN,
      displayName: 'Company Admin',
      description: 'Company Admin role',
      isSystem: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockManagerRole = {
      id: 3,
      name: RoleEnum.COMPANY_MANAGER,
      displayName: 'Company Manager',
      description: 'Company Manager role',
      isSystem: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockConsultantUser = {
      id: 'user-123',
      firstname: consultantData.firstname,
      lastname: consultantData.lastname,
      email: consultantData.email,
      username: consultantData.username,
      password: consultantData.password,
      phone: consultantData.phone ?? null,
      roleId: mockConsultantRole.id,
      isActive: true,
      emailVerified: false,
      image: null,
      pseudonym: null,
      pseudonymGeneratedAt: null,
      emailVerificationToken: null,
      emailVerificationTokenExpiresAt: null,
      companyId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockAdminUser = {
      ...mockConsultantUser,
      id: 'user-456',
      firstname: adminData.firstname,
      lastname: adminData.lastname,
      email: adminData.email,
      username: adminData.username,
      password: adminData.password,
      phone: adminData.phone ?? null,
      roleId: mockAdminRole.id,
      companyId: adminData.companyId,
    };

    const mockManagerUser = {
      ...mockConsultantUser,
      id: 'user-789',
      firstname: managerData.firstname,
      lastname: managerData.lastname,
      email: managerData.email,
      username: managerData.username,
      password: managerData.password,
      phone: managerData.phone ?? null,
      roleId: mockManagerRole.id,
      companyId: managerData.companyId,
    };

    it('should register a new consultant successfully', async () => {
      jest.mocked(RoleDAO.findByName).mockResolvedValue(mockConsultantRole);
      jest.mocked(UserDAO.findByEmailOrUsername).mockResolvedValue(null);
      jest.mocked(UserDAO.create).mockResolvedValue(mockConsultantUser);

      const result = await AuthService.registerUser(consultantData);

      expect(result).toBeDefined();
      expect(result.email).toBe(consultantData.email);
      expect(result.roleId).toBe(mockConsultantRole.id);
      expect(UserDAO.create).toHaveBeenCalledWith({
        ...consultantData,
        roleId: mockConsultantRole.id,
        isActive: false,
        emailVerified: false,
      });
    });

    it('should register a new company admin successfully', async () => {
      jest.mocked(RoleDAO.findByName).mockResolvedValue(mockAdminRole);
      jest.mocked(UserDAO.findByEmailOrUsername).mockResolvedValue(null);
      jest.mocked(UserDAO.create).mockResolvedValue(mockAdminUser);

      const result = await AuthService.registerUser(adminData);

      expect(result).toBeDefined();
      expect(result.email).toBe(adminData.email);
      expect(result.roleId).toBe(mockAdminRole.id);
      expect(result.companyId).toBe(adminData.companyId);
      expect(UserDAO.create).toHaveBeenCalledWith({
        ...adminData,
        roleId: mockAdminRole.id,
        isActive: false,
        emailVerified: false,
      });
    });

    it('should register a new company manager successfully', async () => {
      jest.mocked(RoleDAO.findByName).mockResolvedValue(mockManagerRole);
      jest.mocked(UserDAO.findByEmailOrUsername).mockResolvedValue(null);
      jest.mocked(UserDAO.create).mockResolvedValue(mockManagerUser);

      const result = await AuthService.registerUser(managerData);

      expect(result).toBeDefined();
      expect(result.email).toBe(managerData.email);
      expect(result.roleId).toBe(mockManagerRole.id);
      expect(result.companyId).toBe(managerData.companyId);
      expect(UserDAO.create).toHaveBeenCalledWith({
        ...managerData,
        roleId: mockManagerRole.id,
        isActive: false,
        emailVerified: false,
      });
    });

    it('should throw error if user already exists', async () => {
      jest.mocked(UserDAO.findByEmailOrUsername).mockResolvedValue(mockConsultantUser);

      await expect(AuthService.registerUser(consultantData)).rejects.toThrow(
        'User with this email or username already exists'
      );
    });

    it('should throw error if role not found', async () => {
      jest.mocked(UserDAO.findByEmailOrUsername).mockResolvedValue(null);
      jest.mocked(RoleDAO.findByName).mockResolvedValue(null);

      await expect(AuthService.registerUser(consultantData)).rejects.toThrow(
        `Role ${consultantData.role} not found`
      );
    });

    it('should throw error if company ID is missing for company roles', async () => {
      const invalidAdminData = {
        firstname: 'Admin',
        lastname: 'User',
        email: 'admin@example.com',
        username: 'adminuser',
        password: 'password123',
        phone: '+1234567890',
        role: RoleEnum.COMPANY_ADMIN,
      };

      jest.mocked(UserDAO.findByEmailOrUsername).mockResolvedValue(null);
      jest.mocked(RoleDAO.findByName).mockResolvedValue(mockAdminRole);

      await expect(
        AuthService.registerUser(invalidAdminData as CompanyAdminRegistration)
      ).rejects.toThrow('Company ID is required for company roles');
    });
  });
});
