import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/services/auth.service';
import { CompanyOnboardingSchema } from '@/lib/validations/auth.validation';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, ...onboardingData } = body;
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const validatedData = CompanyOnboardingSchema.parse(onboardingData);

    const result = await AuthService.completeCompanyOnboarding(
      parseInt(userId),
      validatedData
    );

    // Finalize registration and send verification email
    await AuthService.finalizeRegistration(parseInt(userId), 'COMPANY');

    return NextResponse.json({
      success: true,
      message: 'Company onboarding completed successfully',
      data: result,
    });
  } catch (error) {
    console.error('Company onboarding error:', error);
    
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