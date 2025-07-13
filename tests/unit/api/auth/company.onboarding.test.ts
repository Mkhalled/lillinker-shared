import { logger } from '@/lib/logger';
import { prisma } from '@/lib/prisma';
import { AuthService } from '@/services/auth.service';
import type { CompanyOnboarding } from '@/lib/validations/auth.validation';

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
  },
}));

const mockPrisma = prisma as any;
const mockLogger = logger as any;

describe('AuthService - Company Onboarding', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('completeCompanyOnboarding', () => {
    const mockUserId = 1;
    const mockCompanyData: CompanyOnboarding = {
      company_name: 'Test Company Inc',
      company_description: 'A test company for testing purposes',
      siret: '12345678901234',
      consultant_count: 10,
      management_fees: 15.5,
      selected_services: [1, 2, 3],
    };

    const mockCompanyDataWithNewService: CompanyOnboarding = {
      company_name: 'Innovation Corp',
      company_description: 'An innovative company',
      siret: '98765432109876',
      consultant_count: 25,
      management_fees: 20.0,
      service_label: 'Custom Analytics Service',
      service_description: 'Advanced analytics for business intelligence',
      data_type: 'SELECT',
      requires_data: true,
      data_label: 'Analytics Type',
      data_description: 'Select the type of analytics required',
      choices: ['Basic', 'Advanced', 'Enterprise'],
    };

    const mockCompany = {
      id: 1,
      admin_user_id: mockUserId,
      name: 'Test Company Inc',
      description: 'A test company for testing purposes',
      siret: '12345678901234',
      consultant_count: 10,
      management_fees: 15.5,
      created_at: new Date(),
      updated_at: new Date(),
    };

    const mockCompanyServices = [
      {
        id: 1,
        company_id: 1,
        service_id: 1,
        is_active: true,
        created_at: new Date(),
      },
      {
        id: 2,
        company_id: 1,
        service_id: 2,
        is_active: true,
        created_at: new Date(),
      },
      {
        id: 3,
        company_id: 1,
        service_id: 3,
        is_active: true,
        created_at: new Date(),
      },
    ];

    const mockPlatformService = {
      id: 4,
      user_id: mockUserId,
      label: 'Custom Analytics Service',
      description: 'Advanced analytics for business intelligence',
      data_type: 'SELECT',
      requires_data: true,
      data_label: 'Analytics Type',
      data_description: 'Select the type of analytics required',
      choices: ['Basic', 'Advanced', 'Enterprise'],
      status: 'PENDING',
      created_at: new Date(),
    };

    const mockNewCompanyService = {
      id: 4,
      company_id: 1,
      service_id: 4,
      is_active: false,
      created_at: new Date(),
    };

    it('should successfully complete company onboarding with selected services', async () => {
      const mockTransaction = jest.fn().mockImplementation(async (callback) => {
        const mockTx = {
          company: {
            create: jest.fn().mockResolvedValue(mockCompany),
          },
          companyService: {
            create: jest.fn()
              .mockResolvedValueOnce(mockCompanyServices[0])
              .mockResolvedValueOnce(mockCompanyServices[1])
              .mockResolvedValueOnce(mockCompanyServices[2]),
          },
        };
        return await callback(mockTx);
      });

      mockPrisma.$transaction = mockTransaction;

      const result = await AuthService.completeCompanyOnboarding(mockUserId, mockCompanyData);

      expect(mockTransaction).toHaveBeenCalledWith(expect.any(Function));

      expect(result).toEqual({
        company: mockCompany,
        platformService: null,
        companyServices: [
          mockCompanyServices[0],
          mockCompanyServices[1],
          mockCompanyServices[2],
        ],
      });

      expect(mockLogger.info).toHaveBeenCalledWith(
        'Starting company onboarding process',
        expect.objectContaining({
          operation: 'completeCompanyOnboarding',
          userId: mockUserId,
          companyName: 'Test Company Inc',
          siret: '12345678901234',
        })
      );

      expect(mockLogger.info).toHaveBeenCalledWith(
        'Company record created successfully',
        expect.objectContaining({
          companyId: 1,
          consultantCount: 10,
          managementFees: 15.5,
        })
      );

      expect(mockLogger.info).toHaveBeenCalledWith(
        'Company services linked successfully',
        expect.objectContaining({
          linkedServicesCount: 3,
        })
      );

      expect(mockLogger.info).toHaveBeenCalledWith(
        'Company onboarding completed successfully',
        expect.objectContaining({
          companyId: 1,
          totalServicesLinked: 3,
          newServiceCreated: false,
        })
      );
    });

    it('should successfully complete company onboarding with new service creation', async () => {
      const mockTransaction = jest.fn().mockImplementation(async (callback) => {
        const mockTx = {
          company: {
            create: jest.fn().mockResolvedValue(mockCompany),
          },
          platformService: {
            create: jest.fn().mockResolvedValue(mockPlatformService),
          },
          companyService: {
            create: jest.fn().mockResolvedValue(mockNewCompanyService),
          },
        };
        return await callback(mockTx);
      });

      mockPrisma.$transaction = mockTransaction;

      const result = await AuthService.completeCompanyOnboarding(mockUserId, mockCompanyDataWithNewService);

      expect(mockTransaction).toHaveBeenCalledWith(expect.any(Function));

      expect(result).toEqual({
        company: mockCompany,
        platformService: mockPlatformService,
        companyServices: [mockNewCompanyService],
      });

      expect(mockLogger.debug).toHaveBeenCalledWith(
        'Creating new platform service',
        expect.objectContaining({
          serviceLabel: 'Custom Analytics Service',
          dataType: 'SELECT',
          requiresData: true,
        })
      );

      expect(mockLogger.info).toHaveBeenCalledWith(
        'New platform service created and linked',
        expect.objectContaining({
          platformServiceId: 4,
          status: 'PENDING',
        })
      );
    });

    it('should handle company onboarding with both selected services and new service', async () => {
      const mixedData: CompanyOnboarding = {
        ...mockCompanyData,
        service_label: 'Additional Service',
        service_description: 'An additional service',
        data_type: 'TEXT',
        requires_data: false,
      };

      const mockTransaction = jest.fn().mockImplementation(async (callback) => {
        const mockTx = {
          company: {
            create: jest.fn().mockResolvedValue(mockCompany),
          },
          companyService: {
            create: jest.fn()
              .mockResolvedValueOnce(mockCompanyServices[0])
              .mockResolvedValueOnce(mockCompanyServices[1])
              .mockResolvedValueOnce(mockCompanyServices[2])
              .mockResolvedValueOnce(mockNewCompanyService),
          },
          platformService: {
            create: jest.fn().mockResolvedValue(mockPlatformService),
          },
        };
        return await callback(mockTx);
      });

      mockPrisma.$transaction = mockTransaction;

      const result = await AuthService.completeCompanyOnboarding(mockUserId, mixedData);

      expect(result.companyServices).toHaveLength(4);
      expect(result.platformService).toEqual(mockPlatformService);

      expect(mockLogger.debug).toHaveBeenCalledWith(
        'Processing selected platform services',
        expect.objectContaining({
          selectedServicesCount: 3,
          serviceIds: [1, 2, 3],
        })
      );

      expect(mockLogger.debug).toHaveBeenCalledWith(
        'Creating new platform service',
        expect.objectContaining({
          serviceLabel: 'Additional Service',
        })
      );
    });

    it('should handle database transaction failures', async () => {
      const dbError = new Error('Transaction failed');
      mockPrisma.$transaction.mockRejectedValue(dbError);

      await expect(
        AuthService.completeCompanyOnboarding(mockUserId, mockCompanyData)
      ).rejects.toThrow('Transaction failed');

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Company onboarding failed',
        dbError,
        expect.objectContaining({
          operation: 'completeCompanyOnboarding',
          userId: mockUserId,
        })
      );
    });

    it('should handle company creation failures within transaction', async () => {
      const companyCreationError = new Error('Company creation failed');
      
      const mockTransaction = jest.fn().mockImplementation(async (callback) => {
        const mockTx = {
          company: {
            create: jest.fn().mockRejectedValue(companyCreationError),
          },
        };
        return await callback(mockTx);
      });

      mockPrisma.$transaction = mockTransaction;

      await expect(
        AuthService.completeCompanyOnboarding(mockUserId, mockCompanyData)
      ).rejects.toThrow('Company creation failed');

      expect(mockLogger.info).toHaveBeenCalledWith(
        'Starting company onboarding process',
        expect.any(Object)
      );

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Company onboarding failed',
        companyCreationError,
        expect.any(Object)
      );
    });

    it('should validate required fields in company data', async () => {
      const invalidData = {
        company_name: '',
        siret: '12345678901234',
        consultant_count: 10,
        management_fees: 15.5,
      } as CompanyOnboarding;

      const mockTransaction = jest.fn().mockImplementation(async (callback) => {
        const mockTx = {
          company: {
            create: jest.fn().mockRejectedValue(new Error('Company name is required')),
          },
        };
        return await callback(mockTx);
      });

      mockPrisma.$transaction = mockTransaction;

      await expect(
        AuthService.completeCompanyOnboarding(mockUserId, invalidData)
      ).rejects.toThrow('Company name is required');
    });

    it('should handle platform service creation failure gracefully', async () => {
      const serviceCreationError = new Error('Platform service creation failed');
      
      const mockTransaction = jest.fn().mockImplementation(async (callback) => {
        const mockTx = {
          company: {
            create: jest.fn().mockResolvedValue(mockCompany),
          },
          platformService: {
            create: jest.fn().mockRejectedValue(serviceCreationError),
          },
        };
        return await callback(mockTx);
      });

      mockPrisma.$transaction = mockTransaction;

      await expect(
        AuthService.completeCompanyOnboarding(mockUserId, mockCompanyDataWithNewService)
      ).rejects.toThrow('Platform service creation failed');

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Company onboarding failed',
        serviceCreationError,
        expect.any(Object)
      );
    });
  });
});
