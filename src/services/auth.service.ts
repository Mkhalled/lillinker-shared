import { RoleEnum } from '@/constants/Role.enum';
import { RoleDAO } from '@/dao/role.dao';
import { UserDAO } from '@/dao/user.dao';
import { logger } from '@/lib/logger';
import type { UserRegistration } from '@/validations/user.validation';

export class AuthService {
  static async registerUser(data: UserRegistration) {
    logger.info('Starting user registration', { email: data.email, role: data.role });

    // Check if user already exists
    const existingUser = await UserDAO.findByEmailOrUsername(data.email, data.username);
    if (existingUser) {
      logger.warn('User already exists', { email: data.email, username: data.username });
      throw new Error('User with this email or username already exists');
    }

    // Get and validate role
    const role = await RoleDAO.findByName(data.role);
    if (!role) {
      logger.error('Role not found', { role: data.role });
      throw new Error(`Role ${data.role} not found`);
    }

    // Validate company requirement for company roles
    if (
      (data.role === RoleEnum.COMPANY_ADMIN || data.role === RoleEnum.COMPANY_MANAGER) &&
      !('companyId' in data)
    ) {
      logger.error('Company ID required for company roles', {
        role: (data as { role: RoleEnum }).role,
      });
      throw new Error('Company ID is required for company roles');
    }

    // Create user with role-specific data
    const userData = {
      ...data,
      roleId: role.id,
      isActive: false,
      emailVerified: false,
      ...(data.role !== RoleEnum.CONSULTANT && {
        companyId: (data as { companyId: string }).companyId,
      }),
    };

    logger.debug('Creating user', { email: data.email, role: data.role });
    const user = await UserDAO.create(userData);

    logger.info('User registration completed successfully', {
      userId: user.id,
      email: user.email,
      role: data.role,
    });

    return user;
  }
}
