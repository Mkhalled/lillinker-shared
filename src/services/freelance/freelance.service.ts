import { FreelanceDao } from '@/dao/freelance.dao';
import { calculateFraisKilometriquesAmount } from '@/lib/frais-kilometriques';
import { logger } from '@/lib/logger';
import { prisma } from '@/lib/prisma';
import { generateFieldKeyFromField } from '@/lib/utils';
import type { FreelanceOnboarding } from '@/lib/validations/auth.validation';
import type { SelectedService } from '@/types/user';

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
        wants_portage: data.wants_portage || false,
        want_salaried: data.want_salaried || false,
        salary: data.salary,
        start_date: data.start_date,
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
    selectedServices: SelectedService[]
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
            include: { dataFields: true },
          });

          if (platformService) {
            // Handle frais kilométriques calculation on the server side
            let processedSelectedService = selectedService;
            if (platformService.label === 'Frais kilométriques' && selectedService.responseData) {
              processedSelectedService = await this.calculateFraisKilometriques(selectedService, platformService);
            }

            // Convert responseData object to appropriate JSON structure based on dataFields
            const responseDataJson = this.convertResponseData(
              processedSelectedService.responseData,
              platformService.dataFields
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
              dataFieldsCount: platformService.dataFields.length,
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
   * Link selected labels to freelance request
   */
  static async linkLabelsSelected(freelanceRequestId: number, portageIds: number[]) {
    const logContext = {
      operation: 'linkLabelSelected',
      freelanceRequestId,
      portageCount: portageIds.length,
    };

    try {
      logger.debug('Linking portage preferences to freelance request', {
        ...logContext,
        portageIds,
      });

      await FreelanceDao.createFreelanceRequestLabelSelected(freelanceRequestId, portageIds);

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
   * Convert response data based on platform service data fields
   */
  private static convertResponseData(
    responseData: Record<number, string> | undefined,
    dataFields: Array<{ id: number; data_type: string; label: string }>
  ): Record<string, string | string[]> | undefined {
    if (!responseData || Object.keys(responseData).length === 0) {
      return undefined;
    }

    const convertedData: Record<string, string | string[]> = {};

    dataFields.forEach(field => {
      const fieldResponse = responseData[field.id];
      if (fieldResponse && fieldResponse.trim() !== '') {
        // Use the utility function to generate consistent field keys
        const fieldKey = generateFieldKeyFromField(field);

        switch (field.data_type) {
          case 'TEXT':
            convertedData[fieldKey] = fieldResponse;
            break;
          case 'NUMBER':
            convertedData[fieldKey] = fieldResponse;
            break;
          case 'SELECT': {
            // For SELECT type, responseData comes as comma-separated values
            const selections = fieldResponse
              .split(',')
              .map(s => s.trim())
              .filter(s => s !== '');
            convertedData[fieldKey] = selections;
            break;
          }
          case 'RADIO':
            convertedData[fieldKey] = fieldResponse;
            break;
          default:
            convertedData[fieldKey] = fieldResponse;
        }
      }
    });

    return convertedData;
  }

  /**
   * Calculate frais kilométriques amount for the given selected service
   */
  private static async calculateFraisKilometriques(
    selectedService: SelectedService,
    platformService: { dataFields: Array<{ id: number; label: string }> }
  ): Promise<SelectedService> {
    const logContext = {
      operation: 'calculateFraisKilometriques',
      serviceId: selectedService.serviceId,
    };

    try {
      const responseData = selectedService.responseData || {};

      // Find the relevant data fields
      const puissanceFiscaleField = platformService.dataFields.find(
        field => field.label === 'Puissance fiscale du véhicule'
      );
      const distanceField = platformService.dataFields.find(field => field.label === 'Distance parcourue');
      const typeVehiculeField = platformService.dataFields.find(field => field.label === 'Type de véhicule');
      const montantCalculeField = platformService.dataFields.find(field => field.label === 'Montant calculé');

      if (!puissanceFiscaleField || !distanceField || !typeVehiculeField || !montantCalculeField) {
        logger.warn('Missing required fields for frais kilométriques calculation', {
          ...logContext,
          hasProduktFields: {
            puissanceFiscale: !!puissanceFiscaleField,
            distance: !!distanceField,
            typeVehicule: !!typeVehiculeField,
            montantCalcule: !!montantCalculeField,
          },
        });
        return selectedService;
      }

      const puissanceFiscale = responseData[puissanceFiscaleField.id];
      const distance = responseData[distanceField.id];
      const typeVehicule = responseData[typeVehiculeField.id];

      // Calculate if all required fields are filled
      if (puissanceFiscale && distance && typeVehicule) {
        const calculatedAmount = await calculateFraisKilometriquesAmount(puissanceFiscale, distance, typeVehicule);

        logger.info('Frais kilométriques calculated successfully', {
          ...logContext,
          inputs: { puissanceFiscale, distance, typeVehicule },
          calculatedAmount,
        });

        // Create a new selectedService object with the calculated amount
        return {
          ...selectedService,
          responseData: {
            ...responseData,
            [montantCalculeField.id]: calculatedAmount.toString(),
          },
        };
      } else {
        logger.debug('Insufficient data for frais kilométriques calculation', {
          ...logContext,
          receivedData: {
            puissanceFiscale: puissanceFiscale ? 'present' : 'missing',
            distance: distance ? 'present' : 'missing',
            typeVehicule: typeVehicule ? 'present' : 'missing',
          },
        });
      }

      return selectedService;
    } catch (error) {
      logger.error('Frais kilométriques calculation failed', error as Error, logContext);
      return selectedService;
    }
  }

  /**
   * Get freelance requests by freelance ID
   */
  static async getFreelanceRequestsByFreelanceId(
    freelanceId: number,
    page: number = 1,
    pageSize: number = 10
  ) {
    const logContext = {
      operation: 'getFreelanceRequestsByFreelanceId',
      freelanceId,
      page,
      pageSize,
    };

    try {
      logger.info('Fetching freelance requests', logContext);

      const requests = await FreelanceDao.getFreelanceRequestsByUserId(freelanceId, page, pageSize);

      logger.info('Freelance requests fetched successfully', {
        ...logContext,
      });

      return requests;
    } catch (error) {
      logger.error('Fetching freelance requests failed', error as Error, logContext);
      throw error;
    }
  }

  /**
   * Get freelance request by request ID
   */
  static async getFreelanceRequestByRequestId(requestId: number) {
    const logContext = {
      operation: 'getFreelanceRequestByRequestId',
      requestId,
    };

    try {
      logger.info('Fetching freelance request', logContext);

      const request = await FreelanceDao.getFreelanceRequestDetails(requestId);

      logger.info('Freelance request fetched successfully', {
        ...logContext,
      });

      return request;
    } catch (error) {
      logger.error('Fetching freelance request failed', error as Error, logContext);
      throw error;
    }
  }
}
