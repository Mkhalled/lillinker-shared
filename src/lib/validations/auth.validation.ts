import { z } from 'zod';

export const InitialRegistrationSchema = z.object({
  email: z.string().email('Invalid email address'),
  first_name: z.string().min(2, 'First name must be at least 2 characters'),
  last_name: z.string().min(2, 'Last name must be at least 2 characters'),
  sex: z
    .enum(['MALE', 'FEMALE'], {
      required_error: 'Please select your sex',
    })
    .optional(),
  role: z.enum(['COMPANY', 'FREELANCE'], {
    required_error: 'Please select a role',
  }),
  phone_number: z.string().optional(),
});

// Data field schema for nested structure
const DataFieldSchema = z.object({
  label: z.string().min(1, 'Field label is required'),
  description: z.string().optional(),
  data_type: z.enum(['TEXT', 'NUMBER', 'SELECT', 'RADIO']),
  choices: z.array(z.string()).optional(),
});

const NewServiceSchema = z.object({
  service_label: z.string().min(1, 'Service label is required'),
  service_description: z.string().optional(),
  requires_data: z.boolean(),
  dataFields: z.array(DataFieldSchema).optional(),
});

export const CompanyOnboardingSchema = z
  .object({
    // Company data
    company_name: z.string().min(2, 'Company name is required'),
    siret: z.string().min(1, 'SIRET number is required'),
    company_description: z.string().optional(),
    is_portage: z.boolean().default(false),

    date_creation: z
      .string()
      .transform(str => new Date(str))
      .or(z.date())
      .optional(),
    chiffre_affaires: z.number().optional(),
    adresse: z.string().optional(),
    site_web: z.string().optional(),
    convention_collective: z.string().optional(),
    code_naf_ape: z.string().optional(),

    // Step 2: Consultants and fees
    consultant_count: z.number().min(1, 'Consultant count must be at least 1'),
    management_min: z.number().min(0, 'Management fees must be positive').optional(),
    management_max: z.number().min(0, 'Management fees must be positive').optional(),

    // Step 3: Metiers selection
    selected_metiers: z.array(z.number()).min(1, 'Must select at least one metier'),

    // Step 5: Services selection and creation
    selected_services: z.array(z.number()).optional(),
    selected_portages: z.array(z.number()).optional(),
    new_services: z.array(NewServiceSchema).optional(),

    // Legacy single service fields (for backward compatibility)
    service_label: z.string().optional(),
    service_description: z.string().optional(),
    data_type: z.enum(['TEXT', 'NUMBER', 'SELECT', 'RADIO']).optional(),
    requires_data: z.boolean().optional(),
    data_label: z.string().optional(),
    data_description: z.string().optional(),
    choices: z.array(z.string()).optional(),
  })
  .refine(
    data => {
      // Either must have selected services OR provide new service data (array or legacy single)
      const hasSelectedServices = data.selected_services && data.selected_services.length > 0;
      const hasNewServices = data.new_services && data.new_services.length > 0;
      const hasLegacyNewService = data.service_label && data.service_label.trim() !== '';
      return hasSelectedServices || hasNewServices || hasLegacyNewService;
    },
    {
      message: 'Must select at least one service or create a new service',
      path: ['selected_services'],
    }
  );

export const FreelanceOnboardingSchema = z.object({
  // Freelance data
  metier_id: z.number().min(1, 'Metier selection is required'),

  // Freelance request data
  mission_status: z.enum(['OPEN', 'CLOSED', 'PENDING']),
  client_name: z.string().optional(),
  client_address: z.string().optional(),
  client_sector: z.string().optional(),
  priority: z.enum(['HIGH', 'MEDIUM', 'LOW']),
  tjm: z.number().min(1, 'Daily rate (TJM) is required'),
  days: z.number().min(0.5, 'Days must be at least 0.5'),

  // Salary preferences
  want_salaried: z.boolean().default(false),
  salary: z.number().optional(),
  start_date: z
    .string()
    .transform(str => new Date(str))
    .or(z.date())
    .optional(),

  // Portage preferences
  wants_portage: z.boolean().default(false),
  selected_portages: z.array(z.number()).optional(),

  // Service requirements - array of service objects with required flags and field-based response data
  selected_services: z
    .array(
      z.object({
        serviceId: z.number(),
        isRequired: z.boolean(),
        responseData: z
          .record(z.string(), z.string())
          .transform(data => {
            // Transform string keys to number keys
            const transformed: Record<number, string> = {};
            Object.entries(data).forEach(([key, value]) => {
              transformed[parseInt(key)] = value;
            });
            return transformed;
          })
          .optional(),
      })
    )
    .optional(),

  // Service responses (for backward compatibility, will be merged with selected_services)
  service_responses: z.record(z.string(), z.string()).optional(),
});

export const SetPasswordSchema = z
  .object({
    token: z.string(),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export type InitialRegistration = z.infer<typeof InitialRegistrationSchema>;
export type CompanyOnboarding = z.infer<typeof CompanyOnboardingSchema>;
export type FreelanceOnboarding = z.infer<typeof FreelanceOnboardingSchema>;
export type SetPassword = z.infer<typeof SetPasswordSchema>;
