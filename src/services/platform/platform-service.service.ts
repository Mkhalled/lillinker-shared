import { PlatformDAO } from '@/dao/platform.dao';
import { logger } from '@/lib/logger';
import { NewServiceData } from '@/types/platform';
export class PlatformServiceService {
  /**
   * Create a new platform service
   */
  static async createService(userId: number, serviceData: NewServiceData) {
    const logContext = {
      operation: 'createPlatformService',
      userId,
      serviceLabel: serviceData.service_label,
    };

    try {
      logger.info('Creating new platform service', logContext);

      const platformService = await PlatformDAO.createPlatformService(userId, serviceData);

      logger.info('Platform service created successfully', {
        ...logContext,
        platformServiceId: platformService.id,
        status: platformService.status,
      });

      return platformService;
    } catch (error) {
      logger.error('Platform service creation failed', error as Error, logContext);
      throw error;
    }
  }

  /**
   * Create multiple platform services
   */
  static async createMultipleServices(userId: number, servicesData: NewServiceData[]) {
    const logContext = {
      operation: 'createMultiplePlatformServices',
      userId,
      serviceCount: servicesData.length,
    };

    try {
      logger.info('Creating multiple platform services', logContext);

      const createdServices = [];

      for (const serviceData of servicesData) {
        const service = await this.createService(userId, serviceData);
        createdServices.push(service);
      }

      logger.info('Multiple platform services created successfully', {
        ...logContext,
        createdCount: createdServices.length,
      });

      return createdServices;
    } catch (error) {
      logger.error('Multiple platform services creation failed', error as Error, logContext);
      throw error;
    }
  }

  /**
   * Link platform service to company
   */
  static async linkServiceToCompany(
    companyId: number,
    serviceId: number,
    isActive: boolean = false
  ) {
    const logContext = {
      operation: 'linkServiceToCompany',
      companyId,
      serviceId,
      isActive,
    };

    try {
      logger.debug('Linking platform service to company', logContext);

      const companyService = await PlatformDAO.createCompanyService(companyId, serviceId, isActive);

      logger.info('Platform service linked to company successfully', {
        ...logContext,
        companyServiceId: companyService.id,
      });

      return companyService;
    } catch (error) {
      logger.error('Platform service linking failed', error as Error, logContext);
      throw error;
    }
  }

  /**
   * Get available active services
   */
  static async getAvailableServices() {
    const logContext = {
      operation: 'getAvailableServices',
    };

    try {
      logger.debug('Fetching available services', logContext);

      const services = await PlatformDAO.getActivePlatformServices();

      logger.info('Available services fetched successfully', {
        ...logContext,
        servicesCount: services.length,
      });

      return services;
    } catch (error) {
      logger.error('Failed to fetch available services', error as Error, logContext);
      throw error;
    }
  }
  /**
   * Get available LabelSyndicat
   */
  static async getLabelSyndicats() {
    const logContext = {
      operation: 'getLabelSyndicat',
    };

    try {
      logger.debug('Fetching available LabelSyndicat', logContext);

      const labelSyndicat = await PlatformDAO.getLabelSyndicat();

      logger.info('Available LabelSyndicat fetched successfully', {
        ...logContext,
        labelSyndicatCount: labelSyndicat.length,
      });

      return labelSyndicat;
    } catch (error) {
      logger.error('Failed to fetch available LabelSyndicat', error as Error, logContext);
      throw error;
    }
  }
  /**
   * Get available SecteursActivite
   */
  static async getSecteursActivite() {
    const logContext = {
      operation: 'getSecteursActivite',
    };

    try {
      logger.debug('Fetching available SecteursActivite', logContext);

      const secteurActivite = await PlatformDAO.getSecteurActivite();

      logger.info('Available secteurActivite fetched successfully', {
        ...logContext,
        secteurActiviteCount: secteurActivite.length,
      });

      return secteurActivite;
    } catch (error) {
      logger.error('Failed to fetch available secteurActivite', error as Error, logContext);
      throw error;
    }
  }
}
