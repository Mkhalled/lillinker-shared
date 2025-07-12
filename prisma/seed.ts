import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

import { logger } from '../src/lib/logger';

const prisma = new PrismaClient();

// Constants for better maintainability
const DEFAULT_PASSWORD = 'Admin123!';
const HASH_ROUNDS = 10;

// TypeScript interfaces for better type safety
interface UserCreateData {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  role: 'ADMIN' | 'COMPANY' | 'FREELANCE' | 'MANAGER';
  status: boolean;
}

interface CompanyCreateData {
  admin_user_id: number;
  name: string;
  description: string;
  logo: string;
  siret: number;
  consultant_count: number;
  management_fees: number;
}

/**
 * Helper function for creating users with consistent password hashing
 * @param userData - User data without password (password will be auto-generated)
 * @returns Promise resolving to created user
 */
async function createUser(userData: Omit<UserCreateData, 'password'>): Promise<any> {
  return prisma.user.create({
    data: {
      ...userData,
      password: await hash(DEFAULT_PASSWORD, HASH_ROUNDS),
    },
  });
}

/**
 * Helper function for creating companies
 * @param companyData - Complete company data
 * @returns Promise resolving to created company
 */
async function createCompany(companyData: CompanyCreateData) {
  return prisma.company.create({
    data: companyData,
  });
}

/**
 * Script de données de test pour la plateforme Lillinker
 *
 * Ce script crée les données initiales pour la plateforme incluant :
 * - Utilisateurs administrateurs
 * - Sociétés de portage salarial avec leurs administrateurs
 * - Freelances et consultants
 * - Services de la plateforme (taux de gestion, délais, services inclus)
 * - Demandes de simulation et réponses
 *
 * Note: Tous les mots de passe sont définis à 'Admin123!' pour le développement
 */

