import { CompanyDAO } from '@/dao/company.dao';
import { logger } from '@/lib/logger';
import type { CompanyOnboarding } from '@/lib/validations/auth.validation';
import {
  CreateOrganismeRequest,
  UpdateOrganismeRequest,
  CotisationPayload,
} from '@/types/organisme';

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
        management_min: data.management_min ?? 0,
        management_max: data.management_max ?? 0,
        is_portage: data.is_portage || false,
        date_creation: data.date_creation,
        chiffre_affaires: data.chiffre_affaires,
        adresse: data.adresse,
        site_web: data.site_web,
        convention_collective: data.convention_collective,
        code_naf_ape: data.code_naf_ape,
      });

      logger.info('Company record created successfully', {
        ...logContext,
        companyId: company.id,
        consultantCount: data.consultant_count,
        managementFees: {
          min: data.management_min,
          max: data.management_max,
        },
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
   * Link Secteur d'activité to a company
   */
  static async linkMetiers(companyId: number, metierIds: number[]) {
    const logContext = {
      operation: 'linkMetiers',
      companyId,
      metierCount: metierIds.length,
    };

    try {
      logger.debug("Linking secteurs d'activité to company", {
        ...logContext,
        metierIds,
      });

      await CompanyDAO.addCompanyMetiers(companyId, metierIds);

      logger.info("Secteurs d'activité linked successfully", {
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
  static async linkCompanyLabels(companyId: number, portageIds: number[]) {
    const logContext = {
      operation: 'linkCompanyLabels',
      companyId,
      portageCount: portageIds.length,
    };

    try {
      logger.debug('Linking portages to company', {
        ...logContext,
        portageIds,
      });

      await CompanyDAO.addCompanyLabel(companyId, portageIds);

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
  static async getFreelanceRequests(
    page: number = 1,
    pageSize: number = 5,
    sort: string,
    date: string
  ) {
    const logContext = {
      operation: 'getFreelanceRequests',
      page,
      pageSize,
      sort,
      date,
    };

    try {
      logger.info('Fetching freelance requests', logContext);

      const requests = await CompanyDAO.getAllFreelanceRequests(page, pageSize, sort, date);

      return requests;
    } catch (error) {
      logger.error('Fetching freelance requests failed', error as Error, logContext);
      throw error;
    }
  }

  /**
   * Create a new organisme with cotisations for a company
   */
  static async createOrganisme(companyId: number, data: CreateOrganismeRequest) {
    const logContext = {
      operation: 'createOrganisme',
      companyId,
      organismeLabel: data.label,
      cotisationsCount: data.cotisations?.length || 0,
    };

    try {
      logger.info('Creating organisme', logContext);

      const organisme = await CompanyDAO.createOrganisme(companyId, data);

      logger.info('Organisme created successfully', {
        ...logContext,
        organismeId: organisme.id,
      });

      return organisme;
    } catch (error) {
      logger.error('Organisme creation failed', error as Error, logContext);
      throw error;
    }
  }

  /**
   * Get all organismes for a company
   */
  static async getCompanyOrganismes(companyId: number) {
    const logContext = {
      operation: 'getCompanyOrganismes',
      companyId,
    };

    try {
      logger.info('Fetching company organismes', logContext);

      const organismes = await CompanyDAO.getCompanyOrganismes(companyId);

      logger.info('Company organismes fetched successfully', {
        ...logContext,
        count: organismes.length,
      });

      return organismes;
    } catch (error) {
      logger.error('Fetching company organismes failed', error as Error, logContext);
      throw error;
    }
  }

  /**
   * Get a specific organisme by ID
   */
  static async getOrganisme(organismeId: number, companyId: number) {
    const logContext = {
      operation: 'getOrganisme',
      organismeId,
      companyId,
    };

    try {
      logger.info('Fetching organisme', logContext);

      const organisme = await CompanyDAO.getOrganismeById(organismeId, companyId);

      if (!organisme) {
        throw new Error('Organisme not found or access denied');
      }

      logger.info('Organisme fetched successfully', {
        ...logContext,
        organismeLabel: organisme.label,
      });

      return organisme;
    } catch (error) {
      logger.error('Fetching organisme failed', error as Error, logContext);
      throw error;
    }
  }

  /**
   * Update an organisme
   */
  static async updateOrganisme(
    organismeId: number,
    companyId: number,
    data: UpdateOrganismeRequest
  ) {
    const logContext = {
      operation: 'updateOrganisme',
      organismeId,
      companyId,
    };

    try {
      logger.info('Updating organisme', logContext);

      const organisme = await CompanyDAO.updateOrganisme(organismeId, companyId, data);

      logger.info('Organisme updated successfully', {
        ...logContext,
        organismeLabel: organisme.label,
      });

      return organisme;
    } catch (error) {
      logger.error('Organisme update failed', error as Error, logContext);
      throw error;
    }
  }

  /**
   * Delete an organisme
   */
  static async deleteOrganisme(organismeId: number, companyId: number) {
    const logContext = {
      operation: 'deleteOrganisme',
      organismeId,
      companyId,
    };

    try {
      logger.info('Deleting organisme', logContext);

      await CompanyDAO.deleteOrganisme(organismeId, companyId);

      logger.info('Organisme deleted successfully', logContext);
    } catch (error) {
      logger.error('Organisme deletion failed', error as Error, logContext);
      throw error;
    }
  }

  /**
   * Create a new cotisation for an organisme
   */
  static async createCotisation(organismeId: number, companyId: number, data: CotisationPayload) {
    const logContext = {
      operation: 'createCotisation',
      organismeId,
      companyId,
      cotisationLabel: data.label,
    };

    try {
      logger.info('Creating cotisation', logContext);

      // Verify the organisme belongs to the company
      const organisme = await CompanyDAO.getOrganismeById(organismeId, companyId);
      if (!organisme) {
        throw new Error('Organisme not found or access denied');
      }

      const cotisation = await CompanyDAO.createCotisation(organismeId, data);

      logger.info('Cotisation created successfully', {
        ...logContext,
        cotisationId: cotisation.id,
      });

      return cotisation;
    } catch (error) {
      logger.error('Cotisation creation failed', error as Error, logContext);
      throw error;
    }
  }

  /**
   * Update a cotisation
   */
  static async updateCotisation(
    cotisationId: number,
    companyId: number,
    data: Partial<CotisationPayload>
  ) {
    const logContext = {
      operation: 'updateCotisation',
      cotisationId,
      companyId,
    };

    try {
      logger.info('Updating cotisation', logContext);

      const cotisation = await CompanyDAO.updateCotisation(cotisationId, data);

      logger.info('Cotisation updated successfully', {
        ...logContext,
        cotisationLabel: cotisation.label,
      });

      return cotisation;
    } catch (error) {
      logger.error('Cotisation update failed', error as Error, logContext);
      throw error;
    }
  }

  /**
   * Delete a cotisation
   */
  static async deleteCotisation(cotisationId: number, companyId: number) {
    const logContext = {
      operation: 'deleteCotisation',
      cotisationId,
      companyId,
    };

    try {
      logger.info('Deleting cotisation', logContext);

      await CompanyDAO.deleteCotisation(cotisationId);

      logger.info('Cotisation deleted successfully', logContext);
    } catch (error) {
      logger.error('Cotisation deletion failed', error as Error, logContext);
      throw error;
    }
  }

  /**
   * Link all existing organismes from the platform to a new company
   */
  static async linkExistingOrganismesToCompany(companyId: number) {
    const logContext = {
      operation: 'linkExistingOrganismesToCompany',
      companyId,
    };

    try {
      logger.info('Linking existing organismes to company', logContext);

      const linkedOrganismes = await CompanyDAO.linkAllExistingOrganismesToCompany(companyId);

      logger.info('Existing organismes linked successfully', {
        ...logContext,
        linkedOrganismesCount: linkedOrganismes.length,
        totalCotisations: linkedOrganismes.reduce((sum, org) => sum + org.cotisations.length, 0),
      });

      return linkedOrganismes;
    } catch (error) {
      logger.error('Linking existing organismes failed', error as Error, logContext);
      throw error;
    }
  }
}
