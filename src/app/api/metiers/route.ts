import { NextResponse } from 'next/server';

import { PlatformServiceService } from '@/services';

export async function GET() {
  try {
    const metiers = await PlatformServiceService.getMetiers();
    return NextResponse.json({
      success: true,
      data: metiers,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch metiers',
        error:
          process.env.NODE_ENV === 'development'
            ? (error as Error).message
            : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
