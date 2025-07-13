import { NextRequest, NextResponse } from 'next/server';

import { logger } from '@/lib/logger';
import { InitialRegistrationSchema } from '@/lib/validations/auth.validation';
import { AuthService } from '@/services/auth.service';

export async function POST(request: NextRequest) {
  const logContext = {
    operation: 'register',
    method: 'POST',
    path: '/api/auth/register',
  };

  try {
    logger.info('Registration API endpoint called', logContext);

    const body = await request.json();
    
    logger.debug('Registration request body received', {
      ...logContext,
      email: body.email,
      role: body.role,
      hasPhoneNumber: !!body.phone_number,
    });

    const validatedData = InitialRegistrationSchema.parse(body);

    logger.debug('Registration data validated successfully', {
      ...logContext,
      email: validatedData.email,
      role: validatedData.role,
    });

    const { user } = await AuthService.initiateRegistration(validatedData);

    logger.info('Registration API completed successfully', {
      ...logContext,
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return NextResponse.json({
      success: true,
      message: 'Registration initiated successfully',
      userId: user.id,
      role: user.role,
    });
  } catch (error) {
    logger.error('Registration API failed', error as Error, logContext);
    
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