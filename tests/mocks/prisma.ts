import { PrismaClient } from '@prisma/client';

import { generateAccountData } from '../fixtures/account';
import { generateCompanyData } from '../fixtures/company';
import { generateRoleData } from '../fixtures/role';
import { generateSessionData } from '../fixtures/session';
import { generateUserData } from '../fixtures/user';

export const mockPrisma = (prisma: PrismaClient) => {
  // User mocks
  prisma.user.findUnique = jest.fn().mockImplementation(args => {
    const user = generateUserData();
    if (args.include?.role) {
      return Promise.resolve({
        ...user,
        role: generateRoleData(),
      });
    }
    if (args.include?.company) {
      return Promise.resolve({
        ...user,
        company: user.companyId ? generateCompanyData() : null,
      });
    }
    if (args.include?.accounts) {
      return Promise.resolve({
        ...user,
        accounts: [generateAccountData({ userId: user.id })],
      });
    }
    if (args.include?.sessions) {
      return Promise.resolve({
        ...user,
        sessions: [generateSessionData({ userId: user.id })],
      });
    }
    return Promise.resolve(user);
  });

  prisma.user.findFirst = jest.fn().mockImplementation(args => {
    if (args.where?.OR) {
      return Promise.resolve(generateUserData());
    }
    return Promise.resolve(null);
  });

  prisma.user.create = jest.fn().mockImplementation(args => {
    return Promise.resolve(generateUserData(args.data));
  });

  prisma.user.findMany = jest.fn().mockResolvedValue([generateUserData()]);

  // Role mocks
  prisma.role.findUnique = jest.fn().mockImplementation(args => {
    const role = generateRoleData();
    if (args.include?.users) {
      return Promise.resolve({
        ...role,
        users: [generateUserData()],
      });
    }
    if (args.include?.permissions) {
      return Promise.resolve({
        ...role,
        permissions: [],
      });
    }
    return Promise.resolve(role);
  });

  prisma.role.create = jest.fn().mockImplementation(args => {
    return Promise.resolve(generateRoleData(args.data));
  });

  // Company mocks
  prisma.company.findUnique = jest.fn().mockImplementation(args => {
    const company = generateCompanyData();
    if (args.include?.users) {
      return Promise.resolve({
        ...company,
        users: [generateUserData()],
      });
    }
    if (args.include?.parentCompany) {
      return Promise.resolve({
        ...company,
        parentCompany: null,
      });
    }
    if (args.include?.subsidiaries) {
      return Promise.resolve({
        ...company,
        subsidiaries: [],
      });
    }
    return Promise.resolve(company);
  });

  prisma.company.create = jest.fn().mockImplementation(args => {
    return Promise.resolve(generateCompanyData(args.data));
  });

  // Account mocks
  prisma.account.findUnique = jest.fn().mockImplementation(args => {
    const account = generateAccountData();
    if (args.include?.user) {
      return Promise.resolve({
        ...account,
        user: generateUserData(),
      });
    }
    return Promise.resolve(account);
  });

  // Session mocks
  prisma.session.findUnique = jest.fn().mockImplementation(args => {
    const session = generateSessionData();
    if (args.include?.user) {
      return Promise.resolve({
        ...session,
        user: generateUserData(),
      });
    }
    return Promise.resolve(session);
  });

  return prisma;
};
