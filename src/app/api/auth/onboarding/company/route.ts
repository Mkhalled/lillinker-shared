import { NextRequest, NextResponse } from 'next/server';

import { logger } from '@/lib/logger';
import { prisma } from '@/lib/prisma';
import { CompanyOnboardingSchema } from '@/lib/validations/auth.validation';
import { CompanyService, PlatformServiceService } from '@/services';

export async function POST(request: NextRequest) {
  const logContext = {
    operation: 'company_onboarding',
    method: 'POST',
    path: '/api/auth/onboarding/company',
  };

  try {
    logger.info('Company onboarding API endpoint called', logContext);

    const body = await request.json();
    const { userId, ...onboardingData } = body;

    const enhancedLogContext = {
      ...logContext,
      userId,
      companyName: onboardingData.company_name,
      siret: onboardingData.siret,
    };

    logger.debug('Company onboarding request received', enhancedLogContext);

    if (!userId) {
      logger.warn('Company onboarding attempt without user ID', logContext);
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const validatedData = CompanyOnboardingSchema.parse(onboardingData);

    logger.debug('Company onboarding data validated successfully', {
      ...enhancedLogContext,
      hasSelectedServices: !!validatedData.selected_services?.length,
      hasNewServices: !!validatedData.new_services?.length,
      hasLegacyNewService: !!validatedData.service_label,
      consultantCount: validatedData.consultant_count,
    });

    // Use a transaction to ensure data consistency
    const result = await prisma.$transaction(async () => {
      // Check if SIRET already exists to prevent duplicate creation
      const existingCompany = await prisma.company.findUnique({
        where: { siret: validatedData.siret },
      });

      if (existingCompany) {
        throw new Error('Une société avec ce numéro SIRET existe déjà');
      }

      // Step 1: Create company using the new CompanyService
      const company = await CompanyService.createCompany(parseInt(userId), validatedData);

      logger.info('Company created successfully', {
        ...enhancedLogContext,
        companyId: company.id,
      });

      // Step 2: Handle platform services (new services creation)
      const createdServices = [];
      if (validatedData.new_services && validatedData.new_services.length > 0) {
        for (const newService of validatedData.new_services) {
          const service = await PlatformServiceService.createService(parseInt(userId), newService);
          createdServices.push(service);
        }
      }

      // Handle legacy single service creation for backward compatibility
      if (validatedData.service_label && !validatedData.new_services?.length) {
        const legacyService = await PlatformServiceService.createService(parseInt(userId), {
          service_label: validatedData.service_label,
          service_description: validatedData.service_description,
          data_type: validatedData.data_type!,
          requires_data: validatedData.requires_data!,
          data_label: validatedData.data_label,
          data_description: validatedData.data_description,
          choices: validatedData.choices,
        });
        createdServices.push(legacyService);
      }

      // Step 3: Link selected and created services to company
      const allServiceIds = [
        ...(validatedData.selected_services || []),
        ...createdServices.map(s => s.id),
      ];

      let companyServices: Array<{
        id: number;
        company_id: number;
        service_id: number;
        is_active: boolean;
      }> = [];
      if (allServiceIds.length > 0) {
        companyServices = await CompanyService.linkPlatformServices(company.id, allServiceIds);
      }

      // Step 4: Link metiers to company
      if (validatedData.selected_metiers && validatedData.selected_metiers.length > 0) {
        await CompanyService.linkMetiers(company.id, validatedData.selected_metiers);
      }

      // Step 5: Link portages if company is a portage company
      if (
        validatedData.is_portage &&
        validatedData.selected_portages &&
        validatedData.selected_portages.length > 0
      ) {
        await CompanyService.linkPortages(company.id, validatedData.selected_portages);
      }

      return {
        company,
        companyServices,
        platformServices: createdServices,
      };
    });

    logger.info('Company onboarding completed, starting finalization', enhancedLogContext);

    logger.info('Company onboarding API completed successfully', {
      ...enhancedLogContext,
      companyId: result.company.id,
      servicesLinked: result.companyServices.length,
      newServicesCreated: result.platformServices.length,
    });

    return NextResponse.json({
      success: true,
      message: 'Company onboarding completed successfully',
      data: result,
    });
  } catch (error) {
    logger.error('Company onboarding API failed', error as Error, logContext);

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
