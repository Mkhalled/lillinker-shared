import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email est requis' },
        { status: 400 }
      );
    }

    // Check if email exists in users table
    const existingUser = await prisma.user.findUnique({
      where: {
        email: email.toLowerCase()
      },
      select: {
        id: true,
        email: true
      }
    });

    return NextResponse.json({
      exists: !!existingUser,
      message: existingUser ? 'Cette adresse email est déjà utilisée' : 'Email disponible'
    });

  } catch (error) {
    console.error('Email check error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la vérification de l\'email' },
      { status: 500 }
    );
  }
}
