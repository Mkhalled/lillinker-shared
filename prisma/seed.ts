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
  phone_number?: string;
  role: 'ADMIN' | 'COMPANY' | 'FREELANCE' | 'MANAGER';
  status: boolean;
  email_verified?: boolean;
}

interface CompanyCreateData {
  admin_user_id: number;
  name: string;
  description: string;
  logo: string;
  siret: string;
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
    await prisma.freelanceRequestPortage.deleteMany();
    await prisma.freelanceRequest.deleteMany();
    await prisma.companyService.deleteMany();
    await prisma.platformService.deleteMany();
    await prisma.companyMetier.deleteMany();
    await prisma.companyPortage.deleteMany();
    await prisma.companyManager.deleteMany();
    await prisma.freelance.deleteMany();
    await prisma.company.deleteMany();
    await prisma.metier.deleteMany();
    await prisma.portage.deleteMany();
    await prisma.session.deleteMany();
    await prisma.account.deleteMany();
    await prisma.user.deleteMany();

    // Create platform admin user (no company affiliation)
    const adminUser = await createUser({
      first_name: 'Admin',
      last_name: 'Plateforme',
      email: 'admin@lillinker.com',
      phone_number: '+33123456789',
      role: 'ADMIN',
      status: true,
      email_verified: true, // Admin is pre-verified
    });

    // Create company admin users for each portage company
    const staAdminUser = await createUser({
      first_name: 'Directeur',
      last_name: 'Commercial',
      email: 'directeur@sta-portage.com',
      role: 'COMPANY',
      phone_number: '+33123456790',
      status: true,
      email_verified: true, // Company admins are pre-verified
    });

    const itgAdminUser = await createUser({
      first_name: 'Responsable',
      last_name: 'Commercial',
      email: 'commercial@itg-portage.com',
      role: 'COMPANY',
      phone_number: '+33123456791',
      status: true,
      email_verified: true, // Company admins are pre-verified
    });

    // Create the main portage company
    const mainCompany = await createCompany({
      admin_user_id: staAdminUser.id,
      name: 'STA Portage',
      description: 'Société de portage salarial spécialisée dans l\'accompagnement des freelances et consultants indépendants',
      logo: 'https://lillinker.com/logos/sta-portage.png',
      siret: "123456789",
      consultant_count: 150,
      management_fees: 8.5,
    });

    // Create additional portage companies
    const itgPortage = await createCompany({
      admin_user_id: itgAdminUser.id,
      name: 'ITG Portage',
      description: 'Société de portage salarial pour les métiers du numérique et de l\'IT',
      logo: 'https://lillinker.com/logos/itg-portage.png',
      siret: "234567890",
      consultant_count: 200,
      management_fees: 7.8,
    });

    // Create metiers (jobs/professions)
    const metierDeveloppeur = await prisma.metier.create({
      data: {
        name: 'Développeur Full-Stack',
      },
    });

    const metierDesigner = await prisma.metier.create({
      data: {
        name: 'Designer UX/UI',
      },
    });

    const metierConstructeur = await prisma.metier.create({
      data: {
        name: 'Ingénieur BTP',
      },
    });

    const metierConsultant = await prisma.metier.create({
      data: {
        name: 'Consultant en Transformation Digitale',
      },
    });

    const metierMarketing = await prisma.metier.create({
      data: {
        name: 'Spécialiste Marketing Digital',
      },
    });

    const metierDataScientist = await prisma.metier.create({
      data: {
        name: 'Data Scientist',
      },
    });

    const metierArchitecte = await prisma.metier.create({
      data: {
        name: 'Architecte Logiciel',
      },
    });

    const metierChefProjet = await prisma.metier.create({
      data: {
        name: 'Chef de Projet IT',
      },
    });

    const metierComptable = await prisma.metier.create({
      data: {
        name: 'Expert-Comptable',
      },
    });

    const metierFormateur = await prisma.metier.create({
      data: {
        name: 'Formateur Professionnel',
      },
    });

