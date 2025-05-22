import { z } from 'zod';

import { RoleEnum } from '@/constants/Role.enum';

// Base user schema with common fields
const baseUserSchema = {
  firstname: z.string().min(2, 'First name must be at least 2 characters'),
  lastname: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  phone: z.string().optional(),
};

// Consultant-specific schema
export const consultantSchema = z.object({
  ...baseUserSchema,
  role: z.literal(RoleEnum.CONSULTANT),
});

// Company user schema (for both admin and manager)
const companyUserSchema = z.object({
  ...baseUserSchema,
  companyId: z.string().min(1, 'Company ID is required for company roles'),
});

// Company admin schema
export const companyAdminSchema = companyUserSchema.extend({
  role: z.literal(RoleEnum.COMPANY_ADMIN),
});

// Company manager schema
export const companyManagerSchema = companyUserSchema.extend({
  role: z.literal(RoleEnum.COMPANY_MANAGER),
});

// Combined registration schema
export const registerUserSchema = z.discriminatedUnion('role', [
  consultantSchema,
  companyAdminSchema,
  companyManagerSchema,
]);

// Type exports
export type ConsultantRegistration = z.infer<typeof consultantSchema>;
export type CompanyAdminRegistration = z.infer<typeof companyAdminSchema>;
export type CompanyManagerRegistration = z.infer<typeof companyManagerSchema>;
export type UserRegistration = z.infer<typeof registerUserSchema>;

// Role-specific validation function
export function validateUserRegistration(data: unknown): UserRegistration {
  return registerUserSchema.parse(data);
}

// Role-specific validation with custom error handling
export function validateUserRegistrationWithError(data: unknown): {
  success: boolean;
  data?: UserRegistration;
  error?: z.ZodError;
} {
  const result = registerUserSchema.safeParse(data);
  return {
    success: result.success,
    data: result.success ? result.data : undefined,
    error: result.success ? undefined : result.error,
  };
}
