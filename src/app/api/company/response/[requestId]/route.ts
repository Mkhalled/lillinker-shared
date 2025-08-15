import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { CompanyResponseService } from '@/services/CompanyResponseService';
import { prisma } from '@/lib/prisma';

// GET - Get response data for a specific request
export async function GET(
  _request: NextRequest,
  { params }: { params: { requestId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (session.user.role !== 'COMPANY') {
      return NextResponse.json(
        { error: 'Forbidden: Only companies can access this endpoint' },
        { status: 403 }
      );
    }

    const requestId = parseInt(params.requestId);
    if (isNaN(requestId)) {
      return NextResponse.json(
        { error: 'Invalid request ID' },
        { status: 400 }
      );
    }

    // Get company ID from session user
    const companyData = await prisma.company.findUnique({
      where: { admin_user_id: parseInt(session.user.id) },
      select: { id: true }
    });

    if (!companyData) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    const responseData = await CompanyResponseService.getResponseData(
      requestId, 
      companyData.id
    );

    if (!responseData) {
      return NextResponse.json(
        { error: 'Request not found' },
        { status: 404 }
      );
    }

    // Check if response already exists
    const existingResponse = await CompanyResponseService.getExistingResponse(
      requestId, 
      companyData.id
    );

    return NextResponse.json({
      ...responseData,
      existing_response: existingResponse,
    });

  } catch (error) {
    console.error('Error fetching response data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create a new company response
export async function POST(
  request: NextRequest,
  { params }: { params: { requestId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (session.user.role !== 'COMPANY') {
      return NextResponse.json(
        { error: 'Forbidden: Only companies can create responses' },
        { status: 403 }
      );
    }

    const requestId = parseInt(params.requestId);
    if (isNaN(requestId)) {
      return NextResponse.json(
        { error: 'Invalid request ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    
    // Validate request body
    if (!body.services || !Array.isArray(body.services)) {
      return NextResponse.json(
        { error: 'Services array is required' },
        { status: 400 }
      );
    }

    // Get company ID from session user
    const companyData = await prisma.company.findUnique({
      where: { admin_user_id: parseInt(session.user.id) },
      select: { id: true }
    });

    if (!companyData) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    const responseData = {
      request_id: requestId,
      services: body.services,
      selected_organismes: body.selected_organismes || [],
      cotisation_summary: body.cotisation_summary || {
        total_patronal: 0,
        total_salarial: 0,
        total_combined: 0
      },
      overall_message: body.overall_message || '',
    };

    const response = await CompanyResponseService.createResponse(
      responseData, 
      companyData.id
    );

    return NextResponse.json(
      { 
        message: 'Response created successfully',
        response: response 
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error creating company response:', error);
    
    if (error instanceof Error && error.message === 'Response already exists for this request') {
      return NextResponse.json(
        { error: error.message },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
