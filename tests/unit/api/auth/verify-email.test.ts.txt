// import { NextRequest } from 'next/server';
// import { logger } from '@/lib/logger';
// import { POST as VerifyEmailPOST } from '@/app/api/auth/verify-email/route';
// import { AuthService } from '@/services';
// import { SetPasswordSchema } from '@/lib/validations/auth.validation';

// // Mock dependencies
// jest.mock('@/lib/logger', () => ({
//   logger: {
//     info: jest.fn(),
//     debug: jest.fn(),
//     warn: jest.fn(),
//     error: jest.fn(),
//   },
// }));

// jest.mock('@/services', () => ({
//   AuthService: {
//     verifyEmailAndSetPassword: jest.fn(),
//   },
// }));

// jest.mock('next/server', () => {
//   const actualNextServer = jest.requireActual('next/server');
//   return {
//     NextRequest: actualNextServer.NextRequest,
//     NextResponse: {
//       json: jest.fn((data: any, options?: any) => ({
//         json: async () => data,
//         status: options?.status || 200,
//       })),
//       redirect: jest.fn((url: URL) => ({
//         status: 307,
//         headers: { location: url.href },
//       })),
//     },
//   };
// });

// jest.mock('@/lib/validations/auth.validation', () => ({
//   SetPasswordSchema: {
//     parse: jest.fn(),
//   },
// }));

// const mockLogger = logger as jest.Mocked<typeof logger>;
// const mockAuthService = AuthService as jest.Mocked<typeof AuthService>;
// const mockSetPasswordSchema = SetPasswordSchema as jest.Mocked<typeof SetPasswordSchema>;

// describe('Email Verification API', () => {
//   beforeEach(() => {
//     jest.clearAllMocks();
//   });

//   describe('POST /api/auth/verify-email', () => {
//     const validVerificationData = {
//       token: 'valid-token-123456789abcdef',
//       password: 'newPassword123!',
//       confirmPassword: 'newPassword123!',
//     };

//     const mockSuccessResult = {
//       success: true,
//       message: 'Email vérifié et mot de passe défini avec succès',
//     };

//     it('should successfully verify email and set password', async () => {
//       mockSetPasswordSchema.parse.mockReturnValue(validVerificationData);
//       mockAuthService.verifyEmailAndSetPassword.mockResolvedValue(mockSuccessResult);

//       const request = new NextRequest(process.env.NEXTAUTH_URL + '/api/auth/verify-email', {
//         method: 'POST',
//         body: JSON.stringify(validVerificationData),
//         headers: {
//           'Content-Type': 'application/json',
//         },
//       });

//       const response = await VerifyEmailPOST(request);
//       const responseData = await response.json();

//       expect(mockSetPasswordSchema.parse).toHaveBeenCalledWith(validVerificationData);
//       expect(mockAuthService.verifyEmailAndSetPassword).toHaveBeenCalledWith(
//         validVerificationData.token,
//         validVerificationData.password
//       );

//       expect(response.status).toBe(200);
//       expect(responseData).toEqual(mockSuccessResult);

//       expect(mockLogger.info).toHaveBeenCalledWith(
//         'Email verification and password setting API called',
//         expect.objectContaining({
//           operation: 'verify_email_set_password',
//           method: 'POST',
//           path: '/api/auth/verify-email',
//         })
//       );

//       expect(mockLogger.info).toHaveBeenCalledWith(
//         'Email verification and password setting completed successfully',
//         expect.objectContaining({
//           operation: 'verify_email_set_password',
//         })
//       );
//     });

//     it('should handle validation errors for missing token', async () => {
//       const invalidData = {
//         password: 'newPassword123!',
//         confirmPassword: 'newPassword123!',
//         // Missing token
//       };

//       mockSetPasswordSchema.parse.mockImplementation(() => {
//         throw new Error('Token is required');
//       });

//       const request = new NextRequest(process.env.NEXTAUTH_URL + '/api/auth/verify-email', {
//         method: 'POST',
//         body: JSON.stringify(invalidData),
//         headers: {
//           'Content-Type': 'application/json',
//         },
//       });

//       const response = await VerifyEmailPOST(request);
//       const responseData = await response.json();

//       expect(response.status).toBe(400);
//       expect(responseData).toEqual({ error: 'Token is required' });

