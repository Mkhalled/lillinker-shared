import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { prisma } from '@/lib/prisma';
import { CompanyResponseService } from '@/services/company/CompanyResponse.service';

// GET - Get response data for a specific request
export async function GET(
  _request: NextRequest,
  { params }: { params: { requestId: string } }
) {
  try {
    logger.info('Fetching company response data', {
      operation: 'getCompanyResponseData',
      requestId: params.requestId
    });

    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      logger.warn('Unauthorized access attempt', {
        operation: 'getCompanyResponseData',
        requestId: params.requestId
      });
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (session.user.role !== 'COMPANY') {
      logger.warn('Forbidden access attempt by non-company user', {
        operation: 'getCompanyResponseData',
        requestId: params.requestId,
        userRole: session.user.role,
        userId: session.user.id
      });
      return NextResponse.json(
        { error: 'Forbidden: Only companies can access this endpoint' },
        { status: 403 }
      );
    }

    const requestId = parseInt(params.requestId);
    if (isNaN(requestId)) {
      logger.warn('Invalid request ID format', {
        operation: 'getCompanyResponseData',
        requestId: params.requestId,
        userId: session.user.id
      });
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
      logger.warn('Company not found for user', {
        operation: 'getCompanyResponseData',
        requestId: requestId,
        userId: session.user.id
      });
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    logger.info('Company lookup successful', {
      operation: 'getCompanyResponseData',
      requestId: requestId,
      userId: session.user.id,
      companyId: companyData.id
    });

    const responseData = await CompanyResponseService.getResponseData(
      requestId, 
      companyData.id
    );

    if (!responseData) {
      logger.warn('Freelance request not found', {
        operation: 'getCompanyResponseData',
        requestId: requestId,
        companyId: companyData.id,
        userId: session.user.id
      });
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

    logger.info('Company response data fetched successfully', {
      operation: 'getCompanyResponseData',
      requestId: requestId,
      companyId: companyData.id,
      userId: session.user.id,
      hasExistingResponse: existingResponse && existingResponse.length > 0,
      existingResponseCount: existingResponse?.length || 0,
      companyServicesCount: responseData.company_services.length
    });

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
    logger.info('Creating company response', {
      operation: 'createCompanyResponse',
      requestId: params.requestId
    });

    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      logger.warn('Unauthorized response creation attempt', {
        operation: 'createCompanyResponse',
        requestId: params.requestId
      });
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (session.user.role !== 'COMPANY') {
      logger.warn('Forbidden response creation by non-company user', {
        operation: 'createCompanyResponse',
        requestId: params.requestId,
        userRole: session.user.role,
        userId: session.user.id
      });
      return NextResponse.json(
        { error: 'Forbidden: Only companies can create responses' },
        { status: 403 }
      );
    }

    const requestId = parseInt(params.requestId);
    if (isNaN(requestId)) {
      logger.warn('Invalid request ID format in POST', {
        operation: 'createCompanyResponse',
        requestId: params.requestId,
        userId: session.user.id
      });
      return NextResponse.json(
        { error: 'Invalid request ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    
    logger.info('Request body parsed', {
      operation: 'createCompanyResponse',
      requestId: requestId,
      userId: session.user.id,
      servicesCount: Array.isArray(body.services) ? body.services.length : 0,
      selectedOrganismesCount: Array.isArray(body.selected_organismes) ? body.selected_organismes.length : 0,
      availableServicesCount: Array.isArray(body.services) ? body.services.filter((s: { is_available: boolean }) => s.is_available).length : 0
    });
    
    // Validate request body
    if (!body.services || !Array.isArray(body.services)) {
      logger.warn('Invalid request body - missing services array', {
        operation: 'createCompanyResponse',
        requestId: requestId,
        userId: session.user.id
      });
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
      logger.warn('Company not found during response creation', {
        operation: 'createCompanyResponse',
        requestId: requestId,
        userId: session.user.id
      });
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    logger.info('Company validated for response creation', {
      operation: 'createCompanyResponse',
      requestId: requestId,
      userId: session.user.id,
      companyId: companyData.id
    });

    const responseData = {
      request_id: requestId,
      services: body.services,
      selected_organismes: body.selected_organismes || [],
    };

    const response = await CompanyResponseService.createResponse(
      responseData, 
      companyData.id
    );

    logger.info('Company response created successfully', {
      operation: 'createCompanyResponse',
      requestId: requestId,
      userId: session.user.id,
      companyId: companyData.id,
      responseCount: Array.isArray(response) ? response.length : 1,
      servicesResponded: body.services.filter((s: { is_available: boolean }) => s.is_available).length,
      selectedOrganismesCount: body.selected_organismes?.length || 0
    });

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

// PUT - Update existing company response
export async function PUT(
  request: NextRequest,
  { params }: { params: { requestId: string } }
) {
  try {
    logger.info('Updating company response', {
      operation: 'updateCompanyResponse',
      requestId: params.requestId
    });

    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      logger.warn('Unauthorized response update attempt', {
        operation: 'updateCompanyResponse',
        requestId: params.requestId
      });
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (session.user.role !== 'COMPANY') {
      logger.warn('Forbidden response update by non-company user', {
        operation: 'updateCompanyResponse',
        requestId: params.requestId,
        userRole: session.user.role,
        userId: session.user.id
      });
      return NextResponse.json(
        { error: 'Forbidden: Only companies can update responses' },
        { status: 403 }
      );
    }

    const requestId = parseInt(params.requestId);
    if (isNaN(requestId)) {
      logger.warn('Invalid request ID format in PUT', {
        operation: 'updateCompanyResponse',
        requestId: params.requestId,
        userId: session.user.id
      });
      return NextResponse.json(
        { error: 'Invalid request ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    
    logger.info('Request body parsed for update', {
      operation: 'updateCompanyResponse',
      requestId: requestId,
      userId: session.user.id,
      servicesCount: Array.isArray(body.services) ? body.services.length : 0,
      selectedOrganismesCount: Array.isArray(body.selected_organismes) ? body.selected_organismes.length : 0,
      availableServicesCount: Array.isArray(body.services) ? body.services.filter((s: { is_available: boolean }) => s.is_available).length : 0
    });
    
    // Validate request body
    if (!body.services || !Array.isArray(body.services)) {
      logger.warn('Invalid request body - missing services array in PUT', {
        operation: 'updateCompanyResponse',
        requestId: requestId,
        userId: session.user.id
      });
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
      logger.warn('Company not found during response update', {
        operation: 'updateCompanyResponse',
        requestId: requestId,
        userId: session.user.id
      });
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    logger.info('Company validated for response update', {
      operation: 'updateCompanyResponse',
      requestId: requestId,
      userId: session.user.id,
      companyId: companyData.id
    });

    const updateData = {
      request_id: requestId,
      services: body.services,
      selected_organismes: body.selected_organismes || [],
    };

    const response = await CompanyResponseService.updateResponse(
      requestId,
      companyData.id,
      updateData
    );

    logger.info('Company response updated successfully in route', {
      operation: 'updateCompanyResponse',
      requestId: requestId,
      userId: session.user.id,
      companyId: companyData.id,
      responseCount: Array.isArray(response) ? response.length : 1,
      servicesUpdated: body.services.filter((s: { is_available: boolean }) => s.is_available).length,
      selectedOrganismesCount: body.selected_organismes?.length || 0
    });

    return NextResponse.json(
      { 
        message: 'Response updated successfully',
        response: response 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error updating company response:', error);
    
    if (error instanceof Error && error.message === 'Response not found') {
      return NextResponse.json(
        { error: error.message },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete existing company response
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { requestId: string } }
) {
  try {
    logger.info('Deleting company response', {
      operation: 'deleteCompanyResponse',
      requestId: params.requestId
    });

    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      logger.warn('Unauthorized response deletion attempt', {
        operation: 'deleteCompanyResponse',
        requestId: params.requestId
      });
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (session.user.role !== 'COMPANY') {
      logger.warn('Forbidden response deletion by non-company user', {
        operation: 'deleteCompanyResponse',
        requestId: params.requestId,
        userRole: session.user.role,
        userId: session.user.id
      });
      return NextResponse.json(
        { error: 'Forbidden: Only companies can delete responses' },
        { status: 403 }
      );
    }

    const requestId = parseInt(params.requestId);
    if (isNaN(requestId)) {
      logger.warn('Invalid request ID format in DELETE', {
        operation: 'deleteCompanyResponse',
        requestId: params.requestId,
        userId: session.user.id
      });
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
      logger.warn('Company not found during response deletion', {
        operation: 'deleteCompanyResponse',
        requestId: requestId,
        userId: session.user.id
      });
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    logger.info('Company validated for response deletion', {
      operation: 'deleteCompanyResponse',
      requestId: requestId,
      userId: session.user.id,
      companyId: companyData.id
    });

    const response = await CompanyResponseService.deleteResponse(
      requestId,
      companyData.id
    );

    logger.info('Company response deleted successfully', {
      operation: 'deleteCompanyResponse',
      requestId: requestId,
      userId: session.user.id,
      companyId: companyData.id,
      deletedCount: response.count
    });

    return NextResponse.json(
      { 
        message: 'Response deleted successfully',
        deletedCount: response.count
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error deleting company response:', error);
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
