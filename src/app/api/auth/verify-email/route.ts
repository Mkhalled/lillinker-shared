import { NextRequest, NextResponse } from 'next/server';

import { logger } from '@/lib/logger';
import { SetPasswordSchema } from '@/lib/validations/auth.validation';
import { AuthService } from '@/services';

export async function POST(request: NextRequest) {
  const logContext = {
    operation: 'verify_email_set_password',
    method: 'POST',
    path: '/api/auth/verify-email',
  };

  try {
    logger.info('Email verification and password setting API called', logContext);

    const body = await request.json();

    logger.debug('Email verification request received', {
      ...logContext,
      hasToken: !!body.token,
      hasPassword: !!body.password,
      tokenLength: body.token?.length,
    });

    const validatedData = SetPasswordSchema.parse(body);

    logger.debug('Email verification data validated successfully', {
      ...logContext,
      tokenLength: validatedData.token.length,
    });

    const result = await AuthService.verifyEmailAndSetPassword(
      validatedData.token,
      validatedData.password
    );

    logger.info('Email verification and password setting completed successfully', logContext);

    return NextResponse.json(result);
  } catch (error) {
    logger.error('Email verification API failed', error as Error, logContext);

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const logContext = {
    operation: 'verify_email_redirect',
    method: 'GET',
    path: '/api/auth/verify-email',
  };

  try {
    logger.info('Email verification redirect endpoint called', logContext);

    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    logger.debug('Email verification redirect request', {
      ...logContext,
      hasToken: !!token,
      tokenLength: token?.length,
    });

    if (!token) {
      logger.warn('Email verification redirect attempted without token', logContext);
      return NextResponse.redirect(new URL('/auth/error?error=missing-token', request.url));
    }

    logger.info('Redirecting to set password page', {
      ...logContext,
      tokenLength: token.length,
    });

    // Redirect to set password page with token
    return NextResponse.redirect(new URL(`/auth/set-password?token=${token}`, request.url));
  } catch (error) {
    logger.error('Email verification redirect failed', error as Error, logContext);
    return NextResponse.redirect(new URL('/auth/error?error=invalid-token', request.url));
  }
}