    // Link companies to metiers (many-to-many relationship)
    await prisma.companyMetier.createMany({
      data: [
        // STA Portage - General portage company with diverse expertise
        { company_id: mainCompany.id, metier_id: metierDeveloppeur.id },
        { company_id: mainCompany.id, metier_id: metierConsultant.id },
        { company_id: mainCompany.id, metier_id: metierDesigner.id },
        { company_id: mainCompany.id, metier_id: metierArchitecte.id },
        { company_id: mainCompany.id, metier_id: metierChefProjet.id },
        { company_id: mainCompany.id, metier_id: metierConstructeur.id },
        { company_id: mainCompany.id, metier_id: metierComptable.id },
        { company_id: mainCompany.id, metier_id: metierFormateur.id },
        // ITG Portage - IT and digital focused portage company
        { company_id: itgPortage.id, metier_id: metierDeveloppeur.id },
        { company_id: itgPortage.id, metier_id: metierDataScientist.id },
        { company_id: itgPortage.id, metier_id: metierMarketing.id },
        { company_id: itgPortage.id, metier_id: metierConsultant.id },
        { company_id: itgPortage.id, metier_id: metierArchitecte.id },
        { company_id: itgPortage.id, metier_id: metierDesigner.id },
        { company_id: itgPortage.id, metier_id: metierChefProjet.id },
      ],
    });

    // Create portage associations (professional associations)
    const associationFreelancesFrance = await prisma.portage.create({
      data: {
        name: 'Association des Freelances de France',
        description: 'Réseau national des travailleurs indépendants et freelances français',
      },
    });

    const syndicatPortageSalarial = await prisma.portage.create({
      data: {
        name: 'Syndicat National',
        description: 'Organisation professionnelle représentant les entreprises de portage salarial',
      },
    });

    const federationConsultants = await prisma.portage.create({
      data: {
        name: 'Fédération des Consultants',
        description: 'Association regroupant les consultants et experts indépendants',
      },
    });

    // Mark companies as portage companies and link them to portage services
    await prisma.company.update({
      where: { id: mainCompany.id },
      data: { is_portage: true },
    });

    await prisma.company.update({
      where: { id: itgPortage.id },
      data: { is_portage: true },
    });

    // Link portage companies to professional associations
    await prisma.companyPortage.createMany({
      data: [
        // STA Portage is member of multiple associations
        { company_id: mainCompany.id, portage_id: associationFreelancesFrance.id },
        { company_id: mainCompany.id, portage_id: syndicatPortageSalarial.id },
        { company_id: mainCompany.id, portage_id: federationConsultants.id },
        // ITG Portage is member of IT-focused associations
        { company_id: itgPortage.id, portage_id: syndicatPortageSalarial.id },
      ],
    });

    // Create some freelance users
    const freelanceUser1 = await createUser({
      first_name: 'Marie',
      last_name: 'Dubois',
      email: 'marie.dubois@example.com',
      phone_number: '+33123456792',
      role: 'FREELANCE',
      status: true,
      email_verified: false, // Freelancer needs to verify email
    });

    const freelanceUser2 = await createUser({
      first_name: 'Pierre',
      last_name: 'Martin',
      email: 'pierre.martin@example.com',
      phone_number: '+33123456793',
      role: 'FREELANCE',
      status: true,
      email_verified: true, // This freelancer has verified email
    });

    const freelanceUser3 = await createUser({
      first_name: 'Sophie',
      last_name: 'Legrand',
      email: 'sophie.legrand@example.com',
      phone_number: '+33123456794',
      role: 'FREELANCE',
      status: true,
      email_verified: true,
    });

    const freelanceUser4 = await createUser({
      first_name: 'Thomas',
      last_name: 'Moreau',
      email: 'thomas.moreau@example.com',
      phone_number: '+33123456795',
      role: 'FREELANCE',
      status: true,
      email_verified: false,
    });

    // Create freelance profiles
    const freelance1 = await prisma.freelance.create({
      data: {
        freelance_id: freelanceUser1.id,
        metier_id: metierDeveloppeur.id,
      },
    });

    const freelance2 = await prisma.freelance.create({
      data: {
        freelance_id: freelanceUser2.id,
        metier_id: metierConsultant.id,
      },
    });

    const freelance3 = await prisma.freelance.create({
      data: {
        freelance_id: freelanceUser3.id,
        metier_id: metierConstructeur.id,
      },
    });

    const freelance4 = await prisma.freelance.create({
      data: {
        freelance_id: freelanceUser4.id,
        metier_id: metierComptable.id,
      },
    });

