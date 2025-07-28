import { NextRequest, NextResponse } from 'next/server';

import { CompanyService } from '@/services';

export async function POST(request: NextRequest) {
  try {
    const { siret } = await request.json();

    if (!siret || typeof siret !== 'string') {
      return NextResponse.json({ error: 'SIRET is required' }, { status: 400 });
    }

    // Check if SIRET already exists in the database
    const existingCompany = await CompanyService.checkSiretExists(siret.trim());

    return NextResponse.json({
      exists: !!existingCompany,
      siret: siret.trim(),
    });
  } catch (error) {
    console.error('Error checking SIRET:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
