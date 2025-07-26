import { logger } from '@/lib/logger';
import type {
  CompanyOnboarding,
  FreelanceOnboarding,
  InitialRegistration,
} from '@/lib/validations/auth.validation';
import { AuthService } from '@/services/auth/auth.service';
import { CompanyService } from '@/services/company/company.service';
import { FreelanceService } from '@/services/freelance/freelance.service';
import { PlatformServiceService } from '@/services/platform/platform-service.service';

export class OnboardingService {
  /**
   * Complete company registration flow
   */
  static async registerCompany(
    registrationData: InitialRegistration,
    onboardingData: CompanyOnboarding
  ) {
    const logContext = {
      operation: 'registerCompany',
      email: registrationData.email,
      companyName: onboardingData.company_name,
    };

    try {
      logger.info('Starting company registration', logContext);

      // Step 1: Create user account
      const result = await AuthService.createUser(registrationData);
      const user = result.user;

      // Step 2: Send verification email
      await AuthService.sendVerificationEmail(user.id);

      // Step 3: Create company
      const company = await CompanyService.createCompany(user.id, onboardingData);

      // Step 4: Handle service selections and create new services
      await this.handleCompanyServices(
        user.id, // Pass userId for service creation
        company.id,
        onboardingData.selected_services || [],
        onboardingData.new_services || []
      );

      // Step 5: Link metiers
      if (onboardingData.selected_metiers && onboardingData.selected_metiers.length > 0) {
        await CompanyService.linkMetiers(company.id, onboardingData.selected_metiers);
      }

      // Step 6: Link portages if provided
      if (onboardingData.selected_portages && onboardingData.selected_portages.length > 0) {
        await CompanyService.linkPortages(company.id, onboardingData.selected_portages);
      }

      logger.info('Company registration completed successfully', {
        ...logContext,
        userId: user.id,
        companyId: company.id,
      });

      return {
        user,
        company,
        message: 'Company registered successfully. Please check your email to verify your account.',
      };
    } catch (error) {
      logger.error('Company registration failed', error as Error, logContext);
      throw error;
    }
  }

  /**
   * Complete freelance registration flow
   */
  static async registerFreelance(
    registrationData: InitialRegistration,
    onboardingData: FreelanceOnboarding
  ) {
    const logContext = {
      operation: 'registerFreelance',
      email: registrationData.email,
      missionStatus: onboardingData.mission_status,
    };

    try {
      logger.info('Starting freelance registration', logContext);

      // Step 1: Create user account
      const result = await AuthService.createUser(registrationData);
      const user = result.user;

      // Step 2: Send verification email
      await AuthService.sendVerificationEmail(user.id);

      // Step 3: Create freelance profile
      const freelance = await FreelanceService.createFreelanceProfile(
        user.id,
        onboardingData.metier_id
      );

      // Step 4: Create freelance request
      const freelanceRequest = await FreelanceService.createFreelanceRequest(
        freelance.id,
        onboardingData
      );

      // Step 5: Handle service selections
      const serviceOptions = await this.handleFreelanceServices(
        onboardingData.selected_services || []
      );

      // Step 6: Create request options for all services
      if (serviceOptions.length > 0) {
        await FreelanceService.createRequestOptions(freelanceRequest.id, serviceOptions);
      }

      // Step 7: Link portage preferences if provided
      if (onboardingData.selected_portages && onboardingData.selected_portages.length > 0) {
        await FreelanceService.linkPortagePreferences(
          freelanceRequest.id,
          onboardingData.selected_portages
        );
      }

      logger.info('Freelance registration completed successfully', {
        ...logContext,
        userId: user.id,
        freelanceId: freelance.id,
        freelanceRequestId: freelanceRequest.id,
      });

      return {
        user,
        freelance,
        freelanceRequest,
        message:
          'Freelance registered successfully. Please check your email to verify your account.',
      };
    } catch (error) {
      logger.error('Freelance registration failed', error as Error, logContext);
      throw error;
    }
  }

  /**
   * Handle company service selections and new service creation
   */
  private static async handleCompanyServices(
    userId: number,
    companyId: number,
    selectedServices: number[],
    newServices: Array<{
      service_label: string;
      service_description?: string;
      data_type: 'TEXT' | 'NUMBER' | 'SELECT' | 'RADIO';
      requires_data: boolean;
      data_label?: string;
      data_description?: string;
      choices?: string[];
    }>
  ) {
    const logContext = {
      operation: 'handleCompanyServices',
      userId,
      companyId,
      selectedServicesCount: selectedServices.length,
      newServicesCount: newServices.length,
    };

    try {
      // Create new services first
      const createdServices = await Promise.all(
        newServices.map(async newService => {
          const service = await PlatformServiceService.createService(userId, newService);
          return service.id;
        })
      );

      // Combine selected services with created services
      const allServiceIds = [...selectedServices, ...createdServices];

      // Link all services to company
      if (allServiceIds.length > 0) {
        await CompanyService.linkPlatformServices(companyId, allServiceIds);
      }

      logger.debug('Company services handled successfully', {
        ...logContext,
        totalServices: allServiceIds.length,
        createdServicesCount: createdServices.length,
      });

      return allServiceIds;
    } catch (error) {
      logger.error('Company services handling failed', error as Error, logContext);
      throw error;
    }
  }

  /**
   * Handle freelance service selections
   */
  private static async handleFreelanceServices(
    selectedServices: Array<{
      serviceId: number;
      isRequired: boolean;
      responseData?: string;
    }>
  ) {
    const logContext = {
      operation: 'handleFreelanceServices',
      selectedServicesCount: selectedServices.length,
    };

    try {
      logger.debug('Freelance services handled successfully', {
        ...logContext,
        totalServices: selectedServices.length,
      });

      return selectedServices;
    } catch (error) {
      logger.error('Freelance services handling failed', error as Error, logContext);
      throw error;
    }
  }
}
