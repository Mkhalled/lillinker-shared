// mock environment variables
process.env.NEXTAUTH_SECRET = 'test-secret';

// Integrate centralized Prisma mocks
jest.mock('@prisma/client', () => {
  const actual = jest.requireActual('@prisma/client');
  const { mockPrisma } = require('../../mocks/prisma');
  const prisma = mockPrisma(new actual.PrismaClient());
  return {
    PrismaClient: jest.fn(() => prisma),
  };
});

// mock token
jest.mock('next-auth/jwt', () => ({
  getToken: jest.fn(),
}));

// mock email function
jest.mock('@/lib/mailer', () => ({
  accountActivationEmail: jest.fn().mockResolvedValue(true)
}));

import { getToken } from 'next-auth/jwt';
const mockGetToken = getToken as jest.Mock;

// start testing
import { PUT } from '@/app/api/admin/users/[id]/route';

import { NextRequest } from 'next/server';

function createMockNextRequest(cookie: string = '') {
  const url = 'http://localhost:3000/api/admin/users/123';
  const headers = new Headers({ cookie });
  return new NextRequest(new Request(url, { method: 'PUT', headers }));
}

describe('Accept user API Route', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('returns 401 if token is missing', async () => {
    mockGetToken.mockResolvedValue(null);

    const req = createMockNextRequest();
    const res = await PUT(req, { params: { id: '123' } });

    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: 'Not authenticated' });
    expect(mockGetToken).toHaveBeenCalledWith({
      req,
      secret: 'test-secret'
    });
  });

  it('returns 403 if token is present but role is not PLATFORM_ADMIN', async () => {
    mockGetToken.mockResolvedValue({ role: 'USER' });

    const req = createMockNextRequest('next-auth.session-token=fake_token');
    const res = await PUT(req, { params: { id: '123' } });

    expect(res.status).toBe(403);
    expect(await res.json()).toEqual({ error: 'Access denied' });
  });

  it('returns 200 when account is activated successfully', async () => {
    // Mock successful authentication
    mockGetToken.mockResolvedValue({ role: 'PLATFORM_ADMIN' });

    const req = createMockNextRequest('next-auth.session-token=valid_token');
    const res = await PUT(req, { params: { id: '123' } });

    expect(res.status).toBe(200);
    const responseData = await res.json();
    expect(responseData).toEqual({
      message: 'Account Activated successfully'
    });
  });

  it('returns 500 when getToken throws an error', async () => {
    // Mock getToken to throw an error
    mockGetToken.mockRejectedValue(new Error('Token validation failed'));

    const req = createMockNextRequest('next-auth.session-token=invalid_token');
    const res = await PUT(req, { params: { id: '123' } });

    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: 'Internal Server Error' });
  });
});