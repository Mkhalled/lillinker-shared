import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/lib/auth';
import { CompanyDAO } from '@/dao/company.dao';
import { CompanyService } from '@/services/company/company.service';
import { CreateOrganismeRequest } from '@/types/organisme';

export async function GET() {
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

    const organismes = await CompanyService.getCompanyOrganismes(company.id);

    return NextResponse.json({
      success: true,
      data: organismes
    });

  } catch (error) {
    console.error('Error fetching organismes:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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

    const body: CreateOrganismeRequest = await request.json();

    // Basic validation
    if (!body.label || !body.cotisations || !Array.isArray(body.cotisations)) {
      return NextResponse.json(
        { error: 'Label and cotisations are required' },
        { status: 400 }
      );
    }

    // Validate that at least one cotisation is provided
    if (body.cotisations.length === 0) {
      return NextResponse.json(
        { error: 'At least one cotisation is required to create an organisme' },
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

    const organisme = await CompanyService.createOrganisme(company.id, body);

    return NextResponse.json({
      success: true,
      data: organisme
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating organisme:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
