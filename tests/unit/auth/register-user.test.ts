import { generateUserRegistrationData } from 'tests/fixtures/user';

import { POST } from '@/app/api/auth/register-user/route';
import { prisma } from '@/lib/prisma';

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

describe('POST /api/auth/register-user', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should register a new user successfully', async () => {
    const userData = generateUserRegistrationData();
    const mockRole = {
      id: 1,
      name: 'CONSULTANT',
      displayName: 'Consultant',
      description: 'Consultant role',
      isSystem: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Mock Prisma responses
    jest.mocked(prisma.user.findFirst).mockResolvedValue(null);
    jest.mocked(prisma.role.findUnique).mockResolvedValue(mockRole);
    jest.mocked(prisma.user.create).mockResolvedValue({
      id: 'test-id',
      firstname: userData.firstname,
      lastname: userData.lastname,
      email: userData.email,
      username: userData.username,
      password: 'hashedPassword',
      roleId: mockRole.id,
      isActive: false,
      emailVerified: false,
      phone: null,
      image: null,
      pseudonym: null,
      pseudonymGeneratedAt: null,
      emailVerificationToken: null,
      emailVerificationTokenExpiresAt: null,
      companyId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const response = await POST(
      new Request(process.env.NEXTAUTH_URL+'/api/auth/register-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      })
    );

    expect(response.status).toBe(201);
    const data = await response.json();
    expect(data.message).toBe('User registered successfully');
    expect(data.user).toMatchObject({
      email: userData.email,
      firstname: userData.firstname,
      lastname: userData.lastname,
      username: userData.username,
    });
  });

  it('should return 400 if email or username already exists', async () => {
    const userData = generateUserRegistrationData();
    const existingUser = {
      id: 'test-id',
      firstname: userData.firstname,
      lastname: userData.lastname,
      email: userData.email,
      username: userData.username,
      password: 'hashedPassword',
      roleId: 1,
      isActive: false,
      emailVerified: false,
      phone: null,
      image: null,
      pseudonym: null,
      pseudonymGeneratedAt: null,
      emailVerificationToken: null,
      emailVerificationTokenExpiresAt: null,
      companyId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    jest.mocked(prisma.user.findFirst).mockResolvedValue(existingUser);

    const response = await POST(
      new Request(process.env.NEXTAUTH_URL+ '/api/auth/register-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      })
    );

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe('User with this email or username already exists');
  });

  it('should return 500 if consultant role not found', async () => {
    const userData = generateUserRegistrationData({});

    jest.mocked(prisma.user.findFirst).mockResolvedValue(null);
    jest.mocked(prisma.role.findUnique).mockResolvedValue(null);

    const response = await POST(
      new Request(process.env.NEXTAUTH_URL+'/api/auth/register-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      })
    );

    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data.error).toBe(`Role CONSULTANT not found`);
  });

  it('should validate input data', async () => {
    const invalidData = {
      firstname: 'A', // Too short
      lastname: 'B', // Too short
      email: 'invalid-email',
      username: 'ab', // Too short
      password: '1234567', // Too short
    };

    const response = await POST(
      new Request(process.env.NEXTAUTH_URL+'/api/auth/register-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidData),
      })
    );

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe('Validation error');
    expect(data.details).toBeDefined();
  });
});
