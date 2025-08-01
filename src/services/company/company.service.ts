import { CompanyDAO } from '@/dao/company.dao';
import { logger } from '@/lib/logger';
import type { CompanyOnboarding } from '@/lib/validations/auth.validation';

export class CompanyService {
  /**
   * Create a new company record
   */
  static async createCompany(userId: number, data: CompanyOnboarding) {
    const logContext = {
      operation: 'createCompany',
      userId,
      companyName: data.company_name,
      siret: data.siret,
    };

    try {
      logger.info('Creating company record', logContext);

      const company = await CompanyDAO.create({
        admin_user_id: userId,
        name: data.company_name,
        description: data.company_description,
        siret: data.siret,
        consultant_count: data.consultant_count,
        management_fees: data.management_fees,
        is_portage: data.is_portage || false,
      });

      logger.info('Company record created successfully', {
        ...logContext,
        companyId: company.id,
        consultantCount: data.consultant_count,
        managementFees: data.management_fees,
      });

      return company;
    } catch (error) {
      logger.error('Company creation failed', error as Error, logContext);
      throw error;
    }
  }

  /**
   * Link existing platform services to a company
   */
  static async linkPlatformServices(companyId: number, serviceIds: number[]) {
    const logContext = {
      operation: 'linkPlatformServices',
      companyId,
      serviceCount: serviceIds.length,
    };

    try {
      logger.debug('Linking platform services to company', {
        ...logContext,
        serviceIds,
      });

      const companyServices = await Promise.all(
        serviceIds.map(serviceId => CompanyDAO.addCompanyService(companyId, serviceId))
      );

      logger.info('Platform services linked successfully', {
        ...logContext,
        linkedServicesCount: companyServices.length,
      });

      return companyServices;
    } catch (error) {
      logger.error('Platform services linking failed', error as Error, logContext);
      throw error;
    }
  }

  /**
   * Link metiers to a company
   */
  static async linkMetiers(companyId: number, metierIds: number[]) {
    const logContext = {
      operation: 'linkMetiers',
      companyId,
      metierCount: metierIds.length,
    };

    try {
      logger.debug('Linking metiers to company', {
        ...logContext,
        metierIds,
      });

      await CompanyDAO.addCompanyMetiers(companyId, metierIds);

      logger.info('Metiers linked successfully', {
        ...logContext,
        linkedMetiersCount: metierIds.length,
      });

      return true;
    } catch (error) {
      logger.error('Metiers linking failed', error as Error, logContext);
      throw error;
    }
  }

  /**
   * Link portages to a company
   */
  static async linkPortages(companyId: number, portageIds: number[]) {
    const logContext = {
      operation: 'linkPortages',
      companyId,
      portageCount: portageIds.length,
    };

    try {
      logger.debug('Linking portages to company', {
        ...logContext,
        portageIds,
      });

      await CompanyDAO.addCompanyPortages(companyId, portageIds);

      logger.info('Portages linked successfully', {
        ...logContext,
        linkedPortagesCount: portageIds.length,
      });

      return true;
    } catch (error) {
      logger.error('Portages linking failed', error as Error, logContext);
      throw error;
    }
  }
  /**
   * Check if a SIRET already exists in the database
   */
  static async checkSiretExists(siret: string): Promise<boolean> {
    const logContext = {
      operation: 'checkSiretExists',
      siret,
    };

    try {
      logger.debug('Checking if SIRET exists', logContext);

      const existingCompany = await CompanyDAO.findBySiret(siret);
      logger.info('SIRET check completed', {
        ...logContext,
        exists: !!existingCompany,
      });

      return !!existingCompany;
    } catch (error) {
      logger.error('SIRET check failed', error as Error, logContext);
      throw error;
    }
  }
    /**
     * Get freelance requests for company
     */
    static async getFreelanceRequests(page: number, pageSize: number) {
      const logContext = {
        operation: 'getFreelanceRequests',
      };
  
      try {
        logger.info('Fetching freelance requests', logContext);

        const requests = await CompanyDAO.getAllFreelanceRequests(page, pageSize);
  
        return requests;
      } catch (error) {
        logger.error('Fetching freelance requests failed', error as Error, logContext);
        throw error;
      }
    }
}
