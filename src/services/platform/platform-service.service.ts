import { logger } from '@/lib/logger';
import { prisma } from '@/lib/prisma';

interface NewServiceData {
  service_label: string;
  service_description?: string;
  data_type: 'TEXT' | 'NUMBER' | 'SELECT' | 'RADIO';
  requires_data: boolean;
  data_label?: string;
  data_description?: string;
  choices?: string[];
}

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

      const platformService = await prisma.platformService.create({
        data: {
          user_id: userId,
          label: serviceData.service_label,
          description: serviceData.service_description || '',
          data_type: serviceData.data_type,
          requires_data: serviceData.requires_data,
          data_label: serviceData.data_label || '',
          data_description: serviceData.data_description || '',
          choices: serviceData.choices && serviceData.choices.length > 0 ? serviceData.choices : undefined,
          status: 'PENDING',
        },
      });

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
  static async linkServiceToCompany(companyId: number, serviceId: number, isActive: boolean = false) {
    const logContext = {
      operation: 'linkServiceToCompany',
      companyId,
      serviceId,
      isActive,
    };

    try {
      logger.debug('Linking platform service to company', logContext);

      const companyService = await prisma.companyService.create({
        data: {
          company_id: companyId,
          service_id: serviceId,
          is_active: isActive,
        },
      });

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

      const services = await prisma.companyService.findMany({
        where: {
          is_active: true,
          service: {
            status: 'ACTIVE',
          },
        },
        include: {
          service: true,
          company: true,
        },
      });

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
}
