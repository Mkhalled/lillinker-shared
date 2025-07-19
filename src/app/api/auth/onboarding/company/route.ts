import { NextRequest, NextResponse } from 'next/server';

import { logger } from '@/lib/logger';
import { CompanyOnboardingSchema } from '@/lib/validations/auth.validation';
import { AuthService } from '@/services/auth.service';

export async function POST(request: NextRequest) {
  const logContext = {
    operation: 'company_onboarding',
    method: 'POST',
    path: '/api/auth/onboarding/company',
  };

  try {
    logger.info('Company onboarding API endpoint called', logContext);

    const body = await request.json();
    const { userId, ...onboardingData } = body;
    
    const enhancedLogContext = {
      ...logContext,
      userId,
      companyName: onboardingData.company_name,
      siret: onboardingData.siret,
    };

    logger.debug('Company onboarding request received', enhancedLogContext);
    
    if (!userId) {
      logger.warn('Company onboarding attempt without user ID', logContext);
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const validatedData = CompanyOnboardingSchema.parse(onboardingData);

    logger.debug('Company onboarding data validated successfully', {
      ...enhancedLogContext,
      hasSelectedServices: !!(validatedData.selected_services?.length),
      hasNewServices: !!(validatedData.new_services?.length),
      hasLegacyNewService: !!validatedData.service_label,
      consultantCount: validatedData.consultant_count,
    });

    const result = await AuthService.completeCompanyOnboarding(
      parseInt(userId),
      validatedData
    );

    logger.info('Company onboarding completed, starting finalization', enhancedLogContext);

    // Finalize registration and send verification email
    await AuthService.finalizeRegistration(parseInt(userId));

    logger.info('Company onboarding API completed successfully', {
      ...enhancedLogContext,
      companyId: result.company.id,
      servicesLinked: result.companyServices.length,
      newServicesCreated: result.platformServices.length,
    });

    return NextResponse.json({
      success: true,
      message: 'Company onboarding completed successfully',
      data: result,
    });
  } catch (error) {
    logger.error('Company onboarding API failed', error as Error, logContext);
    
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