import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const platformServices = await prisma.platformService.findMany({
      where: {
        status: 'ACTIVE'
      },
      select: {
        id: true,
        label: true,
        description: true,
        data_type: true,
        requires_data: true,
        data_label: true,
        data_description: true,
        choices: true,
        user: {
          select: {
            first_name: true,
            last_name: true,
            ownedCompany: {
              select: {
                name: true
              }
            }
          }
        }
      },
      orderBy: {
        label: 'asc'
      }
    });

    return NextResponse.json({
      success: true,
      data: platformServices,
    });
  } catch (error) {
    console.error('Error fetching platform services:', error);
    
    return NextResponse.json(
      { error: 'Failed to fetch platform services' },
      { status: 500 }
    );
  }
}