    // Create a manager user
    const managerUser = await createUser({
      first_name: 'Claire',
      last_name: 'Laurent',
      email: 'claire.laurent@sta-portage.com',
      role: 'MANAGER',
      phone_number: '+33123456796',
      status: true,
      email_verified: true, // Manager is pre-verified
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
        data_type: 'NUMBER',
        requires_data: true,
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
        data_type: 'SELECT',
        requires_data: false,
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
        data_type: 'SELECT',
        requires_data: true,
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
        data_type: 'NUMBER',
        requires_data: false,
        data_label: 'Frais de dossier (€)',
        data_description: 'Montant des frais d\'ouverture de dossier',
        status: 'ACTIVE',
      },
    });

    const platformService5 = await prisma.platformService.create({
      data: {
        user_id: adminUser.id,
        label: 'Type de Contrat',
        description: 'Type de contrat de portage proposé',
        data_type: 'RADIO',
        requires_data: true,
        data_label: 'Type de contrat',
        data_description: 'Sélectionnez le type de contrat de portage',
        choices: ['CDI', 'CDD', 'Freelance'],
        status: 'ACTIVE',
      },
    });

    const platformService6 = await prisma.platformService.create({
      data: {
        user_id: adminUser.id,
        label: 'Description des Services',
        description: 'Description détaillée des services proposés par la société de portage',
        data_type: 'TEXT',
        requires_data: false,
        data_label: 'Description des services',
        data_description: 'Décrivez en détail les services que vous proposez aux consultants',
        status: 'ACTIVE',
      },
    });

    // Create company services
    await prisma.companyService.create({
      data: {
        company_id: mainCompany.id,
        service_id: platformService1.id,
        is_active: true,
      },
    });

    await prisma.companyService.create({
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

    const freelanceRequest3 = await prisma.freelanceRequest.create({
      data: {
        freelance_id: freelance3.id,
        mission_status: 'OPEN',
        client_name: 'Entreprise de Construction Moderne',
        client_address: '10 Avenue de la Construction, 69003 Lyon',
        client_sector: 'BTP et Génie Civil',
        priority: 'HIGH',
        tjm: 450.0,
        days: 60.0,
      },
    });

    const freelanceRequest4 = await prisma.freelanceRequest.create({
      data: {
        freelance_id: freelance4.id,
        mission_status: 'CLOSED',
        client_name: 'Cabinet Comptable Parisien',
        client_address: '5 Rue de la Comptabilité, 75008 Paris',
        client_sector: 'Services Comptables',
        priority: 'LOW',
        tjm: 400.0,
        days: 20.0,
      },
    });

    // Create freelance request options (now referencing platform services directly)
    await prisma.freelanceRequestOption.create({
      data: {
        freelance_request_id: freelanceRequest1.id,
        service_option_id: platformService1.id,
        is_required: false,
        response_data: { text: 'Nous recherchons un taux compétitif pour notre mission de développement' },
      },
    });

    await prisma.freelanceRequestOption.create({
      data: {
        freelance_request_id: freelanceRequest1.id,
        service_option_id: platformService2.id,
        is_required: true,
        response_data: { selected: ['Assurance RC Pro', 'Gestion administrative', 'Formation continue'] },
      },
    });

    await prisma.freelanceRequestOption.create({
      data: {
        freelance_request_id: freelanceRequest1.id,
        service_option_id: platformService3.id,
        is_required: true,
        response_data: { selected: '30 jours' },
      },
    });

    await prisma.freelanceRequestOption.create({
      data: {
        freelance_request_id: freelanceRequest2.id,
        service_option_id: platformService1.id,
        is_required: true,
        response_data: { text: 'Recherche du meilleur taux possible pour mission de consulting' },
      },
    });

    await prisma.freelanceRequestOption.create({
      data: {
        freelance_request_id: freelanceRequest2.id,
        service_option_id: platformService5.id,
        is_required: true,
        response_data: { selected: 'CDI' },
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
      freelanceUsers: [freelanceUser1.id, freelanceUser2.id, freelanceUser3.id, freelanceUser4.id],
      freelances: [freelance1.id, freelance2.id, freelance3.id, freelance4.id],
      managerUser: managerUser.id,
      metiersCreated: 10, // All job types from developer to formateur
      associationsCreated: 5, // Professional associations instead of services
      platformServices: [
        platformService1.id, 
        platformService2.id, 
        platformService3.id, 
        platformService4.id, 
        platformService5.id,
        platformService6.id
      ],
      freelanceRequests: [freelanceRequest1.id, freelanceRequest2.id, freelanceRequest3.id, freelanceRequest4.id],
    });
  } catch (e) {
    logger.error('Error during seeding', e as Error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();