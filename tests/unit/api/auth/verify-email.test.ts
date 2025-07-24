import { NextRequest, NextResponse } from 'next/server';

import { POST, GET } from '@/app/api/auth/verify-email/route';
import { logger } from '@/lib/logger';
import { SetPasswordSchema } from '@/lib/validations/auth.validation';

import { AuthService } from '@/services/auth.service';

// Mock dependencies
jest.mock('@/lib/logger', () => ({
  logger: {
    info: jest.fn(),
    debug: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock('@/services/auth.service', () => ({
  AuthService: {
    verifyEmailAndSetPassword: jest.fn(),
  },
}));

jest.mock('@/lib/validations/auth.validation', () => ({
  SetPasswordSchema: {
    parse: jest.fn(),
  },
}));

const mockLogger = logger as any;
const mockAuthService = AuthService as any;
const mockSetPasswordSchema = SetPasswordSchema as any;

// Helper function to create mock NextRequest
function createMockRequest(body: any, url?: string): NextRequest {
  const request = {
    json: jest.fn().mockResolvedValue(body),
    url: url || 'http://localhost:3000/api/auth/verify-email',
    method: 'POST',
    headers: new Map(),
  } as unknown as NextRequest;
  
  return request;
}

function createMockGetRequest(searchParams: Record<string, string>): NextRequest {
  const url = new URL('http://localhost:3000/api/auth/verify-email');
  Object.entries(searchParams).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });
  
  const request = {
    url: url.toString(),
    method: 'GET',
    headers: new Map(),
  } as unknown as NextRequest;
  
  return request;
}

describe('Email Verification API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/verify-email', () => {
    const mockRequestBody = {
      token: 'valid-token-123456789abcdef',
      password: 'newPassword123!',
      confirmPassword: 'newPassword123!',
    };

    const mockValidatedData = {
      token: 'valid-token-123456789abcdef',
      password: 'newPassword123!',
      confirmPassword: 'newPassword123!',
    };

    const mockSuccessResult = {
      success: true,
      message: 'Email vérifié et mot de passe défini avec succès',
    };

    it('should successfully verify email and set password', async () => {
      const request = createMockRequest(mockRequestBody);
      mockSetPasswordSchema.parse.mockReturnValue(mockValidatedData);
      mockAuthService.verifyEmailAndSetPassword.mockResolvedValue(mockSuccessResult);

      const response = await POST(request);
      const responseData = await response.json();

      expect(mockLogger.info).toHaveBeenCalledWith(
        'Email verification and password setting API called',
        expect.objectContaining({
          operation: 'verify_email_set_password',
          method: 'POST',
          path: '/api/auth/verify-email',
        })
      );

      expect(mockLogger.debug).toHaveBeenCalledWith(
        'Email verification request received',
        expect.objectContaining({
          hasToken: true,
          hasPassword: true,
          tokenLength: 27,
        })
      );

      expect(mockSetPasswordSchema.parse).toHaveBeenCalledWith(mockRequestBody);

      expect(mockLogger.debug).toHaveBeenCalledWith(
        'Email verification data validated successfully',
        expect.objectContaining({
          tokenLength: 27,
        })
      );

      expect(mockAuthService.verifyEmailAndSetPassword).toHaveBeenCalledWith(
        'valid-token-123456789abcdef',
        'newPassword123!'
      );

      expect(mockLogger.info).toHaveBeenCalledWith(
        'Email verification and password setting completed successfully',
        expect.any(Object)
      );

      expect(response.status).toBe(200);
      expect(responseData).toEqual(mockSuccessResult);
    });

    it('should handle missing token in request body', async () => {
      const invalidRequestBody = {
        password: 'newPassword123!',
        confirmPassword: 'newPassword123!',
      };

      const request = createMockRequest(invalidRequestBody);
      mockSetPasswordSchema.parse.mockImplementation(() => {
        throw new Error('Token is required');
      });

      const response = await POST(request);
      const responseData = await response.json();

      expect(mockLogger.debug).toHaveBeenCalledWith(
        'Email verification request received',
        expect.objectContaining({
          hasToken: false,
          hasPassword: true,
          tokenLength: undefined,
        })
      );

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Email verification API failed',
        expect.any(Error),
        expect.any(Object)
      );

      expect(response.status).toBe(400);
      expect(responseData).toEqual({ error: 'Token is required' });
    });

    it('should handle missing password in request body', async () => {
      const invalidRequestBody = {
        token: 'valid-token-123456789abcdef',
        confirmPassword: 'newPassword123!',
      };

      const request = createMockRequest(invalidRequestBody);
      mockSetPasswordSchema.parse.mockImplementation(() => {
        throw new Error('Password is required');
      });

      const response = await POST(request);
      const responseData = await response.json();

      expect(mockLogger.debug).toHaveBeenCalledWith(
        'Email verification request received',
        expect.objectContaining({
          hasToken: true,
          hasPassword: false,
        })
      );

      expect(response.status).toBe(400);
      expect(responseData).toEqual({ error: 'Password is required' });
    });

    it('should handle password mismatch validation error', async () => {
      const invalidRequestBody = {
        token: 'valid-token-123456789abcdef',
        password: 'newPassword123!',
        confirmPassword: 'differentPassword456!',
      };

      const request = createMockRequest(invalidRequestBody);
      mockSetPasswordSchema.parse.mockImplementation(() => {
        throw new Error("Passwords don't match");
      });

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData).toEqual({ error: "Passwords don't match" });
    });

    it('should handle invalid or expired token', async () => {
      const request = createMockRequest(mockRequestBody);
      mockSetPasswordSchema.parse.mockReturnValue(mockValidatedData);
      mockAuthService.verifyEmailAndSetPassword.mockRejectedValue(
        new Error('Token de vérification invalide ou expiré')
      );

      const response = await POST(request);
      const responseData = await response.json();

      expect(mockAuthService.verifyEmailAndSetPassword).toHaveBeenCalledWith(
        'valid-token-123456789abcdef',
        'newPassword123!'
      );

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Email verification API failed',
        expect.any(Error),
        expect.any(Object)
      );

      expect(response.status).toBe(400);
      expect(responseData).toEqual({ error: 'Token de vérification invalide ou expiré' });
    });

    it('should handle AuthService internal errors', async () => {
      const request = createMockRequest(mockRequestBody);
      mockSetPasswordSchema.parse.mockReturnValue(mockValidatedData);
      mockAuthService.verifyEmailAndSetPassword.mockRejectedValue(
        new Error('Database connection failed')
      );

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData).toEqual({ error: 'Database connection failed' });
    });

    it('should handle unexpected errors with generic message', async () => {
      const request = createMockRequest(mockRequestBody);
      mockSetPasswordSchema.parse.mockReturnValue(mockValidatedData);
      mockAuthService.verifyEmailAndSetPassword.mockRejectedValue(
        'Unexpected error type'
      );

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(500);
      expect(responseData).toEqual({ error: 'Internal server error' });
    });

    it('should handle JSON parsing errors', async () => {
      const request = {
        json: jest.fn().mockRejectedValue(new Error('Invalid JSON')),
        url: 'http://localhost:3000/api/auth/verify-email',
        method: 'POST',
        headers: new Map(),
      } as unknown as NextRequest;

      const response = await POST(request);
      const responseData = await response.json();

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Email verification API failed',
        expect.any(Error),
        expect.any(Object)
      );

      expect(response.status).toBe(400);
      expect(responseData).toEqual({ error: 'Invalid JSON' });
    });
  });

  describe('GET /api/auth/verify-email', () => {
    it('should successfully redirect to set password page with valid token', async () => {
      const request = createMockGetRequest({ token: 'valid-token-123' });
      
      // Mock NextResponse.redirect
      const mockRedirect = jest.fn().mockReturnValue({
        status: 302,
        headers: { location: '/auth/set-password?token=valid-token-123' },
      });
      (NextResponse as any).redirect = mockRedirect;

      await GET(request);

      expect(mockLogger.info).toHaveBeenCalledWith(
        'Email verification redirect endpoint called',
        expect.objectContaining({
          operation: 'verify_email_redirect',
          method: 'GET',
          path: '/api/auth/verify-email',
        })
      );

      expect(mockLogger.debug).toHaveBeenCalledWith(
        'Email verification redirect request',
        expect.objectContaining({
          hasToken: true,
          tokenLength: 15,
        })
      );

      expect(mockLogger.info).toHaveBeenCalledWith(
        'Redirecting to set password page',
        expect.objectContaining({
          tokenLength: 15,
        })
      );

      expect(mockRedirect).toHaveBeenCalledWith(
        new URL('http://localhost:3000/auth/set-password?token=valid-token-123')
      );
    });

    it('should redirect to error page when token is missing', async () => {
      const request = createMockGetRequest({});
      
      const mockRedirect = jest.fn().mockReturnValue({
        status: 302,
        headers: { location: '/auth/error?error=missing-token' },
      });
      (NextResponse as any).redirect = mockRedirect;

      await GET(request);

      expect(mockLogger.debug).toHaveBeenCalledWith(
        'Email verification redirect request',
        expect.objectContaining({
          hasToken: false,
          tokenLength: undefined,
        })
      );

      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Email verification redirect attempted without token',
        expect.any(Object)
      );

      expect(mockRedirect).toHaveBeenCalledWith(
        new URL('http://localhost:3000/auth/error?error=missing-token')
      );
    });

    it('should redirect to error page when token is empty', async () => {
      const request = createMockGetRequest({ token: '' });
      
      const mockRedirect = jest.fn().mockReturnValue({
        status: 302,
        headers: { location: '/auth/error?error=missing-token' },
      });
      (NextResponse as any).redirect = mockRedirect;

      await GET(request);

      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Email verification redirect attempted without token',
        expect.any(Object)
      );
    });

    it('should handle URL parsing errors gracefully', async () => {
      const request = createMockGetRequest({ token: 'valid-token-123' });

      // Mock NextResponse.redirect to throw an error on the first call (main redirect)
      // but succeed on the second call (error redirect)
      let callCount = 0;
      const mockRedirect = jest.fn().mockImplementation((url) => {
        callCount++;
        if (callCount === 1) {
          throw new Error('Invalid URL');
        }
        return {
          status: 302,
          headers: { location: url.href },
        };
      });
      (NextResponse as any).redirect = mockRedirect;

      const result = await GET(request);

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Email verification redirect failed',
        expect.any(Error),
        expect.any(Object)
      );

      expect(result).toBeDefined();
      expect(mockRedirect).toHaveBeenCalledTimes(2); // First fails, second succeeds
    });

    it('should handle redirect errors', async () => {
      const request = createMockGetRequest({ token: 'valid-token-123' });
      
      const mockRedirect = jest.fn().mockImplementation(() => {
        throw new Error('Redirect failed');
      });
      (NextResponse as any).redirect = mockRedirect;

      // The function should throw since redirect fails
      await expect(GET(request)).rejects.toThrow('Redirect failed');
    });
  });
});
