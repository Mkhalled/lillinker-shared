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
      is_portage: false,
      selected_services: [1, 2, 3],
      selected_metiers: [1, 2], // Add required metiers
    };

    const mockCompanyDataWithNewService: CompanyOnboarding = {
      company_name: 'Innovation Corp',
      company_description: 'An innovative company',
      siret: '98765432109876',
      consultant_count: 25,
      management_fees: 20.0,
      is_portage: false,
      selected_metiers: [1, 3], // Add required metiers
      new_services: [
        {
          service_label: 'Custom Analytics Service',
          service_description: 'Advanced analytics for business intelligence',
          data_type: 'SELECT',
          requires_data: true,
          data_label: 'Analytics Type',
          data_description: 'Select the type of analytics required',
          choices: ['Basic', 'Advanced', 'Enterprise'],
        }
      ]
    };

    const mockCompanyDataWithMultipleNewServices: CompanyOnboarding = {
      company_name: 'Multi-Service Corp',
      company_description: 'A company with multiple services',
      siret: '11223344556677',
      consultant_count: 15,
      management_fees: 18.0,
      is_portage: false,
      selected_metiers: [2, 4], // Add required metiers
      new_services: [
        {
          service_label: 'Analytics Service',
          service_description: 'Data analytics',
          data_type: 'SELECT',
          requires_data: true,
          data_label: 'Analytics Type',
          data_description: 'Select analytics type',
          choices: ['Basic', 'Advanced'],
        },
        {
          service_label: 'Consulting Service',
          service_description: 'Business consulting',
          data_type: 'TEXT',
          requires_data: true,
          data_label: 'Expertise Area',
          data_description: 'Describe your expertise',
          choices: [],
        }
      ]
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

    const mockPlatformService2 = {
      id: 5,
      user_id: mockUserId,
      label: 'Consulting Service',
      description: 'Business consulting',
      data_type: 'TEXT',
      requires_data: true,
      data_label: 'Expertise Area',
      data_description: 'Describe your expertise',
      choices: [],
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

    const mockPortageCompanyData: CompanyOnboarding = {
      company_name: 'Portage Company Ltd',
      company_description: 'A portage company for testing',
      siret: '98765432109876',
      consultant_count: 25,
      management_fees: 12.0,
      is_portage: true,
      selected_services: [1, 2],
      selected_metiers: [1, 2],
      selected_portages: [1, 2],
      new_services: []
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
          companyMetier: {
            createMany: jest.fn().mockResolvedValue({ count: 2 }),
          },
          companyPortage: {
            createMany: jest.fn().mockResolvedValue({ count: 0 }),
          },
        };
        return await callback(mockTx);
      });

      mockPrisma.$transaction = mockTransaction;

      const result = await AuthService.completeCompanyOnboarding(mockUserId, mockCompanyData);

      expect(mockTransaction).toHaveBeenCalledWith(expect.any(Function));

      expect(result).toEqual({
        company: mockCompany,
        platformServices: [],
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
          newServicesCreated: 0,
        })
      );
    });

    it('should successfully complete company onboarding with new service creation', async () => {
      const mockTransaction = jest.fn().mockImplementation(async (callback) => {
        const mockTx = {
          company: {
            create: jest.fn().mockResolvedValue(mockCompany),
          },
          companyMetier: {
            createMany: jest.fn().mockResolvedValue({ count: 2 }),
          },
          companyPortage: {
            createMany: jest.fn().mockResolvedValue({ count: 0 }),
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
        platformServices: [mockPlatformService],
        companyServices: [mockNewCompanyService],
      });

      expect(mockLogger.debug).toHaveBeenCalledWith(
        'Creating new platform services',
        expect.objectContaining({
          newServicesCount: 1,
          serviceLabels: ['Custom Analytics Service'],
        })
      );

      expect(mockLogger.info).toHaveBeenCalledWith(
        'New platform service created and linked',
        expect.objectContaining({
          platformServiceId: 4,
          serviceLabel: 'Custom Analytics Service',
          status: 'PENDING',
        })
      );
    });

    it('should successfully complete company onboarding with multiple new services', async () => {
      const mockNewCompanyService2 = {
        id: 5,
        company_id: 1,
        service_id: 5,
        is_active: false,
        created_at: new Date(),
      };

      const mockTransaction = jest.fn().mockImplementation(async (callback) => {
        const mockTx = {
          company: {
            create: jest.fn().mockResolvedValue(mockCompany),
          },
          companyMetier: {
            createMany: jest.fn().mockResolvedValue({ count: 2 }),
          },
          companyPortage: {
            createMany: jest.fn().mockResolvedValue({ count: 0 }),
          },
          platformService: {
            create: jest.fn()
              .mockResolvedValueOnce(mockPlatformService)
              .mockResolvedValueOnce(mockPlatformService2),
          },
          companyService: {
            create: jest.fn()
              .mockResolvedValueOnce(mockNewCompanyService)
              .mockResolvedValueOnce(mockNewCompanyService2),
          },
        };
        return await callback(mockTx);
      });

      mockPrisma.$transaction = mockTransaction;

      const result = await AuthService.completeCompanyOnboarding(mockUserId, mockCompanyDataWithMultipleNewServices);

      expect(mockTransaction).toHaveBeenCalledWith(expect.any(Function));

      expect(result).toEqual({
        company: mockCompany,
        platformServices: [mockPlatformService, mockPlatformService2],
        companyServices: [mockNewCompanyService, mockNewCompanyService2],
      });

      expect(mockLogger.debug).toHaveBeenCalledWith(
        'Creating new platform services',
        expect.objectContaining({
          newServicesCount: 2,
          serviceLabels: ['Analytics Service', 'Consulting Service'],
        })
      );

      expect(mockLogger.info).toHaveBeenCalledWith(
        'Company onboarding completed successfully',
        expect.objectContaining({
          companyId: 1,
          totalServicesLinked: 2,
          newServicesCreated: 2,
        })
      );
    });

    it('should handle company onboarding with both selected services and new service', async () => {
      const mixedData: CompanyOnboarding = {
        ...mockCompanyData,
        new_services: [
          {
            service_label: 'Additional Service',
            service_description: 'An additional service',
            data_type: 'TEXT',
            requires_data: false,
            data_label: '',
            data_description: '',
            choices: [],
          }
        ]
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
          companyMetier: {
            createMany: jest.fn().mockResolvedValue({ count: 2 }),
          },
          companyPortage: {
            createMany: jest.fn().mockResolvedValue({ count: 0 }),
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
      expect(result.platformServices).toEqual([mockPlatformService]);

      expect(mockLogger.debug).toHaveBeenCalledWith(
        'Processing selected platform services',
        expect.objectContaining({
          selectedServicesCount: 3,
          serviceIds: [1, 2, 3],
        })
      );

      expect(mockLogger.debug).toHaveBeenCalledWith(
        'Creating new platform services',
        expect.objectContaining({
          newServicesCount: 1,
          serviceLabels: ['Additional Service'],
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
          companyMetier: {
            createMany: jest.fn().mockResolvedValue({ count: 2 }),
          },
          companyPortage: {
            createMany: jest.fn().mockResolvedValue({ count: 0 }),
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

    it('should successfully complete portage company onboarding with portage services', async () => {
      const mockPortageCompany = {
        ...mockCompany,
        name: 'Portage Company Ltd',
        description: 'A portage company for testing',
        siret: '98765432109876',
        consultant_count: 25,
        management_fees: 12.0,
      };

      const mockTransaction = jest.fn().mockImplementation(async (callback) => {
        const mockTx = {
          company: {
            create: jest.fn().mockResolvedValue(mockPortageCompany),
          },
          companyService: {
            create: jest.fn()
              .mockResolvedValueOnce(mockCompanyServices[0])
              .mockResolvedValueOnce(mockCompanyServices[1]),
          },
          companyMetier: {
            createMany: jest.fn().mockResolvedValue({ count: 2 }),
          },
          companyPortage: {
            createMany: jest.fn().mockResolvedValue({ count: 2 }),
          },
        };
        return await callback(mockTx);
      });

      mockPrisma.$transaction = mockTransaction;

      const result = await AuthService.completeCompanyOnboarding(mockUserId, mockPortageCompanyData);

      expect(mockTransaction).toHaveBeenCalledWith(expect.any(Function));

      expect(result).toEqual({
        company: mockPortageCompany,
        platformServices: [],
        companyServices: [
          mockCompanyServices[0],
          mockCompanyServices[1],
        ],
      });

      expect(mockLogger.info).toHaveBeenCalledWith(
        'Starting company onboarding process',
        expect.objectContaining({
          operation: 'completeCompanyOnboarding',
          userId: mockUserId,
          companyName: 'Portage Company Ltd',
          siret: '98765432109876',
        })
      );

      expect(mockLogger.info).toHaveBeenCalledWith(
        'Company record created successfully',
        expect.objectContaining({
          companyId: 1,
          consultantCount: 25,
          managementFees: 12.0,
        })
      );

      expect(mockLogger.info).toHaveBeenCalledWith(
        'Company services linked successfully',
        expect.objectContaining({
          linkedServicesCount: 2,
        })
      );

      expect(mockLogger.info).toHaveBeenCalledWith(
        'Company onboarding completed successfully',
        expect.objectContaining({
          companyId: 1,
          totalServicesLinked: 2,
          newServicesCreated: 0,
        })
      );
    });
  });
});
