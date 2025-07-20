import { logger } from '@/lib/logger';
import { prisma } from '@/lib/prisma';
import { AuthService } from '@/services/auth.service';
import type { FreelanceOnboarding } from '@/lib/validations/auth.validation';

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

describe('AuthService - Freelance Onboarding', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('completeFreelanceOnboarding', () => {
    const mockUserId = 1;
    const mockFreelanceData: FreelanceOnboarding = {
      metier_id: 1, // Changed from 'metier' to 'metier_id' and made it a number
      mission_status: 'OPEN',
      client_name: 'Acme Corporation',
      client_address: '123 Business Street, Paris, France',
      client_sector: 'Technology',
      priority: 'HIGH',
      tjm: 650.00,
      days: 20,
      selected_services: [
        {
          serviceId: 1,
          isRequired: true,
          responseData: 'React, Node.js expertise required',
        },
        {
          serviceId: 2,
          isRequired: false,
          responseData: 'Optional DevOps support',
        },
      ],
    };

    const mockFreelanceDataNoServices: FreelanceOnboarding = {
      metier_id: 2, // Changed from 'metier' to 'metier_id' and made it a number
      mission_status: 'PENDING',
      client_name: 'Tech Startup',
      priority: 'MEDIUM',
      tjm: 500.00,
      days: 15,
    };

    const mockFreelance = {
      id: 1,
      freelance_id: mockUserId,
      metier_id: 1, // Changed from 'metier' to 'metier_id'
      created_at: new Date(),
      updated_at: new Date(),
    };

    const mockFreelanceRequest = {
      id: 1,
      freelance_id: 1,
      mission_status: 'OPEN',
      client_name: 'Acme Corporation',
      client_address: '123 Business Street, Paris, France',
      client_sector: 'Technology',
      priority: 'HIGH',
      tjm: 650.00,
      days: 20,
      created_at: new Date(),
      updated_at: new Date(),
    };

    const mockPlatformServices = [
      {
        id: 1,
        user_id: 1,
        label: 'React Development',
        description: 'React application development',
        data_type: 'TEXT',
        requires_data: true,
        data_label: 'Technical Requirements',
        data_description: 'Describe your technical requirements',
        choices: null,
        status: 'ACTIVE',
        created_at: new Date(),
      },
      {
        id: 2,
        user_id: 2,
        label: 'DevOps Support',
        description: 'DevOps and infrastructure support',
        data_type: 'TEXT',
        requires_data: false,
        data_label: '',
        data_description: '',
        choices: null,
        status: 'ACTIVE',
        created_at: new Date(),
      },
    ];

    const mockRequestOptions = [
      {
        id: 1,
        freelance_request_id: 1,
        service_option_id: 1,
        is_required: true,
        response_data: { data: 'React, Node.js expertise required' },
        created_at: new Date(),
      },
      {
        id: 2,
        freelance_request_id: 1,
        service_option_id: 2,
        is_required: false,
        response_data: { data: 'Optional DevOps support' },
        created_at: new Date(),
      },
    ];

    it('should successfully complete freelance onboarding with services', async () => {
      const mockTransaction = jest.fn().mockImplementation(async (callback) => {
        const mockTx = {
          freelance: {
            create: jest.fn().mockResolvedValue(mockFreelance),
          },
          freelanceRequest: {
            create: jest.fn().mockResolvedValue(mockFreelanceRequest),
          },
          platformService: {
            findUnique: jest.fn()
              .mockResolvedValueOnce(mockPlatformServices[0])
              .mockResolvedValueOnce(mockPlatformServices[1]),
          },
          freelanceRequestOption: {
            create: jest.fn()
              .mockResolvedValueOnce(mockRequestOptions[0])
              .mockResolvedValueOnce(mockRequestOptions[1]),
          },
        };
        return await callback(mockTx);
      });

      mockPrisma.$transaction = mockTransaction;

      const result = await AuthService.completeFreelanceOnboarding(mockUserId, mockFreelanceData);

      expect(mockTransaction).toHaveBeenCalledWith(expect.any(Function));

      expect(result).toEqual({
        freelance: mockFreelance,
        freelanceRequest: mockFreelanceRequest,
        requestOptions: mockRequestOptions,
      });

      expect(mockLogger.info).toHaveBeenCalledWith(
        'Starting freelance onboarding process',
        expect.objectContaining({
          operation: 'completeFreelanceOnboarding',
          userId: mockUserId,
          metier_id: 1,
          tjm: 650.00,
          days: 20,
        })
      );

      expect(mockLogger.info).toHaveBeenCalledWith(
        'Freelance profile created successfully',
        expect.objectContaining({
          freelanceId: 1,
        })
      );

      expect(mockLogger.info).toHaveBeenCalledWith(
        'Freelance request created successfully',
        expect.objectContaining({
          freelanceRequestId: 1,
          missionStatus: 'OPEN',
          priority: 'HIGH',
          clientName: 'Acme Corporation',
        })
      );

      expect(mockLogger.debug).toHaveBeenCalledWith(
        'Processing freelance service requests',
        expect.objectContaining({
          selectedServicesCount: 2,
        })
      );

      expect(mockLogger.info).toHaveBeenCalledWith(
        'Freelance service requests processed',
        expect.objectContaining({
          totalRequested: 2,
          successfullyLinked: 2,
          skipped: 0,
        })
      );
    });

    it('should successfully complete freelance onboarding without services', async () => {
      const mockTransaction = jest.fn().mockImplementation(async (callback) => {
        const mockTx = {
          freelance: {
            create: jest.fn().mockResolvedValue(mockFreelance),
          },
          freelanceRequest: {
            create: jest.fn().mockResolvedValue(mockFreelanceRequest),
          },
        };
        return await callback(mockTx);
      });

      mockPrisma.$transaction = mockTransaction;

      const result = await AuthService.completeFreelanceOnboarding(mockUserId, mockFreelanceDataNoServices);

      expect(result).toEqual({
        freelance: mockFreelance,
        freelanceRequest: mockFreelanceRequest,
        requestOptions: [],
      });

      expect(mockLogger.info).toHaveBeenCalledWith(
        'Freelance onboarding completed successfully',
        expect.objectContaining({
          freelanceId: 1,
          freelanceRequestId: 1,
          servicesRequested: 0,
        })
      );
    });

    it('should handle services that don\'t exist', async () => {
      const mockTransaction = jest.fn().mockImplementation(async (callback) => {
        const mockTx = {
          freelance: {
            create: jest.fn().mockResolvedValue(mockFreelance),
          },
          freelanceRequest: {
            create: jest.fn().mockResolvedValue(mockFreelanceRequest),
          },
          platformService: {
            findUnique: jest.fn()
              .mockResolvedValueOnce(mockPlatformServices[0]) // First service found
              .mockResolvedValueOnce(null), // Second service not found
          },
          freelanceRequestOption: {
            create: jest.fn().mockResolvedValueOnce(mockRequestOptions[0]),
          },
        };
        return await callback(mockTx);
      });

      mockPrisma.$transaction = mockTransaction;

      const result = await AuthService.completeFreelanceOnboarding(mockUserId, mockFreelanceData);

      expect(result.requestOptions).toHaveLength(1);

      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Platform service not found',
        expect.objectContaining({
          serviceId: 2,
        })
      );

      expect(mockLogger.info).toHaveBeenCalledWith(
        'Freelance service requests processed',
        expect.objectContaining({
          totalRequested: 2,
          successfullyLinked: 1,
          skipped: 1,
        })
      );
    });

    it('should handle database transaction failures', async () => {
      const dbError = new Error('Transaction failed');
      mockPrisma.$transaction.mockRejectedValue(dbError);

      await expect(
        AuthService.completeFreelanceOnboarding(mockUserId, mockFreelanceData)
      ).rejects.toThrow('Transaction failed');

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Freelance onboarding failed',
        dbError,
        expect.objectContaining({
          operation: 'completeFreelanceOnboarding',
          userId: mockUserId,
        })
      );
    });

    it('should handle freelance profile creation failure', async () => {
      const profileError = new Error('Freelance profile creation failed');
      
      const mockTransaction = jest.fn().mockImplementation(async (callback) => {
        const mockTx = {
          freelance: {
            create: jest.fn().mockRejectedValue(profileError),
          },
        };
        return await callback(mockTx);
      });

      mockPrisma.$transaction = mockTransaction;

      await expect(
        AuthService.completeFreelanceOnboarding(mockUserId, mockFreelanceData)
      ).rejects.toThrow('Freelance profile creation failed');

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Freelance onboarding failed',
        profileError,
        expect.any(Object)
      );
    });

    it('should handle freelance request creation failure', async () => {
      const requestError = new Error('Freelance request creation failed');
      
      const mockTransaction = jest.fn().mockImplementation(async (callback) => {
        const mockTx = {
          freelance: {
            create: jest.fn().mockResolvedValue(mockFreelance),
          },
          freelanceRequest: {
            create: jest.fn().mockRejectedValue(requestError),
          },
        };
        return await callback(mockTx);
      });

      mockPrisma.$transaction = mockTransaction;

      await expect(
        AuthService.completeFreelanceOnboarding(mockUserId, mockFreelanceData)
      ).rejects.toThrow('Freelance request creation failed');

      expect(mockLogger.info).toHaveBeenCalledWith(
        'Freelance profile created successfully',
        expect.any(Object)
      );

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Freelance onboarding failed',
        requestError,
        expect.any(Object)
      );
    });

    it('should handle service option creation failure', async () => {
      const optionError = new Error('Service option creation failed');
      
      const mockTransaction = jest.fn().mockImplementation(async (callback) => {
        const mockTx = {
          freelance: {
            create: jest.fn().mockResolvedValue(mockFreelance),
          },
          freelanceRequest: {
            create: jest.fn().mockResolvedValue(mockFreelanceRequest),
          },
          platformService: {
            findUnique: jest.fn().mockResolvedValueOnce(mockPlatformServices[0]),
          },
          freelanceRequestOption: {
            create: jest.fn().mockRejectedValue(optionError),
          },
        };
        return await callback(mockTx);
      });

      mockPrisma.$transaction = mockTransaction;

      await expect(
        AuthService.completeFreelanceOnboarding(mockUserId, mockFreelanceData)
      ).rejects.toThrow('Service option creation failed');

      expect(mockLogger.debug).toHaveBeenCalledWith(
        'Processing freelance service requests',
        expect.any(Object)
      );

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Freelance onboarding failed',
        optionError,
        expect.any(Object)
      );
    });

    it('should validate required freelance data fields', async () => {
      const invalidData = {
        metier_id: 0,
        mission_status: 'OPEN',
        priority: 'MEDIUM',
        tjm: 0,
        days: 0,
      } as FreelanceOnboarding;

      const mockTransaction = jest.fn().mockImplementation(async (callback) => {
        const mockTx = {
          freelance: {
            create: jest.fn().mockRejectedValue(new Error('Metier is required')),
          },
        };
        return await callback(mockTx);
      });

      mockPrisma.$transaction = mockTransaction;

      await expect(
        AuthService.completeFreelanceOnboarding(mockUserId, invalidData)
      ).rejects.toThrow('Metier is required');
    });

    it('should handle service requests with empty response data', async () => {
      const dataWithEmptyResponse: FreelanceOnboarding = {
        ...mockFreelanceData,
        selected_services: [
          {
            serviceId: 1,
            isRequired: true,
            responseData: '',
          },
        ],
      };

      const mockTransaction = jest.fn().mockImplementation(async (callback) => {
        const mockTx = {
          freelance: {
            create: jest.fn().mockResolvedValue(mockFreelance),
          },
          freelanceRequest: {
            create: jest.fn().mockResolvedValue(mockFreelanceRequest),
          },
          platformService: {
            findUnique: jest.fn().mockResolvedValueOnce(mockPlatformServices[0]),
          },
          freelanceRequestOption: {
            create: jest.fn().mockResolvedValueOnce({
              ...mockRequestOptions[0],
              response_data: undefined,
            }),
          },
        };
        return await callback(mockTx);
      });

      mockPrisma.$transaction = mockTransaction;

      const result = await AuthService.completeFreelanceOnboarding(mockUserId, dataWithEmptyResponse);

      expect(result.requestOptions).toHaveLength(1);
      expect(mockLogger.debug).toHaveBeenCalledWith(
        'Freelance request option created',
        expect.objectContaining({
          serviceId: 1,
          isRequired: true,
        })
      );
    });
  });
});
