import { z } from 'zod';

export const InitialRegistrationSchema = z.object({
  email: z.string().email('Invalid email address'),
  first_name: z.string().min(2, 'First name must be at least 2 characters'),
  last_name: z.string().min(2, 'Last name must be at least 2 characters'),
  role: z.enum(['COMPANY', 'FREELANCE'], {
    required_error: 'Please select a role',
  }),
  phone_number: z.string().optional(),
});

export const CompanyOnboardingSchema = z.object({
  // Company data
  company_name: z.string().min(2, 'Company name is required'),
  company_description: z.string().optional(),
  siret: z.string().min(1, 'SIRET number is required'),
  consultant_count: z.number().min(1, 'Consultant count must be at least 1'),
  management_fees: z.number().min(0, 'Management fees must be positive'),
  
  // Service data
  service_label: z.string().min(2, 'Service label is required'),
  service_description: z.string().optional(),
  data_type: z.enum(['TEXT', 'NUMBER', 'SELECT', 'RADIO']),
  requires_data: z.boolean().default(false),
  data_label: z.string().min(1, 'Data label is required'),
  data_description: z.string().optional(),
  choices: z.array(z.string()).optional(),
});

export const FreelanceOnboardingSchema = z.object({
  // Freelance data
  metier: z.string().min(2, 'Profession/Metier is required'),
  
  // Freelance request data
  mission_status: z.enum(['OPEN', 'CLOSED', 'PENDING']).default('OPEN'),
  client_name: z.string().optional(),
  client_address: z.string().optional(),
  client_sector: z.string().optional(),
  priority: z.enum(['HIGH', 'MEDIUM', 'LOW']).default('MEDIUM'),
  tjm: z.number().min(1, 'Daily rate (TJM) is required'),
  days: z.number().min(0.5, 'Days must be at least 0.5'),
  
  // Service requirements
  required_services: z.array(z.number()).optional(),
});

export const SetPasswordSchema = z.object({
  token: z.string(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export type InitialRegistration = z.infer<typeof InitialRegistrationSchema>;
export type CompanyOnboarding = z.infer<typeof CompanyOnboardingSchema>;
export type FreelanceOnboarding = z.infer<typeof FreelanceOnboardingSchema>;
export type SetPassword = z.infer<typeof SetPasswordSchema>;