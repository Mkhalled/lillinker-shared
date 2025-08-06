import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

import { CompanyDAO } from '@/dao/company.dao';
import { authOptions } from '@/lib/auth';
import { CompanyService } from '@/services/company/company.service';
import { CotisationPayload } from '@/types/organisme';

interface RouteParams {
  params: {
    id: string;
    cotisationId: string;
  };
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
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

    const cotisationId = parseInt(params.cotisationId);
    if (isNaN(cotisationId)) {
      return NextResponse.json({ error: 'Invalid cotisation ID' }, { status: 400 });
    }

    const body: Partial<CotisationPayload> = await request.json();

    const cotisation = await CompanyService.updateCotisation(cotisationId, company.id, body);

    return NextResponse.json({
      success: true,
      data: cotisation
    });

  } catch (error) {
    console.error('Error updating cotisation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
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

    const cotisationId = parseInt(params.cotisationId);
    if (isNaN(cotisationId)) {
      return NextResponse.json({ error: 'Invalid cotisation ID' }, { status: 400 });
    }

    await CompanyService.deleteCotisation(cotisationId, company.id);

    return NextResponse.json({
      success: true,
      message: 'Cotisation deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting cotisation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
