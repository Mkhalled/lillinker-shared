import { RoleEnum } from '@/constants/Role.enum';
import { sendVerificationEmail } from '@/lib/mailer';
import { AuthService } from '@/services/auth.service';
import { validateUserRegistrationWithError } from '@/validations/user.validation';
import { generateUserRegistrationData } from 'tests/fixtures/user';

import { POST } from '@/app/api/auth/register-user/route';

// Mocks
jest.mock('@/lib/prisma', () => {
  const actual = jest.requireActual('@prisma/client');
  const { mockPrisma } = require('../../mocks/prisma');
  return {
    prisma: mockPrisma(new actual.PrismaClient()),
  };
});

jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('hashedPassword'),
}));

jest.mock('uuid', () => ({
  v4: jest.fn().mockReturnValue('test-verification-token'),
}));

jest.mock('@/lib/mailer', () => ({
  sendVerificationEmail: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('@/services/auth.service', () => ({
  AuthService: {
    registerUser: jest.fn(),
  },
}));

jest.mock('@/validations/user.validation', () => {
  return {
    validateUserRegistrationWithError: jest.fn(),
  };
});

describe('POST /api/auth/register-user', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('registers a new user successfully', async () => {
    const mockUser = generateUserRegistrationData();

    (validateUserRegistrationWithError as jest.Mock).mockReturnValue({
      success: true,
      data: mockUser,
    });

    (AuthService.registerUser as jest.Mock).mockResolvedValue({
      id: 'test-user-id',
      ...mockUser,
    });

    const response = await POST(
      new Request('http://localhost:3000/api/auth/register-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mockUser),
      })
    );

    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.message).toBe('User registered successfully');
    expect(data.user).toMatchObject({
      email: mockUser.email,
      firstname: mockUser.firstname,
      lastname: mockUser.lastname,
      username: mockUser.username,
    });
  });
  it('registers a new user and sends verification email', async () => {
    const mockUser = generateUserRegistrationData();

    (validateUserRegistrationWithError as jest.Mock).mockReturnValue({
      success: true,
      data: mockUser,
    });

    (AuthService.registerUser as jest.Mock).mockResolvedValue({
      id: 'test-user-id',
      ...mockUser,
    });

    const response = await POST(
      new Request('http://localhost/api/auth/register-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mockUser),
      })
    );

    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.message).toBe('User registered successfully');

    expect(data.user).toMatchObject({
      email: mockUser.email,
      firstname: mockUser.firstname,
      lastname: mockUser.lastname,
      username: mockUser.username,
    });

    // Assert sendVerificationEmail is called
    expect(sendVerificationEmail).toHaveBeenCalledWith(mockUser.email, expect.any(String));
  });
  it('returns 400 if user already exists', async () => {
    const mockUser = generateUserRegistrationData();

    (validateUserRegistrationWithError as jest.Mock).mockReturnValue({
      success: true,
      data: mockUser,
    });

    (AuthService.registerUser as jest.Mock).mockImplementation(() => {
      throw new Error('User with this email or username already exists');
    });

    const response = await POST(
      new Request('http://localhost:3000/api/auth/register-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mockUser),
      })
    );

    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('User with this email or username already exists');
  });

  it('returns 400 for invalid data', async () => {
    (validateUserRegistrationWithError as jest.Mock).mockReturnValue({
      success: false,
      error: {
        errors: [{ message: 'Invalid email address' }],
      },
    });

    const invalidData = {
      firstname: '',
      lastname: '',
      email: 'invalid-email',
      phone: '',
      password: '123',
      username: '',
      role: RoleEnum.CONSULTANT,
    };

    const response = await POST(
      new Request('http://localhost:3000/api/auth/register-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidData),
      })
    );

    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Validation error');
    expect(data.details).toBeDefined();
  });
});
