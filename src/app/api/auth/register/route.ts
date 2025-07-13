import { NextRequest, NextResponse } from 'next/server';

import { InitialRegistrationSchema } from '@/lib/validations/auth.validation';
import { AuthService } from '@/services/auth.service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = InitialRegistrationSchema.parse(body);

    const { user } = await AuthService.initiateRegistration(validatedData);

    return NextResponse.json({
      success: true,
      message: 'Registration initiated successfully',
      userId: user.id,
      role: user.role,
    });
  } catch (error) {
    console.error('Registration error:', error);
    
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