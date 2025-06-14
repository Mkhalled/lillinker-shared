import { logger } from '@/lib/logger';

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


import { getToken } from 'next-auth/jwt';

const mockGetToken = getToken as jest.Mock;

// Import PrismaClient to access the mock
import { prisma } from '@/lib/prisma';

// start testing
import { GET } from '@/app/api/admin/users/route';

import { NextRequest } from 'next/server';

function createMockNextRequest(cookie: string = '') {
  const url = 'http://localhost:3000/api/admin/users';
  const headers = new Headers({ cookie });
  logger.debug(`Creating mock request with cookie: ${cookie || 'none'}`);
  return new NextRequest(new Request(url, { method: 'GET', headers }));
}

describe('Admin Users API Route', () => {
  beforeEach(() => {
    logger.debug('Clearing mocks before test');
    jest.clearAllMocks();
  });

  afterAll(() => {
    // Restore console methods
    logger.debug('Restoring mocks after all tests');
    jest.restoreAllMocks();
  });

  it('returns 401 if token is missing', async () => {
    logger.debug('Testing 401 - missing token scenario');
    mockGetToken.mockResolvedValue(null);

    const req = createMockNextRequest();
    logger.debug('Calling GET with request');
    const res = await GET(req);
    
    logger.debug(`Response status: ${res.status}`);
    expect(res.status).toBe(401);
    const responseBody = await res.json();
    logger.debug(`Response body: ${JSON.stringify(responseBody)}`);
    expect(responseBody).toEqual({ error: 'Not authenticated' });
    expect(mockGetToken).toHaveBeenCalledWith({
      req,
      secret: 'test-secret'
    });
  });

  it('returns 403 if token is present but role is not PLATFORM_ADMIN', async () => {
    logger.debug('Testing 403 - insufficient permissions scenario');
    mockGetToken.mockResolvedValue({ role: 'USER' });
    logger.debug('Token set with role: USER');

    const req = createMockNextRequest('next-auth.session-token=fake_token');
    const res = await GET(req);

    logger.debug(`Response status: ${res.status}`);
    expect(res.status).toBe(403);
    const responseBody = await res.json();
    logger.debug(`Response body: ${JSON.stringify(responseBody)}`);
    expect(responseBody).toEqual({ error: 'Access denied' });
  });

  it('returns 200 with users data when token role is PLATFORM_ADMIN', async () => {
    logger.debug('Testing 200 - admin access scenario');
    mockGetToken.mockResolvedValue({ role: 'PLATFORM_ADMIN' });
    logger.debug('Token set with role: PLATFORM_ADMIN');

    // ✅ Mock the Prisma call used by the DAO
    const mockUsers = [
      { id: 'user1', name: 'Alice' },
      { id: 'user2', name: 'Bob' },
    ];
    logger.debug(`Mocking prisma.user.findMany with users: ${JSON.stringify(mockUsers)}`);
    (prisma.user.findMany as jest.Mock).mockResolvedValue(mockUsers);

    const req = createMockNextRequest('next-auth.session-token=valid_token');
    const res = await GET(req);

    logger.debug(`Response status: ${res.status}`);
    expect(res.status).toBe(200);
    
    const responseData = await res.json();
    logger.debug(`Response data: ${JSON.stringify(responseData)}`);
    expect(responseData).toEqual({
      message: 'Welcome admin!',
      users: mockUsers
    });
  });

  it('returns 500 when getToken throws an error', async () => {
    logger.debug('Testing 500 - error scenario');
    // Mock getToken to throw an error
    const errorMessage = 'Token validation failed';
    logger.debug(`Setting up mock error: ${errorMessage}`);
    mockGetToken.mockRejectedValue(new Error(errorMessage));

    const req = createMockNextRequest('next-auth.session-token=invalid_token');
    const res = await GET(req);

    logger.debug(`Response status: ${res.status}`);
    expect(res.status).toBe(500);
    const responseBody = await res.json();
    logger.debug(`Response body: ${JSON.stringify(responseBody)}`);
    expect(responseBody).toEqual({ error: 'Internal Server Error' });
  });
});