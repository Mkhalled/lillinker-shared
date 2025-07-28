import { FreelanceDao } from '@/dao/freelance.dao';
import { logger } from '@/lib/logger';
import { prisma } from '@/lib/prisma';
import type { FreelanceOnboarding } from '@/lib/validations/auth.validation';

interface SelectedServiceData {
  serviceId: number;
  isRequired: boolean;
  responseData?: string;
}

export class FreelanceService {
  /**
   * Create freelance profile
   */
  static async createFreelanceProfile(userId: number, metierId: number) {
    const logContext = {
      operation: 'createFreelanceProfile',
      userId,
      metierId,
    };

    try {
      logger.info('Creating freelance profile', logContext);

      const freelance = await FreelanceDao.createFreelanceProfile(userId, metierId);

      logger.info('Freelance profile created successfully', {
        ...logContext,
        freelanceId: freelance.id,
      });

      return freelance;
    } catch (error) {
      logger.error('Freelance profile creation failed', error as Error, logContext);
      throw error;
    }
  }

  /**
   * Create freelance request
   */
  static async createFreelanceRequest(freelanceId: number, data: FreelanceOnboarding) {
    const logContext = {
      operation: 'createFreelanceRequest',
      freelanceId,
      missionStatus: data.mission_status,
    };

    try {
      logger.info('Creating freelance request', logContext);

      const freelanceRequest = await FreelanceDao.createFreelanceRequest(freelanceId, {
          mission_status: data.mission_status,
          client_name: data.client_name,
          client_address: data.client_address,
          client_sector: data.client_sector,
          priority: data.priority,
          tjm: data.tjm,
          days: data.days,
          wants_portage: data.wants_portage || false
      });

      logger.info('Freelance request created successfully', {
        ...logContext,
        freelanceRequestId: freelanceRequest.id,
        priority: data.priority,
        clientName: data.client_name,
      });

      return freelanceRequest;
    } catch (error) {
      logger.error('Freelance request creation failed', error as Error, logContext);
      throw error;
    }
  }

  /**
   * Create freelance request options (service selections)
   */
  static async createRequestOptions(
    freelanceRequestId: number,
    selectedServices: SelectedServiceData[]
  ) {
    const logContext = {
      operation: 'createRequestOptions',
      freelanceRequestId,
      serviceCount: selectedServices.length,
    };

    try {
      logger.debug('Creating freelance request options', logContext);

      const requestOptions = await Promise.all(
        selectedServices.map(async selectedService => {
          // Verify that the platform service exists
          const platformService = await prisma.platformService.findUnique({
            where: { id: selectedService.serviceId },
          });

          if (platformService) {
            // Convert responseData string to appropriate JSON structure based on data_type
            const responseDataJson = this.convertResponseData(
              selectedService.responseData,
              platformService.data_type
            );

            // Create freelance request option with direct reference to platform service
            const option = await FreelanceDao.createFreelanceRequestOption(
              freelanceRequestId,
              selectedService.serviceId,
              selectedService.isRequired,
              responseDataJson
            );

            logger.debug('Freelance request option created', {
              ...logContext,
              serviceId: selectedService.serviceId,
              platformServiceLabel: platformService.label,
              dataType: platformService.data_type,
              isRequired: selectedService.isRequired,
            });

            return option;
          } else {
            logger.warn('Platform service not found', {
              ...logContext,
              serviceId: selectedService.serviceId,
            });
            return null;
          }
        })
      );

      // Filter out null values
      const validRequestOptions = requestOptions.filter(option => option !== null);

      logger.info('Freelance request options created successfully', {
        ...logContext,
        totalRequested: selectedServices.length,
        successfullyCreated: validRequestOptions.length,
        skipped: selectedServices.length - validRequestOptions.length,
      });

      return validRequestOptions;
    } catch (error) {
      logger.error('Freelance request options creation failed', error as Error, logContext);
      throw error;
    }
  }

  /**
   * Link portage preferences to freelance request
   */
  static async linkPortagePreferences(freelanceRequestId: number, portageIds: number[]) {
    const logContext = {
      operation: 'linkPortagePreferences',
      freelanceRequestId,
      portageCount: portageIds.length,
    };

    try {
      logger.debug('Linking portage preferences to freelance request', {
        ...logContext,
        portageIds,
      });

      await FreelanceDao.createFreelanceRequestPortages(freelanceRequestId, portageIds);

      logger.info('Portage preferences linked successfully', {
        ...logContext,
        linkedPortagesCount: portageIds.length,
      });

      return true;
    } catch (error) {
      logger.error('Portage preferences linking failed', error as Error, logContext);
      throw error;
    }
  }

  /**
   * Convert response data based on platform service data type
   */
  private static convertResponseData(responseData: string | undefined, dataType: string) {
    if (!responseData || responseData.trim() === '') {
      return undefined;
    }

    switch (dataType) {
      case 'TEXT':
        return { text: responseData };
      case 'NUMBER':
        return { number: responseData };
      case 'SELECT': {
        // For SELECT type, responseData comes as comma-separated values
        const selections = responseData
          .split(',')
          .map(s => s.trim())
          .filter(s => s !== '');
        return { select: selections };
      }
      case 'RADIO':
        return { radio: responseData };
      default:
        return { value: responseData };
    }
  }
}
