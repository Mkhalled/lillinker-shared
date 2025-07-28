import { NextRequest, NextResponse } from 'next/server';

import { logger } from '@/lib/logger';
import { AuthService } from '@/services';

export async function POST(request: NextRequest) {
  const logContext = {
    operation: 'login_api',
  };

  try {
    const body = await request.json();
    const { email, password } = body;

    logger.info('Login API attempt started', { ...logContext, email });

    const result = await AuthService.login(email, password);

    return NextResponse.json(result, { status: 200 });
  } catch (error: unknown) {
    logger.error('Login API failed', error, logContext);

    let status = 500;
    let message = "Une erreur inattendue s'est produite. Veuillez réessayer.";

    if (
      error instanceof Error &&
      [
        'Email et mot de passe sont requis',
        'Email ou mot de passe invalide',
        'Veuillez vérifier votre adresse email',
        "Votre compte est en cours de validation par l'administrateur",
      ].includes(error.message)
    ) {
      status = ['Email et mot de passe sont requis'].includes(error.message) ? 400 : 403;
      if (error.message === 'Email ou mot de passe invalide') status = 401;
      message = error.message;
    }

    return NextResponse.json({ error: message }, { status });
  }
}
