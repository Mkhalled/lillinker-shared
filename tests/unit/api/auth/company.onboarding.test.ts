import { NextRequest } from 'next/server';
import { logger } from '@/lib/logger';
import { prisma } from '@/lib/prisma';
import { POST as CompanyOnboardingPOST } from '@/app/api/auth/onboarding/company/route';
import { CompanyService, AuthService, PlatformServiceService } from '@/services';
import { CompanyOnboardingSchema } from '@/lib/validations/auth.validation';

// Mock dependencies
jest.mock('@/lib/logger', () => ({
  logger: {
    info: jest.fn(),
    debug: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock('@/lib/prisma', () => ({
  prisma: {
    $transaction: jest.fn(),
    company: {
      findUnique: jest.fn(),
    },
  },
}));

jest.mock('@/services', () => ({
  CompanyService: {
    createCompany: jest.fn(),
    linkPlatformServices: jest.fn(),
    linkMetiers: jest.fn(),
    linkCompanyLabels: jest.fn(),
  },
  AuthService: {
    sendVerificationEmail: jest.fn(),
  },
  PlatformServiceService: {
    createService: jest.fn(),
  },
}));

jest.mock('@/lib/validations/auth.validation', () => ({
  CompanyOnboardingSchema: {
    parse: jest.fn(),
  },
}));

jest.mock('next/server', () => ({
  NextRequest: jest.requireActual('next/server').NextRequest,
  NextResponse: {
    json: jest.fn((data: any, options?: any) => ({
      json: async () => data,
      status: options?.status || 200,
    })),
  },
}));

const mockLogger = logger as jest.Mocked<typeof logger>;
const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const mockCompanyService = CompanyService as jest.Mocked<typeof CompanyService>;
const mockAuthService = AuthService as jest.Mocked<typeof AuthService>;
const mockPlatformServiceService = PlatformServiceService as jest.Mocked<
  typeof PlatformServiceService
>;
const mockCompanyOnboardingSchema = CompanyOnboardingSchema as jest.Mocked<
  typeof CompanyOnboardingSchema
>;

describe('Company Onboarding API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/onboarding/company', () => {
    const validOnboardingData = {
      userId: '123',
      company_name: 'Tech Solutions SARL',
      company_description: 'Société de portage salarial spécialisée en IT',
      siret: '12345678901234',
      consultant_count: 50,
      management_min: 7.0,
      management_max: 10.0,
      is_portage: true,
      selected_services: [1, 2, 3],
      selected_metiers: [1, 2],
      selected_portages: [1],
      new_services: [
        {
          service_label: 'Custom Service',
          service_description: 'Custom service description',
          data_type: 'TEXT' as const,
          requires_data: true,
          data_label: 'Custom Data',
          data_description: 'Custom data description',
          choices: ['Option 1', 'Option 2'],
        },
      ],
    };

    const mockTransactionResult = {
      company: {
        id: 1,
        name: 'Tech Solutions SARL',
        admin_user_id: 123,
        description: 'Société de portage salarial spécialisée en IT',
        logo: null,
        siret: '12345678901234',
        consultant_count: 50,
        management_min: 7.0,
        management_max: 10.0,
        is_portage: true,
        date_creation: null,
        chiffre_affaires: null,
        adresse: null,
        site_web: null,
        convention_collective: null,
        code_naf_ape: null,
      },
      companyServices: [
        { id: 1, company_id: 1, service_id: 1, is_active: true },
        { id: 2, company_id: 1, service_id: 2, is_active: true },
      ],
      platformServices: [
        {
          id: 10,
          label: 'Custom Service',
          user_id: 123,
          status: 'ACTIVE' as const,
          description: 'Custom service description',
          requires_data: true,
        },
      ],
    };

    it('should successfully complete company onboarding with all steps', async () => {
      const { userId, ...onboardingData } = validOnboardingData;

      mockCompanyOnboardingSchema.parse.mockReturnValue(onboardingData);

      // Mock the transaction to return the expected result
      mockPrisma.$transaction.mockResolvedValue(mockTransactionResult);

      // Mock individual methods that would be called within the transaction
      mockCompanyService.createCompany.mockResolvedValue(mockTransactionResult.company);
      mockPlatformServiceService.createService.mockResolvedValue(
        mockTransactionResult.platformServices[0]
      );
      mockCompanyService.linkPlatformServices.mockResolvedValue(
        mockTransactionResult.companyServices
      );
      mockCompanyService.linkMetiers.mockResolvedValue(true);
      mockCompanyService.linkCompanyLabels.mockResolvedValue(true);

      mockAuthService.sendVerificationEmail.mockResolvedValue({
        success: true,
        message: 'Email sent',
      });

      const request = new NextRequest(process.env.NEXTAUTH_URL + '/api/auth/onboarding/company', {
        method: 'POST',
        body: JSON.stringify(validOnboardingData),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await CompanyOnboardingPOST(request);
      const responseData = await response.json();

      expect(mockLogger.info).toHaveBeenCalledWith(
        'Company onboarding API endpoint called',
        expect.objectContaining({
          operation: 'company_onboarding',
          method: 'POST',
          path: '/api/auth/onboarding/company',
        })
      );

      expect(mockCompanyOnboardingSchema.parse).toHaveBeenCalledWith(onboardingData);
      expect(mockPrisma.$transaction).toHaveBeenCalled();

      expect(response.status).toBe(200);
      expect(responseData).toEqual({
        success: true,
        message: 'Company onboarding completed successfully',
        data: mockTransactionResult,
      });

      expect(mockLogger.info).toHaveBeenCalledWith(
        'Company onboarding API completed successfully',
        expect.objectContaining({
          companyId: mockTransactionResult.company.id,
          servicesLinked: mockTransactionResult.companyServices.length,
          newServicesCreated: mockTransactionResult.platformServices.length,
        })
      );
    });

    it('should handle missing userId with validation error', async () => {
      const invalidData: any = { ...validOnboardingData };
      delete invalidData.userId;

      const request = new NextRequest(process.env.NEXTAUTH_URL + '/api/auth/onboarding/company', {
        method: 'POST',
        body: JSON.stringify(invalidData),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await CompanyOnboardingPOST(request);
      const responseData = await response.json();

      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Company onboarding attempt without user ID',
        expect.objectContaining({
          operation: 'company_onboarding',
        })
      );

      expect(response.status).toBe(400);
      expect(responseData).toEqual({ error: 'User ID is required' });
    });

    it('should handle validation schema errors', async () => {
      const invalidData = {
        userId: '123',
        company_name: '', // Invalid empty name
        siret: 'invalid-siret',
      };

      mockCompanyOnboardingSchema.parse.mockImplementation(() => {
        throw new Error('Company name is required');
      });

      const request = new NextRequest(process.env.NEXTAUTH_URL + '/api/auth/onboarding/company', {
        method: 'POST',
        body: JSON.stringify(invalidData),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await CompanyOnboardingPOST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData).toEqual({ error: 'Company name is required' });

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Company onboarding API failed',
        expect.any(Error),
        expect.objectContaining({
          operation: 'company_onboarding',
        })
      );
    });

    it('should handle duplicate SIRET error', async () => {
      const { userId, ...onboardingData } = validOnboardingData;

      mockCompanyOnboardingSchema.parse.mockReturnValue(onboardingData);

      // Mock transaction to throw error when existing company is found
      mockPrisma.$transaction.mockRejectedValue(
        new Error('Une société avec ce numéro SIRET existe déjà')
      );

      const request = new NextRequest(process.env.NEXTAUTH_URL + '/api/auth/onboarding/company', {
        method: 'POST',
        body: JSON.stringify(validOnboardingData),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await CompanyOnboardingPOST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData).toEqual({ error: 'Une société avec ce numéro SIRET existe déjà' });
    });

    it('should handle company creation service errors', async () => {
      const { userId, ...onboardingData } = validOnboardingData;

      mockCompanyOnboardingSchema.parse.mockReturnValue(onboardingData);
      mockPrisma.$transaction.mockRejectedValue(new Error('Database connection failed'));

      const request = new NextRequest(process.env.NEXTAUTH_URL + '/api/auth/onboarding/company', {
        method: 'POST',
        body: JSON.stringify(validOnboardingData),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await CompanyOnboardingPOST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData).toEqual({ error: 'Database connection failed' });
    });

    it('should handle new service creation errors', async () => {
      const { userId, ...onboardingData } = validOnboardingData;

      mockCompanyOnboardingSchema.parse.mockReturnValue(onboardingData);
      mockPrisma.$transaction.mockRejectedValue(new Error('Service creation failed'));

      const request = new NextRequest(process.env.NEXTAUTH_URL + '/api/auth/onboarding/company', {
        method: 'POST',
        body: JSON.stringify(validOnboardingData),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await CompanyOnboardingPOST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData).toEqual({ error: 'Service creation failed' });
    });

    it('should handle legacy single service creation for backward compatibility', async () => {
      const legacyData = {
        userId: '123',
        company_name: 'Legacy Company',
        company_description: 'Legacy description',
        siret: '98765432109876',
        consultant_count: 10,
        management_min: 6.0,
        management_max: 8.0,
        is_portage: false,
        selected_services: [1],
        selected_metiers: [1],
        // Legacy single service fields
        service_label: 'Legacy Service',
        service_description: 'Legacy service description',
        data_type: 'TEXT' as const,
        requires_data: true,
        data_label: 'Legacy Data',
        data_description: 'Legacy data description',
        choices: ['Choice 1'],
      };

      const { userId, ...onboardingData } = legacyData;

      mockCompanyOnboardingSchema.parse.mockReturnValue(onboardingData);
      mockPrisma.$transaction.mockResolvedValue(mockTransactionResult);
      mockAuthService.sendVerificationEmail.mockResolvedValue({
        success: true,
        message: 'Email sent',
      });

      const request = new NextRequest(process.env.NEXTAUTH_URL + '/api/auth/onboarding/company', {
        method: 'POST',
        body: JSON.stringify(legacyData),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await CompanyOnboardingPOST(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
    });

    it('should handle non-portage company without selected_portages', async () => {
      const nonPortageData = {
        ...validOnboardingData,
        is_portage: false,
        selected_portages: undefined,
      };

      const { userId, ...onboardingData } = nonPortageData;

      mockCompanyOnboardingSchema.parse.mockReturnValue(onboardingData);
      mockPrisma.$transaction.mockResolvedValue(mockTransactionResult);
      mockAuthService.sendVerificationEmail.mockResolvedValue({
        success: true,
        message: 'Email sent',
      });

      const request = new NextRequest(process.env.NEXTAUTH_URL + '/api/auth/onboarding/company', {
        method: 'POST',
        body: JSON.stringify(nonPortageData),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await CompanyOnboardingPOST(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
    });

    it('should handle unexpected errors with generic message', async () => {
      mockCompanyOnboardingSchema.parse.mockImplementation(() => {
        throw 'Unexpected error type';
      });

      const request = new NextRequest(process.env.NEXTAUTH_URL + '/api/auth/onboarding/company', {
        method: 'POST',
        body: JSON.stringify(validOnboardingData),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await CompanyOnboardingPOST(request);
      const responseData = await response.json();

      expect(response.status).toBe(500);
      expect(responseData).toEqual({ error: 'Internal server error' });
    });
  });
});
