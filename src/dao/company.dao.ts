import { Prisma } from '@prisma/client';

import { prisma } from '@/lib/prisma';
import { CompanyPayload } from '@/types/company';
import {
  CotisationPayload,
  CreateOrganismeRequest,
  UpdateOrganismeRequest,
} from '@/types/organisme';

export class CompanyDAO {
  static async create(data: CompanyPayload) {
    return prisma.company.create({
      data,
    });
  }

  static async findByUserId(id: number) {
    return prisma.company.findUnique({
      where: { admin_user_id: id },
      include: {
        labels: {
          include: {
            labelSyndicat: true,
          },
        },
      },
    });
  }

  static async findBySiret(siret: string) {
    return prisma.company.findUnique({
      where: {
        siret: siret.trim(),
      },
    });
  }

  static async update(id: number, data: Prisma.CompanyUpdateInput) {
    return prisma.company.update({
      where: { id: id },
      data,
    });
  }

  static async delete(id: number) {
    return prisma.company.delete({
      where: { id: id },
    });
  }
  static async addCompanyService(companyId: number, serviceId: number) {
    return prisma.companyService.create({
      data: {
        company_id: companyId,
        service_id: serviceId,
        is_active: true,
      },
    });
  }
  static async addCompanyMetiers(
    companyId: number,
    metiers: number[]
  ) {
    return prisma.secteurActiviteCompany.createMany({
      data: metiers.map(metier => ({
        company_id: companyId,
        secteur_activite_id: metier,
      })),
    });
  }
  static async addCompanyLabel(companyId: number, portageIds: number[]) {
    // Use transaction to ensure atomicity - delete old labels and add new ones
    return prisma.$transaction(async (tx) => {
      // Delete existing labels first
      await tx.companyLabel.deleteMany({
        where: { company_id: companyId },
      });
      
      // Add new labels if any
      if (portageIds.length > 0) {
        await tx.companyLabel.createMany({
          data: portageIds.map(portageId => ({
            company_id: companyId,
            label_syndicat_id: portageId,
          })),
        });
      }
    });
  }

  static async deleteCompanyLabels(companyId: number) {
    return prisma.companyLabel.deleteMany({
      where: { company_id: companyId },
    });
  }

