import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/lib/auth';
import { CompanyDAO } from '@/dao/company.dao';
import { CompanyService } from '@/services/company/company.service';
import { UpdateOrganismeRequest } from '@/types/organisme';

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
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

    const organismeId = parseInt(params.id);
    if (isNaN(organismeId)) {
      return NextResponse.json({ error: 'Invalid organisme ID' }, { status: 400 });
    }

    const organisme = await CompanyService.getOrganisme(organismeId, company.id);

    return NextResponse.json({
      success: true,
      data: organisme
    });

  } catch (error) {
    console.error('Error fetching organisme:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
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

    const organismeId = parseInt(params.id);
    if (isNaN(organismeId)) {
      return NextResponse.json({ error: 'Invalid organisme ID' }, { status: 400 });
    }

    const body: UpdateOrganismeRequest = await request.json();

    // If cotisations are being updated, validate that at least one exists
    if (body.cotisations !== undefined) {
      if (!Array.isArray(body.cotisations) || body.cotisations.length === 0) {
        return NextResponse.json(
          { error: 'At least one cotisation is required for an organisme' },
          { status: 400 }
        );
      }

      // Validate each cotisation
      for (const cotisation of body.cotisations) {
        if (!cotisation.label || !cotisation.type) {
          return NextResponse.json(
            { error: 'Each cotisation must have a label and type' },
            { status: 400 }
          );
        }
      }
    }

    const organisme = await CompanyService.updateOrganisme(organismeId, company.id, body);

    return NextResponse.json({
      success: true,
      data: organisme
    });

  } catch (error) {
    console.error('Error updating organisme:', error);
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

    const organismeId = parseInt(params.id);
    if (isNaN(organismeId)) {
      return NextResponse.json({ error: 'Invalid organisme ID' }, { status: 400 });
    }

    await CompanyService.deleteOrganisme(organismeId, company.id);

    return NextResponse.json({
      success: true,
      message: 'Organisme deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting organisme:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
