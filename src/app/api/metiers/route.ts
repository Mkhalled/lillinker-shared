import { NextResponse } from 'next/server';

import { PlatformServiceService } from '@/services';

export async function GET() {
  try {
    const secteurs = await PlatformServiceService.getSecteursActivite();
    return NextResponse.json({
      success: true,
      data: secteurs,
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
