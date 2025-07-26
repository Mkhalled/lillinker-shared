import { NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const services = await prisma.companyService.findMany({
      where: {
        is_active: true,
        service: {
          status: 'ACTIVE',
        },
      },
      include: {
        service: true,
        company: true,
      },
    });

    return NextResponse.json({
      success: true,
      services,
    });
  } catch (error) {
    console.error('Get services error:', error);

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
