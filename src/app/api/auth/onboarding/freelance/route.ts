import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/services/auth.service';
import { FreelanceOnboardingSchema } from '@/lib/validations/auth.validation';

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

    const validatedData = FreelanceOnboardingSchema.parse(onboardingData);

    const result = await AuthService.completeFreelanceOnboarding(
      parseInt(userId),
      validatedData
    );

    // Finalize registration and send verification email
    await AuthService.finalizeRegistration(parseInt(userId), 'FREELANCE');

    return NextResponse.json({
      success: true,
      message: 'Freelance onboarding completed successfully',
      data: result,
    });
  } catch (error) {
    console.error('Freelance onboarding error:', error);
    
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