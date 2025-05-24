import { faker } from '@faker-js/faker';
import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

import { logger } from '../src/lib/logger';

const prisma = new PrismaClient();

/**
 * Seed script for Lillinker platform
 *
 * This script creates the initial data for the platform including:
 * - System permissions
 * - User roles with their associated permissions
 * - Platform admin user
 * - Parent company with admin user
 * - Subsidiary company with admin user
 *
 * ID Strategy:
 * - Internal reference data (Role, Permission) use autoincrement() IDs
 * - Business-facing entities (User, Company) use cuid() IDs
 *
 * Note: All passwords are set to 'Admin123!' for development purposes
 */

async function main() {
  try {
    logger.info('Starting database seeding...');

    // Clean up existing data
    await prisma.user.deleteMany();
    await prisma.company.deleteMany();
    await prisma.rolePermission.deleteMany();
    await prisma.role.deleteMany();
    await prisma.permission.deleteMany();

    // Create permissions
    const [
      // Platform-wide permissions
      platformManage,
      // Company management permissions
      companyManage,
      companyView,
      managersManage,
      // Request management permissions
      requestsManage,
      requestsRespond,
      // Profile management permissions
      profileManage,
    ] = await Promise.all([
      // Platform-wide permissions
      prisma.permission.create({
        data: {
          name: 'platform.manage',
          displayName: 'Manage Platform',
          description: 'Full access to platform-wide settings and features',
          scope: 'platform',
          isSystem: true,
        },
      }),
      // Company management permissions
      prisma.permission.create({
        data: {
          name: 'company.manage',
          displayName: 'Manage Company',
          description: 'Full access to company settings and management',
          scope: 'company',
          isSystem: true,
        },
      }),
      prisma.permission.create({
        data: {
          name: 'company.view',
          displayName: 'View Company',
          description: 'View company information and data',
          scope: 'company',
          isSystem: true,
        },
      }),
      prisma.permission.create({
        data: {
          name: 'managers.manage',
          displayName: 'Manage Managers',
          description: 'Add, remove, and manage company managers',
          scope: 'company',
          isSystem: true,
        },
      }),
      // Request management permissions
      prisma.permission.create({
        data: {
          name: 'requests.manage',
          displayName: 'Manage Requests',
          description: 'Create and manage simulation requests',
          scope: 'company',
          isSystem: true,
        },
      }),
      prisma.permission.create({
        data: {
          name: 'requests.respond',
          displayName: 'Respond to Requests',
          description: 'Respond to simulation requests',
          scope: 'company',
          isSystem: true,
        },
      }),
      // Profile management permissions
      prisma.permission.create({
        data: {
          name: 'profile.manage',
          displayName: 'Manage Profile',
          description: 'Manage personal profile information',
          scope: 'user',
          isSystem: true,
        },
      }),
    ]);

    // Create roles
    const [platformAdminRole, companyAdminRole, companyManagerRole, consultantRole] =
      await Promise.all([
        prisma.role.create({
          data: {
            name: 'PLATFORM_ADMIN',
            displayName: 'Platform Administrator',
            description: 'System-wide administrator with full access to all features',
            isSystem: true,
            permissions: {
              create: [
                { permissionId: platformManage.id },
                { permissionId: companyManage.id },
                { permissionId: companyView.id },
                { permissionId: managersManage.id },
                { permissionId: requestsManage.id },
                { permissionId: requestsRespond.id },
                { permissionId: profileManage.id },
              ],
            },
          },
        }),
        prisma.role.create({
          data: {
            name: 'COMPANY_ADMIN',
            displayName: 'Company Administrator',
            description: 'Administrator for a specific company with full company access',
            isSystem: true,
            permissions: {
              create: [
                { permissionId: companyManage.id },
                { permissionId: companyView.id },
                { permissionId: managersManage.id },
                { permissionId: requestsManage.id },
                { permissionId: requestsRespond.id },
                { permissionId: profileManage.id },
              ],
            },
          },
        }),
        prisma.role.create({
          data: {
            name: 'COMPANY_MANAGER',
            displayName: 'Company Manager',
            description: 'Manager with limited access to their company',
            isSystem: true,
          },
        }),
        prisma.role.create({
          data: {
            name: 'CONSULTANT',
            displayName: 'Consultant',
            description: 'External consultant with limited access',
            isSystem: true,
          },
        }),
      ]);

    // Create platform admin
    const platformAdmin = await prisma.user.create({
      data: {
        firstname: 'Platform',
        lastname: 'Admin',
        username: `platformadmin`,
        email: `admin@platformadmin.com`,
        password: await hash('Admin123!', 10),
        roleId: platformAdminRole.id,
        isActive: true,
        emailVerified: true,
        
        pseudonym: `PLATFORM_ADMIN_${Date.now()}`,
        pseudonymGeneratedAt: new Date(),
      },
    });

    // Create parent company with its admin
    const parentCompany = await prisma.company.create({
      data: {
        name: 'Lillinker Parent Company',
        siret: '12345678900000',
        type: 'SARL',
        description: 'Parent company of the Lillinker group',
        dateFondation: new Date('2020-01-01'),
        capital: 100000,
        logo: 'https://lillinker.com/logo.png',
        isActive: true,
        pseudonym: `COMPANY_${Date.now()}`,
        pseudonymGeneratedAt: new Date(),
        address: '123 Business Street',
        city: 'Paris',
        postalCode: '75001',
        country: 'France',
        phone: '+33123456789',
        email: `contact@lillinker.com`,
        managementCosts: 50000,
        numberPorted: 50,
        users: {
          create: {
            firstname: 'Company',
            lastname: 'Admin',
            username: `companyadmin`,
            email: `admin@parentcompany.com`,
            password: await hash('Admin123!', 10),
            roleId: companyAdminRole.id,
            isActive: true,
            emailVerified: true,
            pseudonym: `COMPANY_ADMIN_${Date.now()}`,
            pseudonymGeneratedAt: new Date(),
          },
        },
      },
    });

    // Create subsidiary company with its admin
    const subsidiaryCompany = await prisma.company.create({
      data: {
        name: 'Lillinker Subsidiary',
        siret: '98765432100000',
        type: 'SARL',
        description: 'Subsidiary of Lillinker Parent Company',
        dateFondation: new Date('2021-01-01'),
        capital: 50000,
        logo: 'https://lillinker.com/subsidiary-logo.png',
        isActive: true,
        pseudonym: `COMPANY_${Date.now() + 1}`,
        pseudonymGeneratedAt: new Date(),
        address: '456 Business Avenue',
        city: 'Lyon',
        postalCode: '69001',
        country: 'France',
        phone: '+33456789123',
        email: `contact@subsidiary.com`,
        managementCosts: 25000,
        numberPorted: 25,
        parentCompanyId: parentCompany.id,
        users: {
          create: {
            firstname: 'Subsidiary',
            lastname: 'Admin',
            username: `subsidiaryadmin_${Date.now()}`,
            email: `admin@subsidiary.com`,
            password: await hash('Admin123!', 10),
            roleId: companyAdminRole.id,
            isActive: true,
            emailVerified: true,
            pseudonym: `COMPANY_ADMIN_${Date.now() + 1}`,
            pseudonymGeneratedAt: new Date(),
          },
        },
      },
    });

    // Create a test company
    const testCompany = await prisma.company.create({
      data: {
        name: faker.company.name(),
        siret: faker.string.numeric(14),
        type: 'SARL',
        description: faker.lorem.sentence(),
        dateFondation: faker.date.past(),
        capital: faker.number.float({ min: 1000, max: 1000000 }),
        logo: faker.image.url(),
        isActive: true,
        address: faker.location.streetAddress(),
        city: faker.location.city(),
        postalCode: faker.location.zipCode(),
        country: 'France',
        phone: faker.phone.number(),
        email: faker.internet.email(),
        managementCosts: faker.number.float({ min: 0, max: 10000 }),
        numberPorted: faker.number.int({ min: 0, max: 1000 }),
      },
    });

    // Create test users for each role
    const hashedPassword = await hash('password123', 10);

    const platformAdminUser = await prisma.user.create({
      data: {
        firstname: faker.person.firstName(),
        lastname: faker.person.lastName(),
        username: faker.internet.username(),
        email: 'admin@lillinker.com',
        password: hashedPassword,
        phone: faker.phone.number(),
        isActive: true,
        emailVerified: true,
        role: { connect: { id: platformAdminRole.id } },
      },
    });

    const companyAdminUser = await prisma.user.create({
      data: {
        firstname: faker.person.firstName(),
        lastname: faker.person.lastName(),
        username: faker.internet.username(),
        email: 'company.admin@lillinker.com',
        password: hashedPassword,
        phone: faker.phone.number(),
        isActive: true,
        emailVerified: true,
        role: { connect: { id: companyAdminRole.id } },
        company: { connect: { id: testCompany.id } },
      },
    });

    const companyManagerUser = await prisma.user.create({
      data: {
        firstname: faker.person.firstName(),
        lastname: faker.person.lastName(),
        username: faker.internet.username(),
        email: 'manager@lillinker.com',
        password: hashedPassword,
        phone: faker.phone.number(),
        isActive: true,
        emailVerified: true,
        role: { connect: { id: companyManagerRole.id } },
        company: { connect: { id: testCompany.id } },
      },
    });

    const consultantUser = await prisma.user.create({
      data: {
        firstname: faker.person.firstName(),
        lastname: faker.person.lastName(),
        username: faker.internet.username(),
        email: 'consultant@lillinker.com',
        password: hashedPassword,
        phone: faker.phone.number(),
        isActive: true,
        emailVerified: true,
        role: { connect: { id: consultantRole.id } },
      },
    });

    logger.info('Database seeding completed!', {
      platformAdmin,
      parentCompany,
      subsidiaryCompany,
      testCompany,
      platformAdminUser,
      companyAdminUser,
      companyManagerUser,
      consultantUser,
    });
  } catch (e) {
    logger.error('Error during seeding', e as Error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
