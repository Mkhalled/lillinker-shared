import { NextRequest } from 'next/server';

import { POST as FreelanceOnboardingPOST } from '@/app/api/auth/onboarding/freelance/route';
import { logger } from '@/lib/logger';
import { prisma } from '@/lib/prisma';
import { FreelanceService, AuthService } from '@/services';

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

jest.mock('@/lib/validations/auth.validation', () => ({
  FreelanceOnboardingSchema: {
    parse: jest.fn(),
  },
}));

jest.mock('@/services', () => ({
  FreelanceService: {
    createFreelanceProfile: jest.fn(),
    createFreelanceRequest: jest.fn(),
    createRequestOptions: jest.fn(),
    linkLabelsSelected: jest.fn(),
  },
  AuthService: {
    sendVerificationEmail: jest.fn(),
  },
}));

const mockLogger = logger as any;
const mockPrisma = prisma as any;
const mockFreelanceOnboardingSchema =
  require('@/lib/validations/auth.validation').FreelanceOnboardingSchema;
const mockFreelanceService = FreelanceService as any;
const mockAuthService = AuthService as any;

describe('POST /api/auth/onboarding/freelance', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const validOnboardingData = {
    userId: 1,
    metier_id: 2,
    mission_status: 'OPEN',
    client_name: 'Acme Corporation',
    priority: 'HIGH',
    tjm: 650.0,
    days: 20,
    wants_portage: false,
    selected_services: [
      {
        serviceId: 1,
        isRequired: true,
        responseData: 'React expertise required',
      },
      {
        serviceId: 2,
        isRequired: false,
        responseData: 'Node.js experience preferred',
      },
    ],
    selected_portages: [],
  };

  const mockFreelanceProfile = {
    id: 1,
    freelance_id: 1,
    metier_id: 2,
    created_at: new Date(),
    updated_at: new Date(),
  };

  const mockFreelanceRequest = {
    id: 1,
    freelance_id: 1,
    mission_status: 'OPEN',
    client_name: 'Acme Corporation',
    priority: 'HIGH',
    tjm: 650.0,
    days: 20,
    created_at: new Date(),
    updated_at: new Date(),
  };

  const mockRequestOptions = [
    {
      id: 1,
      freelance_request_id: 1,
      service_option_id: 1,
      is_required: true,
      response_data: 'React expertise required',
    },
    {
      id: 2,
      freelance_request_id: 1,
      service_option_id: 2,
      is_required: false,
      response_data: 'Node.js experience preferred',
    },
  ];

  it('should successfully complete freelance onboarding', async () => {
    const { userId, ...onboardingDataWithoutUserId } = validOnboardingData;

    mockFreelanceOnboardingSchema.parse.mockReturnValue(onboardingDataWithoutUserId);

    mockPrisma.$transaction.mockImplementation(async (callback: any) => {
      mockFreelanceService.createFreelanceProfile.mockResolvedValue(mockFreelanceProfile);
      mockFreelanceService.createFreelanceRequest.mockResolvedValue(mockFreelanceRequest);
      mockFreelanceService.createRequestOptions.mockResolvedValue(mockRequestOptions);

      return await callback();
    });

    mockAuthService.sendVerificationEmail.mockResolvedValue(true);

    const request = new NextRequest(process.env.NEXTAUTH_URL + '/api/auth/onboarding/freelance', {
      method: 'POST',
      body: JSON.stringify(validOnboardingData),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const response = await FreelanceOnboardingPOST(request);
    const responseData = await response.json();

    expect(mockFreelanceOnboardingSchema.parse).toHaveBeenCalledWith(onboardingDataWithoutUserId);

    expect(mockPrisma.$transaction).toHaveBeenCalled();
    expect(mockFreelanceService.createFreelanceProfile).toHaveBeenCalledWith(
      userId,
      validOnboardingData.metier_id
    );
    expect(mockFreelanceService.createFreelanceRequest).toHaveBeenCalledWith(
      mockFreelanceProfile.id,
      onboardingDataWithoutUserId
    );
    expect(mockFreelanceService.createRequestOptions).toHaveBeenCalledWith(
      mockFreelanceRequest.id,
      validOnboardingData.selected_services
    );
    expect(response.status).toBe(200);
    expect(responseData).toEqual({
      success: true,
      message: 'Freelance onboarding completed successfully',
      data: expect.any(Object),
    });

    expect(mockLogger.info).toHaveBeenCalledWith(
      'Freelance onboarding API endpoint called',
      expect.objectContaining({
        operation: 'freelance_onboarding',
        method: 'POST',
        path: '/api/auth/onboarding/freelance',
      })
    );

    expect(mockLogger.info).toHaveBeenCalledWith(
      'Freelance onboarding API completed successfully',
      expect.objectContaining({
        userId: userId,
        freelanceId: mockFreelanceProfile.id,
        freelanceRequestId: mockFreelanceRequest.id,
        requestOptionsCreated: mockRequestOptions.length,
      })
    );
  });

  it('should handle freelance onboarding with portage preferences', async () => {
    const onboardingDataWithPortage = {
      ...validOnboardingData,
      wants_portage: true,
      selected_portages: [1, 2],
    };

    const { userId, ...onboardingDataWithoutUserId } = onboardingDataWithPortage;

    mockFreelanceOnboardingSchema.parse.mockReturnValue(onboardingDataWithoutUserId);

    mockPrisma.$transaction.mockImplementation(async (callback: any) => {
      mockFreelanceService.createFreelanceProfile.mockResolvedValue(mockFreelanceProfile);
      mockFreelanceService.createFreelanceRequest.mockResolvedValue(mockFreelanceRequest);
      mockFreelanceService.createRequestOptions.mockResolvedValue(mockRequestOptions);
      mockFreelanceService.linkLabelsSelected.mockResolvedValue(true);

      return await callback();
    });

    mockAuthService.sendVerificationEmail.mockResolvedValue(true);

    const request = new NextRequest(process.env.NEXTAUTH_URL + '/api/auth/onboarding/freelance', {
      method: 'POST',
      body: JSON.stringify(onboardingDataWithPortage),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const response = await FreelanceOnboardingPOST(request);
    const responseData = await response.json();

    expect(mockFreelanceService.linkLabelsSelected).toHaveBeenCalledWith(
      mockFreelanceRequest.id,
      onboardingDataWithPortage.selected_portages
    );

    expect(response.status).toBe(200);
    expect(responseData.success).toBe(true);
  });

  it('should handle missing userId error', async () => {
    const invalidData = {
      metier_id: 2,
      mission_status: 'OPEN',
      // Missing userId
    };

    const request = new NextRequest(process.env.NEXTAUTH_URL + '/api/auth/onboarding/freelance', {
      method: 'POST',
      body: JSON.stringify(invalidData),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const response = await FreelanceOnboardingPOST(request);
    const responseData = await response.json();

    expect(response.status).toBe(400);
    expect(responseData).toEqual({
      error: 'User ID is required',
    });

    expect(mockLogger.warn).toHaveBeenCalledWith(
      'Freelance onboarding attempt without user ID',
      expect.objectContaining({
        operation: 'freelance_onboarding',
      })
    );
  });

  it('should handle validation errors', async () => {
    const invalidData = {
      userId: 1,
      metier_id: 'invalid',
      mission_status: 'INVALID_STATUS',
      tjm: 'not_a_number',
    };

    mockFreelanceOnboardingSchema.parse.mockImplementation(() => {
      throw new Error('Validation failed: Invalid data format');
    });

    const request = new NextRequest(process.env.NEXTAUTH_URL + '/api/auth/onboarding/freelance', {
      method: 'POST',
      body: JSON.stringify(invalidData),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const response = await FreelanceOnboardingPOST(request);
    const responseData = await response.json();

    expect(response.status).toBe(400);
    expect(responseData).toEqual({
      error: 'Validation failed: Invalid data format',
    });

    expect(mockLogger.error).toHaveBeenCalledWith(
      'Freelance onboarding API failed',
      expect.any(Error),
      expect.objectContaining({
        operation: 'freelance_onboarding',
      })
    );
  });

  it('should handle freelance profile creation errors', async () => {
    const { userId, ...onboardingDataWithoutUserId } = validOnboardingData;

    mockFreelanceOnboardingSchema.parse.mockReturnValue(onboardingDataWithoutUserId);

    const profileCreationError = new Error('Failed to create freelance profile');
    mockPrisma.$transaction.mockImplementation(async (callback: any) => {
      mockFreelanceService.createFreelanceProfile.mockRejectedValue(profileCreationError);
      return await callback();
    });

    const request = new NextRequest(process.env.NEXTAUTH_URL + '/api/auth/onboarding/freelance', {
      method: 'POST',
      body: JSON.stringify(validOnboardingData),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const response = await FreelanceOnboardingPOST(request);
    const responseData = await response.json();

    expect(response.status).toBe(400);
    expect(responseData).toEqual({
      error: 'Failed to create freelance profile',
    });

    expect(mockLogger.error).toHaveBeenCalledWith(
      'Freelance onboarding API failed',
      profileCreationError,
      expect.objectContaining({
        operation: 'freelance_onboarding',
      })
    );
  });

  it('should handle freelance request creation errors', async () => {
    const { userId, ...onboardingDataWithoutUserId } = validOnboardingData;

    mockFreelanceOnboardingSchema.parse.mockReturnValue(onboardingDataWithoutUserId);

    const requestCreationError = new Error('Failed to create freelance request');
    mockPrisma.$transaction.mockImplementation(async (callback: any) => {
      mockFreelanceService.createFreelanceProfile.mockResolvedValue(mockFreelanceProfile);
      mockFreelanceService.createFreelanceRequest.mockRejectedValue(requestCreationError);
      return await callback();
    });

    const request = new NextRequest(process.env.NEXTAUTH_URL + '/api/auth/onboarding/freelance', {
      method: 'POST',
      body: JSON.stringify(validOnboardingData),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const response = await FreelanceOnboardingPOST(request);
    const responseData = await response.json();

    expect(response.status).toBe(400);
    expect(responseData).toEqual({
      error: 'Failed to create freelance request',
    });
  });

  it('should handle request options creation errors', async () => {
    const { userId, ...onboardingDataWithoutUserId } = validOnboardingData;

    mockFreelanceOnboardingSchema.parse.mockReturnValue(onboardingDataWithoutUserId);

    const optionsCreationError = new Error('Failed to create request options');
    mockPrisma.$transaction.mockImplementation(async (callback: any) => {
      mockFreelanceService.createFreelanceProfile.mockResolvedValue(mockFreelanceProfile);
      mockFreelanceService.createFreelanceRequest.mockResolvedValue(mockFreelanceRequest);
      mockFreelanceService.createRequestOptions.mockRejectedValue(optionsCreationError);
      return await callback();
    });

    const request = new NextRequest(process.env.NEXTAUTH_URL + '/api/auth/onboarding/freelance', {
      method: 'POST',
      body: JSON.stringify(validOnboardingData),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const response = await FreelanceOnboardingPOST(request);
    const responseData = await response.json();

    expect(response.status).toBe(400);
    expect(responseData).toEqual({
      error: 'Failed to create request options',
    });
  });

  it('should handle onboarding without selected services', async () => {
    const onboardingDataWithoutServices = {
      ...validOnboardingData,
      selected_services: [],
    };

    const { userId, ...onboardingDataWithoutUserId } = onboardingDataWithoutServices;

    mockFreelanceOnboardingSchema.parse.mockReturnValue(onboardingDataWithoutUserId);

    mockPrisma.$transaction.mockImplementation(async (callback: any) => {
      mockFreelanceService.createFreelanceProfile.mockResolvedValue(mockFreelanceProfile);
      mockFreelanceService.createFreelanceRequest.mockResolvedValue(mockFreelanceRequest);
      // createRequestOptions should not be called when no services are selected

      return await callback();
    });

    mockAuthService.sendVerificationEmail.mockResolvedValue(true);

    const request = new NextRequest(process.env.NEXTAUTH_URL + '/api/auth/onboarding/freelance', {
      method: 'POST',
      body: JSON.stringify(onboardingDataWithoutServices),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const response = await FreelanceOnboardingPOST(request);
    const responseData = await response.json();

    expect(mockFreelanceService.createRequestOptions).not.toHaveBeenCalled();
    expect(response.status).toBe(200);
    expect(responseData.success).toBe(true);
  });

  it('should handle database transaction errors', async () => {
    const { userId, ...onboardingDataWithoutUserId } = validOnboardingData;

    mockFreelanceOnboardingSchema.parse.mockReturnValue(onboardingDataWithoutUserId);

    const transactionError = new Error('Database transaction failed');
    mockPrisma.$transaction.mockRejectedValue(transactionError);

    const request = new NextRequest(process.env.NEXTAUTH_URL + '/api/auth/onboarding/freelance', {
      method: 'POST',
      body: JSON.stringify(validOnboardingData),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const response = await FreelanceOnboardingPOST(request);
    const responseData = await response.json();

    expect(response.status).toBe(400);
    expect(responseData).toEqual({
      error: 'Database transaction failed',
    });

    expect(mockLogger.error).toHaveBeenCalledWith(
      'Freelance onboarding API failed',
      transactionError,
      expect.objectContaining({
        operation: 'freelance_onboarding',
      })
    );
  });

  it('should handle empty request body', async () => {
    const request = new NextRequest(process.env.NEXTAUTH_URL + '/api/auth/onboarding/freelance', {
      method: 'POST',
      body: JSON.stringify({}),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const response = await FreelanceOnboardingPOST(request);
    const responseData = await response.json();

    expect(response.status).toBe(400);
    expect(responseData).toEqual({
      error: 'User ID is required',
    });

    expect(mockLogger.warn).toHaveBeenCalledWith(
      'Freelance onboarding attempt without user ID',
      expect.objectContaining({
        operation: 'freelance_onboarding',
      })
    );
  });
});