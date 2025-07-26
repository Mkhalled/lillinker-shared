import { NextResponse } from 'next/server';

import { logger } from '@/lib/logger';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const logContext = {
    operation: 'get_portages',
    method: 'GET',
    path: '/api/portages',
  };

  try {
    logger.info('Fetching portages', logContext);

    const portages = await prisma.portage.findMany({
      orderBy: {
        name: 'asc',
      },
    });

    logger.info('Portages fetched successfully', {
      ...logContext,
      count: portages.length,
    });

    return NextResponse.json({
      success: true,
      data: portages,
    });
  } catch (error) {
    logger.error('Failed to fetch portages', error as Error, logContext);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch portages',
        data: [],
      },
      { status: 500 }
    );
  }
}
