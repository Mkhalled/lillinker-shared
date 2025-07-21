import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { siret } = await request.json();

    if (!siret || typeof siret !== 'string') {
      return NextResponse.json(
        { error: 'SIRET is required' },
        { status: 400 }
      );
    }

    // Check if SIRET already exists in the database
    const existingCompany = await prisma.company.findUnique({
      where: {
        siret: siret.trim(),
      },
    });

    return NextResponse.json({
      exists: !!existingCompany,
      siret: siret.trim(),
    });
  } catch (error) {
    console.error('Error checking SIRET:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