  static async replaceCompanyLabels(companyId: number, portageIds: number[]) {
    // Use transaction to ensure atomicity
    return prisma.$transaction(async (tx) => {
      // Delete existing labels
      await tx.companyLabel.deleteMany({
        where: { company_id: companyId },
      });
      
      // Add new labels if any
      if (portageIds.length > 0) {
        await tx.companyLabel.createMany({
          data: portageIds.map(portageId => ({
            company_id: companyId,
            label_syndicat_id: portageId,
          })),
        });
      }
    });
  }
  static async getAllFreelanceRequests(
    page: number = 1,
    pageSize: number = 5,
    sort: string = 'newest',
    date: string = ''
  ) {
    const skip = (page - 1) * pageSize;
    const whereClause = date
      ? {
          created_at: {
            gte: new Date(date + 'T00:00:00.000Z'),
            lt: new Date(date + 'T23:59:59.999Z'),
          },
        }
      : {};

    const [data, total] = await Promise.all([
      prisma.freelanceRequest.findMany({
        skip,
        take: pageSize,
        orderBy: { created_at: sort === 'newest' ? 'desc' : 'asc' },
        where: whereClause,
        include: {
          freelance: true,
          options: {
            include: {
              platformService: true,
            },
          },
          responses: true,
          requestLabelsSelected: {
            include: {
              labelSyndicat: true,
            },
          },
        },
      }),
      prisma.freelanceRequest.count({
        where: whereClause,
      }),
    ]);
    return {
      data,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  // Organisme methods
  static async createOrganisme(companyId: number, data: CreateOrganismeRequest) {
    // Validate that at least one cotisation is provided
    if (!data.cotisations || data.cotisations.length === 0) {
      throw new Error('At least one cotisation is required to create an organisme');
    }

    return prisma.organisme.create({
      data: {
        company_id: companyId,
        label: data.label,
        description: data.description,
        cotisations: {
          create: data.cotisations.map(cotisation => ({
            label: cotisation.label,
            description: cotisation.description,
            type: cotisation.type,
            pourcentage_salarial: cotisation.pourcentage_salarial,
            pourcentage_patronal: cotisation.pourcentage_patronal,
          })),
        },
      },
      include: {
        cotisations: true,
      },
    });
  }

  static async getCompanyOrganismes(companyId: number) {
    return prisma.organisme.findMany({
      where: {
        company_id: companyId,
      },
      include: {
        cotisations: true,
      },
      orderBy: {
        id: 'asc',
      },
    });
  }

  static async getOrganismeById(id: number, companyId: number) {
    return prisma.organisme.findFirst({
      where: {
        id: id,
        company_id: companyId,
      },
      include: {
        cotisations: true,
      },
    });
  }

  static async updateOrganisme(id: number, companyId: number, data: UpdateOrganismeRequest) {
    // If cotisations are being updated, validate that at least one exists
    if (data.cotisations !== undefined && data.cotisations.length === 0) {
      throw new Error('At least one cotisation is required for an organisme');
    }

    // First, delete existing cotisations if new ones are provided
    if (data.cotisations) {
      await prisma.cotisation.deleteMany({
        where: {
          organisme_id: id,
        },
      });
    }

    return prisma.organisme.update({
      where: {
        id: id,
        company_id: companyId,
      },
      data: {
        ...(data.label && { label: data.label }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.cotisations && {
          cotisations: {
            create: data.cotisations.map(cotisation => ({
              label: cotisation.label,
              description: cotisation.description,
              type: cotisation.type,
              pourcentage_salarial: cotisation.pourcentage_salarial,
              pourcentage_patronal: cotisation.pourcentage_patronal,
            })),
          },
        }),
      },
      include: {
        cotisations: true,
      },
    });
  }

  static async deleteOrganisme(id: number, companyId: number) {
    // Delete cotisations first (cascade delete)
    await prisma.cotisation.deleteMany({
      where: {
        organisme_id: id,
      },
    });

    return prisma.organisme.delete({
      where: {
        id: id,
        company_id: companyId,
      },
    });
  }

  // Cotisation methods
  static async createCotisation(organismeId: number, data: CotisationPayload) {
    return prisma.cotisation.create({
      data: {
        organisme_id: organismeId,
        label: data.label,
        description: data.description,
        type: data.type,
        pourcentage_salarial: data.pourcentage_salarial,
        pourcentage_patronal: data.pourcentage_patronal,
      },
    });
  }

  static async updateCotisation(id: number, data: Partial<CotisationPayload>) {
    return prisma.cotisation.update({
      where: {
        id: id,
      },
      data: {
        ...(data.label && { label: data.label }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.type && { type: data.type }),
        ...(data.pourcentage_salarial !== undefined && {
          pourcentage_salarial: data.pourcentage_salarial,
        }),
        ...(data.pourcentage_patronal !== undefined && {
          pourcentage_patronal: data.pourcentage_patronal,
        }),
      },
    });
  }

  static async deleteCotisation(id: number) {
    return prisma.cotisation.delete({
      where: {
        id: id,
      },
    });
  }

  static async getCotisationsByOrganisme(organismeId: number) {
    return prisma.cotisation.findMany({
      where: {
        organisme_id: organismeId,
      },
      orderBy: {
        id: 'asc',
      },
    });
  }

  // Link existing organismes to company
  static async linkAllExistingOrganismesToCompany(companyId: number) {
    // Get all existing organismes from other companies (excluding current company)
    const existingOrganismes = await prisma.organisme.findMany({
      where: {
        company_id: {
          not: companyId,
        },
      },
      include: {
        cotisations: true,
      },
    });

    // Create copies of all existing organismes for this company
    const organismePromises = existingOrganismes.map(async (originalOrganisme) => {
      return prisma.organisme.create({
        data: {
          company_id: companyId,
          label: originalOrganisme.label,
          description: originalOrganisme.description,
          cotisations: {
            create: originalOrganisme.cotisations.map(cotisation => ({
              label: cotisation.label,
              description: cotisation.description,
              type: cotisation.type,
              pourcentage_salarial: cotisation.pourcentage_salarial,
              pourcentage_patronal: cotisation.pourcentage_patronal,
            })),
          },
        },
        include: {
          cotisations: true,
        },
      });
    });

    return Promise.all(organismePromises);
  }
}
