import { Prisma } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';

import { FreelanceDao } from '@/dao/freelance.dao';
import { authOptions } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { prisma } from '@/lib/prisma';
import { FreelanceService } from '@/services';

type JsonValue = Prisma.JsonValue;

export async function POST(request: NextRequest) {
  const logContext = {
    operation: 'nouvelle_demande',
    method: 'POST',
    path: '/api/freelance/nouvelle-demande',
  };

  try {
    logger.info('Nouvelle demande API endpoint called', logContext);

    // Get session instead of userId from body
    const session = await getServerSession(authOptions);

    if (!session || !session.user || session.user.role !== 'FREELANCE') {
      logger.warn('Unauthorized nouvelle demande attempt', logContext);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    const enhancedLogContext = {
      ...logContext,
      userId: session.user.id,
      tjm: body.tjm,
      days: body.days,
      priority: body.priority,
      missionStatus: body.mission_status,
    };

    logger.debug('Nouvelle demande request received', enhancedLogContext);

    // Use a transaction to ensure data consistency
    const result = await prisma.$transaction(async () => {
      // Step 1: Find existing freelance profile
      const freelance = await FreelanceDao.findByFreelanceId(Number(session.user.id));

      if (!freelance) {
        logger.error('Freelance profile not found', {
          ...enhancedLogContext,
          userId: session.user.id,
        });
        throw new Error('Freelance profile not found. Please complete your profile first.');
      }

      logger.info('Freelance profile found successfully', {
        ...enhancedLogContext,
        freelanceId: freelance.id,
      });

      // Step 2: Create freelance request
      const requestData = {
        mission_status: body.mission_status,
        priority: body.priority,
        tjm: body.tjm,
        days: body.days,
        wants_portage: body.wants_portage || false,
        want_salaried: body.want_salaried || false,
        // Only include optional fields if they have values
        ...(body.client_name && { client_name: body.client_name }),
        ...(body.client_address && { client_address: body.client_address }),
        ...(body.client_sector && { client_sector: body.client_sector }),
        ...(body.salary !== undefined && body.salary !== null && { salary: body.salary }),
        ...(body.start_date && { start_date: body.start_date }),
      };

      const freelanceRequest = await FreelanceService.createFreelanceRequest(
        freelance.id,
        requestData
      );

      logger.info('Freelance request created successfully', {
        ...enhancedLogContext,
        freelanceRequestId: freelanceRequest.id,
      });

      // Step 3: Create request options for selected services
      let requestOptions: Array<{
        id: number;
        freelance_request_id: number;
        service_option_id: number;
        is_required: boolean;
        response_data: JsonValue;
      }> = [];
      if (body.selected_services && body.selected_services.length > 0) {
        requestOptions = await FreelanceService.createRequestOptions(
          freelanceRequest.id,
          body.selected_services
        );
      }

      // Step 4: Link portage preferences if provided
      if (body.selected_portages && body.selected_portages.length > 0) {
        await FreelanceService.linkPortagePreferences(freelanceRequest.id, body.selected_portages);
      }

      return {
        freelance,
        freelanceRequest,
        requestOptions,
      };
    });

    logger.info('Nouvelle demande API completed successfully', {
      ...enhancedLogContext,
      freelanceId: result.freelance.id,
      freelanceRequestId: result.freelanceRequest.id,
      requestOptionsCreated: result.requestOptions.length,
    });

    return NextResponse.json({
      success: true,
      message: 'Nouvelle demande créée avec succès',
      data: result,
    });
  } catch (error) {
    logger.error('Nouvelle demande API failed', error as Error, logContext);

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
