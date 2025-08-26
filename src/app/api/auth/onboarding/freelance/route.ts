import { Prisma } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

import { logger } from '@/lib/logger';
import { prisma } from '@/lib/prisma';
import { FreelanceOnboardingSchema } from '@/lib/validations/auth.validation';
import { FreelanceService } from '@/services';

type JsonValue = Prisma.JsonValue;

export async function POST(request: NextRequest) {
  const logContext = {
    operation: 'freelance_onboarding',
    method: 'POST',
    path: '/api/auth/onboarding/freelance',
  };

  try {
    logger.info('Freelance onboarding API endpoint called', logContext);

    const body = await request.json();
    const { userId, ...onboardingData } = body;

    const enhancedLogContext = {
      ...logContext,
      userId,
      metier_id: onboardingData.metier_id,
      tjm: onboardingData.tjm,
      days: onboardingData.days,
    };

    logger.debug('Freelance onboarding request received', enhancedLogContext);

    if (!userId) {
      logger.warn('Freelance onboarding attempt without user ID', logContext);
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const validatedData = FreelanceOnboardingSchema.parse(onboardingData);

    logger.debug('Freelance onboarding data validated successfully', {
      ...enhancedLogContext,
      missionStatus: validatedData.mission_status,
      priority: validatedData.priority,
      hasSelectedServices: !!validatedData.selected_services?.length,
      clientName: validatedData.client_name,
    });

    // Use a transaction to ensure data consistency
    const result = await prisma.$transaction(async () => {
      // Step 1: Create freelance profile
      const freelance = await FreelanceService.createFreelanceProfile(
        parseInt(userId),
        validatedData.metier_id
      );

      logger.info('Freelance profile created successfully', {
        ...enhancedLogContext,
        freelanceId: freelance.id,
      });

      // Step 2: Create freelance request
      const freelanceRequest = await FreelanceService.createFreelanceRequest(
        freelance.id,
        validatedData
      );

      logger.info('Freelance request created successfully', {
        ...enhancedLogContext,
        freelanceRequestId: freelanceRequest.id,
      });

      // Step 3: Create request options for selected services
      let requestOptions: Array<{
        id: number;
        freelance_request_id: number;
        service_option_id: number;
        is_required: boolean;
        response_data: JsonValue;
      }> = [];
      if (validatedData.selected_services && validatedData.selected_services.length > 0) {
        requestOptions = await FreelanceService.createRequestOptions(
          freelanceRequest.id,
          validatedData.selected_services
        );
      }

      // Step 4: Link portage preferences if provided
      if (validatedData.selected_portages && validatedData.selected_portages.length > 0) {
        await FreelanceService.linkLabelsSelected(
          freelanceRequest.id,
          validatedData.selected_portages
        );
      }

      return {
        freelance,
        freelanceRequest,
        requestOptions,
      };
    });

    logger.info('Freelance onboarding API completed successfully', {
      ...enhancedLogContext,
      freelanceId: result.freelance.id,
      freelanceRequestId: result.freelanceRequest.id,
      requestOptionsCreated: result.requestOptions.length,
    });

    return NextResponse.json({
      success: true,
      message: 'Freelance onboarding completed successfully',
      data: result,
    });
  } catch (error) {
    logger.error('Freelance onboarding API failed', error as Error, logContext);

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
