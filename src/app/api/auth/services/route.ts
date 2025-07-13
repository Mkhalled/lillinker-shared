import { NextResponse } from 'next/server';
import { AuthService } from '@/services/auth.service';

export async function GET() {
  try {
    const services = await AuthService.getAvailableServices();

    return NextResponse.json({
      success: true,
      services,
    });
  } catch (error) {
    console.error('Get services error:', error);
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}