//       expect(mockLogger.error).toHaveBeenCalledWith(
//         'Email verification API failed',
//         expect.any(Error),
//         expect.objectContaining({
//           operation: 'verify_email_set_password',
//         })
//       );
//     });

//     it('should handle validation errors for missing password', async () => {
//       const invalidData = {
//         token: 'valid-token-123456789abcdef',
//         confirmPassword: 'newPassword123!',
//         // Missing password
//       };

//       mockSetPasswordSchema.parse.mockImplementation(() => {
//         throw new Error('Password is required');
//       });

//       const request = new NextRequest(process.env.NEXTAUTH_URL + '/api/auth/verify-email', {
//         method: 'POST',
//         body: JSON.stringify(invalidData),
//         headers: {
//           'Content-Type': 'application/json',
//         },
//       });

//       const response = await VerifyEmailPOST(request);
//       const responseData = await response.json();

//       expect(response.status).toBe(400);
//       expect(responseData).toEqual({ error: 'Password is required' });
//     });

//     it('should handle password mismatch validation error', async () => {
//       const invalidData = {
//         token: 'valid-token-123456789abcdef',
//         password: 'newPassword123!',
//         confirmPassword: 'differentPassword456!',
//       };

//       mockSetPasswordSchema.parse.mockImplementation(() => {
//         throw new Error("Passwords don't match");
//       });

//       const request = new NextRequest(process.env.NEXTAUTH_URL + '/api/auth/verify-email', {
//         method: 'POST',
//         body: JSON.stringify(invalidData),
//         headers: {
//           'Content-Type': 'application/json',
//         },
//       });

//       const response = await VerifyEmailPOST(request);
//       const responseData = await response.json();

//       expect(response.status).toBe(400);
//       expect(responseData).toEqual({ error: "Passwords don't match" });
//     });

//     it('should handle invalid or expired token', async () => {
//       mockSetPasswordSchema.parse.mockReturnValue(validVerificationData);
//       mockAuthService.verifyEmailAndSetPassword.mockRejectedValue(
//         new Error('Token de vérification invalide ou expiré')
//       );

//       const request = new NextRequest(process.env.NEXTAUTH_URL + '/api/auth/verify-email', {
//         method: 'POST',
//         body: JSON.stringify(validVerificationData),
//         headers: {
//           'Content-Type': 'application/json',
//         },
//       });

//       const response = await VerifyEmailPOST(request);
//       const responseData = await response.json();

//       expect(mockAuthService.verifyEmailAndSetPassword).toHaveBeenCalledWith(
//         validVerificationData.token,
//         validVerificationData.password
//       );

//       expect(response.status).toBe(400);
//       expect(responseData).toEqual({ error: 'Token de vérification invalide ou expiré' });

//       expect(mockLogger.error).toHaveBeenCalledWith(
//         'Email verification API failed',
//         expect.any(Error),
//         expect.objectContaining({
//           operation: 'verify_email_set_password',
//         })
//       );
//     });

//     it('should handle AuthService internal errors', async () => {
//       mockSetPasswordSchema.parse.mockReturnValue(validVerificationData);
//       mockAuthService.verifyEmailAndSetPassword.mockRejectedValue(
//         new Error('Database connection failed')
//       );

//       const request = new NextRequest(process.env.NEXTAUTH_URL + '/api/auth/verify-email', {
//         method: 'POST',
//         body: JSON.stringify(validVerificationData),
//         headers: {
//           'Content-Type': 'application/json',
//         },
//       });

//       const response = await VerifyEmailPOST(request);
//       const responseData = await response.json();

//       expect(response.status).toBe(400);
//       expect(responseData).toEqual({ error: 'Database connection failed' });
//     });

//     it('should handle unexpected errors with generic message', async () => {
//       mockSetPasswordSchema.parse.mockReturnValue(validVerificationData);
//       mockAuthService.verifyEmailAndSetPassword.mockRejectedValue('Unexpected error type');

//       const request = new NextRequest(process.env.NEXTAUTH_URL + '/api/auth/verify-email', {
//         method: 'POST',
//         body: JSON.stringify(validVerificationData),
//         headers: {
//           'Content-Type': 'application/json',
//         },
//       });

//       const response = await VerifyEmailPOST(request);
//       const responseData = await response.json();

//       expect(response.status).toBe(500);
//       expect(responseData).toEqual({ error: 'Internal server error' });
//     });
//   });
// });