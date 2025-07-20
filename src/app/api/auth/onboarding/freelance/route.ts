import { NextRequest, NextResponse } from 'next/server';

import { logger } from '@/lib/logger';
import { FreelanceOnboardingSchema } from '@/lib/validations/auth.validation';
import { AuthService } from '@/services/auth.service';

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
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const validatedData = FreelanceOnboardingSchema.parse(onboardingData);

    logger.debug('Freelance onboarding data validated successfully', {
      ...enhancedLogContext,
      missionStatus: validatedData.mission_status,
      priority: validatedData.priority,
      hasSelectedServices: !!(validatedData.selected_services?.length),
      clientName: validatedData.client_name,
    });

    const result = await AuthService.completeFreelanceOnboarding(
      parseInt(userId),
      validatedData
    );

    logger.info('Freelance onboarding completed, starting finalization', enhancedLogContext);

    // Finalize registration and send verification email
    await AuthService.finalizeRegistration(parseInt(userId));

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
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}