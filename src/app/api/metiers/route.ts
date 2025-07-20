import { NextResponse } from 'next/server';

import { logger } from '@/lib/logger';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    logger.debug('Fetching available metiers');

    const metiers = await prisma.metier.findMany({
      orderBy: {
        name: 'asc',
      },
    });

    logger.info('Available metiers fetched successfully', {
      metiersCount: metiers.length,
    });

    return NextResponse.json({
      success: true,
      data: metiers,
    });
  } catch (error) {
    logger.error('Failed to fetch metiers', error as Error);
    
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch metiers',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
