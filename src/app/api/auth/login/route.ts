import { compare } from 'bcryptjs';
import { NextRequest, NextResponse } from 'next/server';

import { logger } from '@/lib/logger';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  const logContext = {
    operation: 'login_api',
  };

  try {
    const body = await request.json();
    const { email, password } = body;

    const extendedLogContext = {
      ...logContext,
      email,
    };

    logger.info('Login API attempt started', extendedLogContext);

    if (!email || !password) {
      logger.warn('Login API attempt with missing credentials', extendedLogContext);
      return NextResponse.json({ error: 'Email et mot de passe sont requis' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      logger.warn('Login API attempt with non-existent email', extendedLogContext);
      return NextResponse.json({ error: 'Email ou mot de passe invalide' }, { status: 401 });
    }

    logger.debug('User found for login API attempt', {
      ...extendedLogContext,
      userId: user.id,
      emailVerified: user.email_verified,
      status: user.status,
      role: user.role,
    });

    if (!user.email_verified) {
      logger.warn('Login API blocked - email not verified', {
        ...extendedLogContext,
        userId: user.id,
        reason: 'email_not_verified',
      });
      return NextResponse.json({ error: 'Veuillez vérifier votre adresse email' }, { status: 403 });
    }

    if (!user.status) {
      logger.warn('Login API blocked - account not validated by administrator', {
        ...extendedLogContext,
        userId: user.id,
        reason: 'account_not_validated',
      });
      return NextResponse.json(
        { error: "Votre compte est en cours de validation par l'administrateur" },
        { status: 403 }
      );
    }

    const isValid = await compare(password, user.password);

    if (!isValid) {
      logger.warn('Login API attempt with invalid password', {
        ...extendedLogContext,
        userId: user.id,
        reason: 'invalid_password',
      });
      return NextResponse.json({ error: 'Email ou mot de passe invalide' }, { status: 401 });
    }

    logger.info('Login API validation successful', {
      ...extendedLogContext,
      userId: user.id,
      role: user.role,
      firstName: user.first_name,
    });

    return NextResponse.json(
      {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          role: user.role,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    logger.error('Login API failed', error as Error, logContext);
    return NextResponse.json(
      { error: "Une erreur inattendue s'est produite. Veuillez réessayer." },
      { status: 500 }
    );
  }
}
