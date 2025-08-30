import { NextRequest, NextResponse } from 'next/server';

import { logger } from '@/lib/logger';
import { prisma } from '@/lib/prisma';
import { InitialRegistrationSchema } from '@/lib/validations/auth.validation';
import { AuthService } from '@/services';

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

    // Registration with transaction and email verification
    const result = await prisma.$transaction(async (tx) => {
      const { user } = await AuthService.createUser(validatedData, tx);
      
      logger.debug('User created in transaction', {
        ...logContext,
        userId: user.id,
        email: user.email,
      });

      // Try to send email within transaction
      try {
        await AuthService.sendVerificationEmail(user.id, tx);
        
        logger.debug('Verification email sent successfully in transaction', {
          ...logContext,
          userId: user.id,
          email: user.email,
        });
        
        return { user, emailSent: true, emailError: null };
      } catch (emailError) {
        logger.warn('Email failed during transaction, but keeping user', emailError as Error, {
          ...logContext,
          userId: user.id,
          email: user.email,
        });
        
        // Don't throw - handle gracefully by returning the error
        return { user, emailSent: false, emailError: emailError as Error };
      }
    }, {
      // Transaction options
      maxWait: 10000, 
      timeout: 30000,
    });

    // Handle email retry outside transaction if needed
    if (!result.emailSent) {
      logger.info('Attempting email retry outside transaction', {
        ...logContext,
        userId: result.user.id,
        email: result.user.email,
      });

      // Retry email sending outside transaction (non-blocking)
      // Use a more robust retry mechanism with exponential backoff
      let retryCount = 0;
      const maxRetries = 3;
      const retryDelay = 2000; // Start with 2 seconds

      const attemptRetry = async () => {
        try {
          await AuthService.sendVerificationEmail(result.user.id, prisma);
          logger.info('Email sent successfully on retry', { 
            ...logContext,
            userId: result.user.id,
            email: result.user.email,
            retryCount,
          });
        } catch (retryError) {
          retryCount++;
          logger.error('Email retry failed', retryError as Error, {
            ...logContext,
            userId: result.user.id,
            email: result.user.email,
            retryCount,
            maxRetries,
          });

          // If we haven't exceeded max retries, try again with exponential backoff
          if (retryCount < maxRetries) {
            const nextDelay = retryDelay * Math.pow(2, retryCount - 1); // Exponential backoff
            logger.info('Scheduling next email retry', {
              ...logContext,
              userId: result.user.id,
              email: result.user.email,
              retryCount,
              nextDelay,
            });
            setTimeout(attemptRetry, nextDelay);
          } else {
            logger.error('Email retry exhausted all attempts', {
              ...logContext,
              userId: result.user.id,
              email: result.user.email,
              finalRetryCount: retryCount,
            });
          }
        }
      };

      // Start the retry process
      setTimeout(attemptRetry, retryDelay);
    }

    logger.info('Registration API completed successfully', {
      ...logContext,
      userId: result.user.id,
      email: result.user.email,
      role: result.user.role,
      emailSent: result.emailSent,
    });

    return NextResponse.json({
      success: true,
      message: result.emailSent 
        ? 'Registration completed successfully. Please check your email for verification.'
        : 'Registration completed successfully. Verification email will be sent shortly (retry in progress).',
      userId: result.user.id,
      role: result.user.role,
      emailSent: result.emailSent,
      ...(result.emailSent ? {} : {
        emailRetry: true,
        emailRetryMessage: 'Un problème temporaire a empêché l\'envoi immédiat de l\'email. Nous réessayons automatiquement. Si vous ne recevez pas d\'email dans les 5 minutes, vous pourrez demander un nouveau lien de vérification.',
        retryInfo: {
          maxRetries: 3,
          retryDelays: [2, 4, 8], // seconds
        }
      })
    });
  } catch (error) {
    logger.error('Registration API failed', error as Error, logContext);

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}