async function main(): Promise<void> {
  try {
    logger.info('Starting database seeding...');

    // Clean up existing data in correct order (respecting foreign key constraints)
    await prisma.companyResponse.deleteMany();
    await prisma.freelanceRequestOption.deleteMany();
    await prisma.freelanceRequest.deleteMany();
    await prisma.companyService.deleteMany();
    await prisma.platformService.deleteMany();
    await prisma.companyManager.deleteMany();
    await prisma.freelance.deleteMany();
    await prisma.company.deleteMany();
    await prisma.session.deleteMany();
    await prisma.account.deleteMany();
    await prisma.user.deleteMany();

    // Create platform admin user (no company affiliation)
    const adminUser = await createUser({
      first_name: 'Admin',
      last_name: 'Plateforme',
      email: 'admin@lillinker.com',
      role: 'ADMIN',
      status: true,
    });

    // Create company admin users for each portage company
    const staAdminUser = await createUser({
      first_name: 'Directeur',
      last_name: 'Commercial',
      email: 'directeur@sta-portage.com',
      role: 'COMPANY',
      status: true,
    });

    const itgAdminUser = await createUser({
      first_name: 'Responsable',
      last_name: 'Commercial',
      email: 'commercial@itg-portage.com',
      role: 'COMPANY',
      status: true,
    });

    // Create the main portage company
    const mainCompany = await createCompany({
      admin_user_id: staAdminUser.id,
      name: 'STA Portage',
      description: 'Société de portage salarial spécialisée dans l\'accompagnement des freelances et consultants indépendants',
      logo: 'https://lillinker.com/logos/sta-portage.png',
      siret: 123456789,
      consultant_count: 150,
      management_fees: 8.5,
    });

    // Create additional portage companies
    const itgPortage = await createCompany({
      admin_user_id: itgAdminUser.id,
      name: 'ITG Portage',
      description: 'Société de portage salarial pour les métiers du numérique et de l\'IT',
      logo: 'https://lillinker.com/logos/itg-portage.png',
      siret: 234567890,
      consultant_count: 200,
      management_fees: 7.8,
    });

    // Create some freelance users
    const freelanceUser1 = await createUser({
      first_name: 'Marie',
      last_name: 'Dubois',
      email: 'marie.dubois@example.com',
      role: 'FREELANCE',
      status: true,
    });

    const freelanceUser2 = await createUser({
      first_name: 'Pierre',
      last_name: 'Martin',
      email: 'pierre.martin@example.com',
      role: 'FREELANCE',
      status: true,
    });

    // Create freelance profiles
    const freelance1 = await prisma.freelance.create({
      data: {
        freelance_id: freelanceUser1.id,
        metier: 'Développeuse Web Full-Stack',
      },
    });

    const freelance2 = await prisma.freelance.create({
      data: {
        freelance_id: freelanceUser2.id,
        metier: 'Consultant en Transformation Digitale',
      },
    });

    // Create a manager user
    const managerUser = await createUser({
      first_name: 'Sophie',
      last_name: 'Laurent',
      email: 'sophie.laurent@sta-portage.com',
      role: 'MANAGER',
      status: true,
    });

    // Create company manager relationship
    await prisma.companyManager.create({
      data: {
        company_id: mainCompany.id,
        user_id: managerUser.id,
      },
    });

    // Create platform services for portage salarial
    const platformService1 = await prisma.platformService.create({
      data: {
        user_id: adminUser.id,
        label: 'Taux de Gestion',
        description: 'Pourcentage prélevé par la société de portage sur le chiffre d\'affaires du consultant',
        is_required: true,
        data_type: 'NUMBER',
        data_label: 'Taux de gestion (%)',
        data_description: 'Indiquez le taux de gestion appliqué (généralement entre 5% et 12%)',
        status: 'ACTIVE',
      },
    });

    const platformService2 = await prisma.platformService.create({
      data: {
        user_id: adminUser.id,
        label: 'Services Inclus',
        description: 'Services additionnels proposés par la société de portage',
        is_required: false,
        data_type: 'SELECT',
        data_label: 'Services proposés',
        data_description: 'Sélectionnez les services inclus dans votre offre',
        choices: [
          'Assurance RC Pro',
          'Formation continue',
          'Assistance juridique',
          'Gestion administrative',
          'Accompagnement commercial',
          'Mutuelle collective'
        ],
        status: 'ACTIVE',
      },
    });

    const platformService3 = await prisma.platformService.create({
      data: {
        user_id: adminUser.id,
        label: 'Délai de Paiement',
        description: 'Délai de versement du salaire après facturation client',
        is_required: true,
        data_type: 'SELECT',
        data_label: 'Délai de paiement',
        data_description: 'Délai habituel pour le versement du salaire',
        choices: ['15 jours', '30 jours', '45 jours', '60 jours'],
        status: 'ACTIVE',
      },
    });

    const platformService4 = await prisma.platformService.create({
      data: {
        user_id: adminUser.id,
        label: 'Frais de Dossier',
        description: 'Frais d\'ouverture et de gestion du dossier consultant',
        is_required: false,
        data_type: 'NUMBER',
        data_label: 'Frais de dossier (€)',
        data_description: 'Montant des frais d\'ouverture de dossier',
        status: 'ACTIVE',
      },
    });

    // Create company services
    const companyService1 = await prisma.companyService.create({
      data: {
        company_id: mainCompany.id,
        service_id: platformService1.id,
        is_active: true,
      },
    });

    const companyService2 = await prisma.companyService.create({
      data: {
        company_id: mainCompany.id,
        service_id: platformService2.id,
        is_active: true,
      },
    });

    await prisma.companyService.create({
      data: {
        company_id: mainCompany.id,
        service_id: platformService3.id,
        is_active: true,
      },
    });

    await prisma.companyService.create({
      data: {
        company_id: itgPortage.id,
        service_id: platformService1.id,
        is_active: true,
      },
    });

    // Create freelance requests
    const freelanceRequest1 = await prisma.freelanceRequest.create({
      data: {
        freelance_id: freelance1.id,
        mission_status: 'OPEN',
        client_name: 'Société Française Tech',
        client_address: '25 Rue de la République, 75011 Paris',
        client_sector: 'Technologies de l\'Information',
        priority: 'HIGH',
        tjm: 500.0,
        days: 30.0,
      },
    });

    const freelanceRequest2 = await prisma.freelanceRequest.create({
      data: {
        freelance_id: freelance2.id,
        mission_status: 'PENDING',
        client_name: 'Cabinet de Conseil Lyon',
        client_address: '15 Place Bellecour, 69002 Lyon',
        client_sector: 'Conseil et Transformation Digitale',
        priority: 'MEDIUM',
        tjm: 650.0,
        days: 45.0,
      },
    });

    // Create freelance request options
    await prisma.freelanceRequestOption.create({
      data: {
        freelance_request_id: freelanceRequest1.id,
        service_option_id: companyService1.id,
      },
    });

    await prisma.freelanceRequestOption.create({
      data: {
        freelance_request_id: freelanceRequest1.id,
        service_option_id: companyService2.id,
      },
    });

    await prisma.freelanceRequestOption.create({
      data: {
        freelance_request_id: freelanceRequest2.id,
        service_option_id: companyService1.id,
      },
    });

    // Create company responses
    await prisma.companyResponse.create({
      data: {
        request_id: freelanceRequest1.id,
        company_id: mainCompany.id,
        platform_service_id: platformService1.id,
        management_fees: 8.5,
        response_data: {
          taux_gestion: "8.5%",
          proposition: "Nous proposons un accompagnement complet pour votre mission de développement web",
          delai_paiement: "30 jours",
          services_inclus: ["Assurance RC Pro", "Formation continue", "Gestion administrative"],
          frais_dossier: 150,
          contact_commercial: "sophie.laurent@sta-portage.com"
        },
      },
    });

    await prisma.companyResponse.create({
      data: {
        request_id: freelanceRequest1.id,
        company_id: itgPortage.id,
        platform_service_id: platformService1.id,
        management_fees: 7.8,
        response_data: {
          taux_gestion: "7.8%",
          proposition: "Spécialistes des métiers IT, nous offrons les meilleurs taux du marché",
          delai_paiement: "15 jours",
          services_inclus: ["Assurance RC Pro", "Assistance juridique", "Mutuelle collective"],
          frais_dossier: 0,
          avantages: "Pas de frais de dossier, paiement rapide"
        },
      },
    });

    await prisma.companyResponse.create({
      data: {
        request_id: freelanceRequest2.id,
        company_id: mainCompany.id,
        platform_service_id: platformService2.id,
        management_fees: 8.5,
        response_data: {
          taux_gestion: "8.5%",
          proposition: "Expertise en transformation digitale avec accompagnement personnalisé",
          delai_paiement: "30 jours",
          services_inclus: ["Assurance RC Pro", "Formation continue", "Accompagnement commercial"],
          frais_dossier: 150,
          expertise_sectorielle: "Spécialisation en conseil et transformation digitale"
        },
      },
    });

    logger.info('Données de test créées avec succès!', {
      adminUser: adminUser.id,
      staAdminUser: staAdminUser.id,
      itgAdminUser: itgAdminUser.id,
      mainCompany: mainCompany.id,
      itgPortage: itgPortage.id,
      freelanceUser1: freelanceUser1.id,
      freelanceUser2: freelanceUser2.id,
      managerUser: managerUser.id,
      platformServices: [platformService1.id, platformService2.id, platformService3.id, platformService4.id],
      freelanceRequests: [freelanceRequest1.id, freelanceRequest2.id],
    });
  } catch (e) {
    logger.error('Error during seeding', e as Error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();