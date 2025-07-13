import { NextRequest, NextResponse } from 'next/server';

import { SetPasswordSchema } from '@/lib/validations/auth.validation';
import { AuthService } from '@/services/auth.service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = SetPasswordSchema.parse(body);

    const result = await AuthService.verifyEmailAndSetPassword(
      validatedData.token,
      validatedData.password
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('Email verification error:', error);
    
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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.redirect(new URL('/auth/error?error=missing-token', request.url));
    }

    // Redirect to set password page with token
    return NextResponse.redirect(new URL(`/auth/set-password?token=${token}`, request.url));
  } catch (error) {
    console.error('Email verification redirect error:', error);
    return NextResponse.redirect(new URL('/auth/error?error=invalid-token', request.url));
  }
}