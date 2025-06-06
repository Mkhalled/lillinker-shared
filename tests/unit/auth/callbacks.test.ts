// import { AdapterUser } from 'next-auth/adapters';
// import { JWT } from 'next-auth/jwt';

// import { CustomSession, CustomUser } from 'tests/types/auth';

// import { authOptions } from '@/lib/auth';

// // Mock Prisma client
// jest.mock('@/lib/prisma', () => ({
//   prisma: {
//     user: {
//       findUnique: jest.fn(),
//     },
//   },
// }));

// type CustomJWT = JWT & {
//   role: string;
//   roleId: number;
//   companyId: string | null;
//   sub?: string;
// };

// describe('NextAuth Callbacks', () => {
//   beforeEach(() => {
//     jest.clearAllMocks();
//   });

//   describe('jwt callback', () => {
//     it('should add user role and company information to token when user is provided', async () => {
//       const user: CustomUser = {
//         id: '1',
//         email: 'test@example.com',
//         firstname: 'John',
//         lastname: 'Doe',
//         username: 'johndoe',
//         role: {
//           name: 'CONSULTANT',
//         },
//         roleId: 1,
//         companyId: 'test-company',
//         isActive: true,
//         emailVerified: new Date(),
//       };

//       const token = await authOptions.callbacks?.jwt?.({
//         token: {} as JWT,
//         user: {
//           ...user,
//           role: user.role.name,
//           emailVerified: !!user.emailVerified,
//         } as unknown as AdapterUser,
//         account: null,
//       });

//       expect(token).toEqual({
//         role: 'CONSULTANT',
//         roleId: 1,
//         companyId: 'test-company',
//       });
//     });

//     it('should preserve existing token data when no user is provided', async () => {
//       const existingToken: CustomJWT = {
//         sub: '1',
//         role: 'CONSULTANT',
//         roleId: 1,
//         companyId: 'test-company',
//       };

//       const token = await authOptions.callbacks?.jwt?.({
//         token: existingToken,
//         user: {} as AdapterUser,
//         account: null,
//       });

//       expect(token).toEqual(existingToken);
//     });

//     it('should handle missing role information gracefully', async () => {
//       const user: Partial<CustomUser> = {
//         id: '1',
//         email: 'test@example.com',
//         firstname: 'John',
//         lastname: 'Doe',
//         username: 'johndoe',
//         isActive: true,
//         emailVerified: new Date(),
//       };

//       const token = await authOptions.callbacks?.jwt?.({
//         token: {} as JWT,
//         user: user as unknown as AdapterUser,
//         account: null,
//       });

//       expect(token).toEqual({});
//     });
//   });

//   describe('session callback', () => {
//     it('should add user role to session', async () => {
//       const token: CustomJWT = {
//         sub: '1',
//         role: 'CONSULTANT',
//         roleId: 1,
//         companyId: 'test-company',
//       };

//       const session = await authOptions.callbacks?.session?.({
//         session: {
//           user: {
//             id: '1',
//             email: 'test@example.com',
//             firstname: 'John',
//             lastname: 'Doe',
//             username: 'johndoe',
//             role: 'CONSULTANT',
//             roleId: 1,
//             companyId: 'test-company',
//             isActive: true,
//             emailVerified: true,
//           },
//           expires: new Date().toISOString(),
//         } as CustomSession,
//         token,
//         user: {} as AdapterUser,
//         newSession: {},
//         trigger: 'update',
//       });

//       expect(session).toEqual({
//         user: {
//           id: '1',
//           email: 'test@example.com',
//           firstname: 'John',
//           lastname: 'Doe',
//           username: 'johndoe',
//           role: 'CONSULTANT',
//           roleId: 1,
//           companyId: 'test-company',
//           isActive: true,
//           emailVerified: true,
//         },
//         expires: expect.any(String),
//       });
//     });

//     it('should handle missing token data', async () => {
//       const token = {} as JWT;

//       const session = await authOptions.callbacks?.session?.({
//         session: {
//           user: {
//             id: '1',
//             email: 'test@example.com',
//             firstname: 'John',
//             lastname: 'Doe',
//             username: 'johndoe',
//             role: 'CONSULTANT',
//             roleId: 1,
//             companyId: 'test-company',
//             isActive: true,
//             emailVerified: true,
//           },
//           expires: new Date().toISOString(),
//         } as CustomSession,
//         token,
//         user: {} as AdapterUser,
//         newSession: {},
//         trigger: 'update',
//       });

//       expect(session).toEqual({
//         user: {
//           id: undefined,
//           email: 'test@example.com',
//           firstname: 'John',
//           lastname: 'Doe',
//           username: 'johndoe',
//           role: undefined,
//           roleId: undefined,
//           companyId: undefined,
//           isActive: true,
//           emailVerified: true,
//         },
//         expires: expect.any(String),
//       });
//     });
//   });
// });
