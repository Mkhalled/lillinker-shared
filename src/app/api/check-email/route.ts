import { NextRequest, NextResponse } from 'next/server';

import { AuthService } from '@/services';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email est requis' }, { status: 400 });
    }

    // Use the checkEmailExists service
    const exists = await AuthService.checkEmailExists(email);

    return NextResponse.json({
      exists,
      message: exists ? 'Cette adresse email est déjà utilisée' : 'Email disponible',
    });
  } catch (error) {
    console.error('Email check error:', error);
    return NextResponse.json(
      { error: "Erreur lors de la vérification de l'email" },
      { status: 500 }
    );
  }
}
