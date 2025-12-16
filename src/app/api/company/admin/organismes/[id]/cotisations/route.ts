import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

import { CompanyDAO } from '@/dao/company.dao';
import { authOptions } from '@/lib/auth';
import { CompanyService } from '@/services/company/company.service';
import { CotisationPayload } from '@/types/organisme';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function POST(request: NextRequest, context: RouteParams) {
  try {
    const params = await context.params;
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'COMPANY') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Get company by user ID
    const company = await CompanyDAO.findByUserId(parseInt(session.user.id));
    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    const organismeId = parseInt(params.id);
    if (isNaN(organismeId)) {
      return NextResponse.json({ error: 'Invalid organisme ID' }, { status: 400 });
    }

    const body: CotisationPayload = await request.json();
    body.organisme_id = organismeId;

    // Basic validation
    if (!body.label || !body.type) {
      return NextResponse.json({ error: 'Label and type are required' }, { status: 400 });
    }

    const cotisation = await CompanyService.createCotisation(organismeId, company.id, body);

    return NextResponse.json(
      {
        success: true,
        data: cotisation,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating cotisation:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
