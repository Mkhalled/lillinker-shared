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
  sex?: 'MALE' | 'FEMALE';
}

interface CompanyCreateData {
  admin_user_id: number;
  name: string;
  description: string;
  logo: string;
  siret: string;
  consultant_count: number;
  management_fees: number;
  is_portage?: boolean;
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
 * Script de données de test pour la plateforme Lillinker - Portage Salarial
 *
 * Ce script crée les données initiales pour la plateforme incluant :
 * - Utilisateurs administrateurs
 * - Sociétés de portage salarial avec leurs administrateurs
 * - Freelances et consultants
 * - Services de la plateforme (taux de gestion, délais, services inclus)
 * - Organismes sociaux et cotisations
 * - Demandes de simulation et réponses
 *
 * Note: Tous les mots de passe sont définis à 'Admin123!' pour le développement
 */

async function main(): Promise<void> {
  try {
    logger.info('Starting database seeding for Portage Salarial platform...');

    // Clean up existing data in correct order (respecting foreign key constraints)
    await prisma.companyResponseOrganisme.deleteMany();
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
    await prisma.cotisation.deleteMany();
    await prisma.organisme.deleteMany();
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
      email_verified: true,
      sex: 'MALE',
    });

    // Create company admin users for each portage company
    const staAdminUser = await createUser({
      first_name: 'Sophie',
      last_name: 'Directeur',
      email: 'directeur@sta-portage.com',
      role: 'COMPANY',
      phone_number: '+33123456790',
      status: true,
      email_verified: true,
      sex: 'FEMALE',
    });

    const itgAdminUser = await createUser({
      first_name: 'Marc',
      last_name: 'Responsable',
      email: 'commercial@itg-portage.com',
      role: 'COMPANY',
      phone_number: '+33123456791',
      status: true,
      email_verified: true,
      sex: 'MALE',
    });

    const freelanceAdminUser = await createUser({
      first_name: 'Claire',
      last_name: 'Laurent',
      email: 'contact@freelance-plus.com',
      role: 'COMPANY',
      phone_number: '+33123456792',
      status: true,
      email_verified: true,
      sex: 'FEMALE',
    });

    // Create the main portage companies
    const staPortage = await createCompany({
      admin_user_id: staAdminUser.id,
      name: 'STA Portage',
      description:
        "Société de portage salarial spécialisée dans l'accompagnement des freelances et consultants indépendants. Leader français du portage salarial avec plus de 15 ans d'expérience.",
      logo: 'https://lillinker.com/logos/sta-portage.png',
      siret: '12345678900012',
      consultant_count: 1500,
      management_fees: 8.5,
      is_portage: true,
    });

    const itgPortage = await createCompany({
      admin_user_id: itgAdminUser.id,
      name: 'ITG Portage',
      description:
        "Société de portage salarial pour les métiers du numérique et de l'IT. Spécialiste des profils techniques avec un accompagnement personnalisé.",
      logo: 'https://lillinker.com/logos/itg-portage.png',
      siret: '23456789000123',
      consultant_count: 800,
      management_fees: 7.8,
      is_portage: true,
    });

    const freelancePlus = await createCompany({
      admin_user_id: freelanceAdminUser.id,
      name: 'Freelance Plus',
      description:
        'Portage salarial nouvelle génération, 100% digital. Taux compétitifs et services premium pour les consultants modernes.',
      logo: 'https://lillinker.com/logos/freelance-plus.png',
      siret: '34567890001234',
      consultant_count: 450,
      management_fees: 6.9,
      is_portage: true,
    });

    // Create metiers (jobs/professions)
    const metierDeveloppeur = await prisma.metier.create({
      data: { name: 'Développeur Full-Stack' },
    });

    const metierDesigner = await prisma.metier.create({
      data: { name: 'Designer UX/UI' },
    });

    const metierConsultant = await prisma.metier.create({
      data: { name: 'Consultant en Transformation Digitale' },
    });

    const metierMarketing = await prisma.metier.create({
      data: { name: 'Spécialiste Marketing Digital' },
    });

    const metierDataScientist = await prisma.metier.create({
      data: { name: 'Data Scientist' },
    });

    const metierArchitecte = await prisma.metier.create({
      data: { name: 'Architecte Logiciel' },
    });

    const metierChefProjet = await prisma.metier.create({
      data: { name: 'Chef de Projet IT' },
    });

    const metierComptable = await prisma.metier.create({
      data: { name: 'Expert-Comptable' },
    });

    const metierFormateur = await prisma.metier.create({
      data: { name: 'Formateur Professionnel' },
    });

    const metierIngenieur = await prisma.metier.create({
      data: { name: 'Ingénieur BTP' },
    });

    // Link companies to metiers (many-to-many relationship)
    await prisma.companyMetier.createMany({
      data: [
        // STA Portage - General portage company with diverse expertise
        { company_id: staPortage.id, metier_id: metierDeveloppeur.id },
        { company_id: staPortage.id, metier_id: metierConsultant.id },
        { company_id: staPortage.id, metier_id: metierDesigner.id },
        { company_id: staPortage.id, metier_id: metierArchitecte.id },
        { company_id: staPortage.id, metier_id: metierChefProjet.id },
        { company_id: staPortage.id, metier_id: metierIngenieur.id },
        { company_id: staPortage.id, metier_id: metierComptable.id },
        { company_id: staPortage.id, metier_id: metierFormateur.id },
        // ITG Portage - IT and digital focused portage company
        { company_id: itgPortage.id, metier_id: metierDeveloppeur.id },
        { company_id: itgPortage.id, metier_id: metierDataScientist.id },
        { company_id: itgPortage.id, metier_id: metierMarketing.id },
        { company_id: itgPortage.id, metier_id: metierConsultant.id },
        { company_id: itgPortage.id, metier_id: metierArchitecte.id },
        { company_id: itgPortage.id, metier_id: metierDesigner.id },
        { company_id: itgPortage.id, metier_id: metierChefProjet.id },
        // Freelance Plus - Modern digital focus
        { company_id: freelancePlus.id, metier_id: metierDeveloppeur.id },
        { company_id: freelancePlus.id, metier_id: metierDataScientist.id },
        { company_id: freelancePlus.id, metier_id: metierMarketing.id },
        { company_id: freelancePlus.id, metier_id: metierDesigner.id },
        { company_id: freelancePlus.id, metier_id: metierConsultant.id },
      ],
    });

    // Create portage associations (professional associations)
    const peps = await prisma.portage.create({
      data: {
        name: "PEPS (Syndicat des Professionnels de l'Emploi)",
        description: 'Syndicat national des entreprises de portage salarial en France',
      },
    });

    const feps = await prisma.portage.create({
      data: {
        name: 'FEPS (Fédération des Entreprises de Portage Salarial)',
        description: 'Fédération regroupant les principales entreprises de portage salarial',
      },
    });

    const sneps = await prisma.portage.create({
      data: {
        name: 'SNEPS (Syndicat National des Entreprises de Portage Salarial)',
        description:
          'Organisation professionnelle représentant les entreprises de portage salarial',
      },
    });

    // Link portage companies to professional associations
    await prisma.companyPortage.createMany({
      data: [
        // STA Portage is member of multiple associations
        { company_id: staPortage.id, portage_id: peps.id },
        { company_id: staPortage.id, portage_id: feps.id },
        { company_id: staPortage.id, portage_id: sneps.id },
        // ITG Portage
        { company_id: itgPortage.id, portage_id: feps.id },
        { company_id: itgPortage.id, portage_id: sneps.id },
        // Freelance Plus
        { company_id: freelancePlus.id, portage_id: peps.id },
      ],
    });

    // Create freelance users
    const freelanceUser1 = await createUser({
      first_name: 'Marie',
      last_name: 'Dubois',
      email: 'marie.dubois@example.com',
      phone_number: '+33123456793',
      role: 'FREELANCE',
      status: true,
      email_verified: true,
      sex: 'FEMALE',
    });

    const freelanceUser2 = await createUser({
      first_name: 'Pierre',
      last_name: 'Martin',
      email: 'pierre.martin@example.com',
      phone_number: '+33123456794',
      role: 'FREELANCE',
      status: true,
      email_verified: true,
      sex: 'MALE',
    });

    const freelanceUser3 = await createUser({
      first_name: 'Sophie',
      last_name: 'Legrand',
      email: 'sophie.legrand@example.com',
      phone_number: '+33123456795',
      role: 'FREELANCE',
      status: true,
      email_verified: false,
      sex: 'FEMALE',
    });

    const freelanceUser4 = await createUser({
      first_name: 'Thomas',
      last_name: 'Moreau',
      email: 'thomas.moreau@example.com',
      phone_number: '+33123456796',
      role: 'FREELANCE',
      status: true,
      email_verified: true,
      sex: 'MALE',
    });

    const freelanceUser5 = await createUser({
      first_name: 'Julie',
      last_name: 'Bernard',
      email: 'julie.bernard@example.com',
      phone_number: '+33123456797',
      role: 'FREELANCE',
      status: true,
      email_verified: false,
      sex: 'FEMALE',
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
        metier_id: metierDesigner.id,
      },
    });

    const freelance4 = await prisma.freelance.create({
      data: {
        freelance_id: freelanceUser4.id,
        metier_id: metierDataScientist.id,
      },
    });

    const freelance5 = await prisma.freelance.create({
      data: {
        freelance_id: freelanceUser5.id,
        metier_id: metierMarketing.id,
      },
    });

    // Create manager users
    const managerUser1 = await createUser({
      first_name: 'Claire',
      last_name: 'Laurent',
      email: 'claire.laurent@sta-portage.com',
      role: 'MANAGER',
      phone_number: '+33123456798',
      status: true,
      email_verified: true,
      sex: 'FEMALE',
    });

    const managerUser2 = await createUser({
      first_name: 'Antoine',
      last_name: 'Dupont',
      email: 'antoine.dupont@itg-portage.com',
      role: 'MANAGER',
      phone_number: '+33123456799',
      status: true,
      email_verified: true,
      sex: 'MALE',
    });

    // Create company manager relationships
    await prisma.companyManager.createMany({
      data: [
        { company_id: staPortage.id, user_id: managerUser1.id },
        { company_id: itgPortage.id, user_id: managerUser2.id },
      ],
    });

    // Create platform services for portage salarial
    const platformService1 = await prisma.platformService.create({
      data: {
        user_id: adminUser.id,
        label: 'Taux de Gestion',
        description:
          "Pourcentage prélevé par la société de portage sur le chiffre d'affaires du consultant",
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
          'Mutuelle collective',
          'Prévoyance',
          'CSE (Comité Social et Économique)',
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
        description: "Frais d'ouverture et de gestion du dossier consultant",
        data_type: 'NUMBER',
        requires_data: false,
        data_label: 'Frais de dossier (€)',
        data_description: "Montant des frais d'ouverture de dossier",
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
        choices: ['CDI', 'CDD'],
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

    const platformService7 = await prisma.platformService.create({
      data: {
        user_id: adminUser.id,
        label: 'Avance sur Salaire',
        description: "Possibilité d'obtenir une avance sur le salaire en cours de mission",
        data_type: 'RADIO',
        requires_data: true,
        data_label: 'Avance sur salaire disponible',
        data_description: 'Proposez-vous des avances sur salaire ?',
        choices: ['Oui', 'Non', 'Selon conditions'],
        status: 'ACTIVE',
      },
    });

    // Create company services
    await prisma.companyService.createMany({
      data: [
        // STA Portage services
        { company_id: staPortage.id, service_id: platformService1.id, is_active: true },
        { company_id: staPortage.id, service_id: platformService2.id, is_active: true },
        { company_id: staPortage.id, service_id: platformService3.id, is_active: true },
        { company_id: staPortage.id, service_id: platformService4.id, is_active: true },
        { company_id: staPortage.id, service_id: platformService5.id, is_active: true },
        { company_id: staPortage.id, service_id: platformService6.id, is_active: true },
        { company_id: staPortage.id, service_id: platformService7.id, is_active: true },
        // ITG Portage services
        { company_id: itgPortage.id, service_id: platformService1.id, is_active: true },
        { company_id: itgPortage.id, service_id: platformService2.id, is_active: true },
        { company_id: itgPortage.id, service_id: platformService3.id, is_active: true },
        { company_id: itgPortage.id, service_id: platformService5.id, is_active: true },
        { company_id: itgPortage.id, service_id: platformService7.id, is_active: true },
        // Freelance Plus services
        { company_id: freelancePlus.id, service_id: platformService1.id, is_active: true },
        { company_id: freelancePlus.id, service_id: platformService2.id, is_active: true },
        { company_id: freelancePlus.id, service_id: platformService3.id, is_active: true },
        { company_id: freelancePlus.id, service_id: platformService6.id, is_active: true },
        { company_id: freelancePlus.id, service_id: platformService7.id, is_active: true },
      ],
    });

    // Create organismes sociaux and cotisations for each company
    // STA Portage organismes
    const urssafSta = await prisma.organisme.create({
      data: {
        company_id: staPortage.id,
        label: 'URSSAF',
        description:
          "Union de Recouvrement des cotisations de Sécurité Sociale et d'Allocations Familiales",
      },
    });

    const poleEmploiSta = await prisma.organisme.create({
      data: {
        company_id: staPortage.id,
        label: 'Pôle Emploi',
        description: "Service public de l'emploi - Assurance chômage",
      },
    });

    const retraiteSta = await prisma.organisme.create({
      data: {
        company_id: staPortage.id,
        label: 'Caisse de Retraite',
        description: 'Organisme de retraite complémentaire',
      },
    });

    // ITG Portage organismes
    const urssafItg = await prisma.organisme.create({
      data: {
        company_id: itgPortage.id,
        label: 'URSSAF',
        description:
          "Union de Recouvrement des cotisations de Sécurité Sociale et d'Allocations Familiales",
      },
    });

    const poleEmploiItg = await prisma.organisme.create({
      data: {
        company_id: itgPortage.id,
        label: 'Pôle Emploi',
        description: "Service public de l'emploi - Assurance chômage",
      },
    });

    // Create cotisations
    await prisma.cotisation.createMany({
      data: [
        // STA Portage cotisations
        {
          organisme_id: urssafSta.id,
          label: 'Sécurité Sociale',
          description: 'Cotisations maladie, maternité, invalidité, décès',
          type: 'DEUX',
          pourcentage_salarial: 0.75,
          pourcentage_patronal: 13.0,
        },
        {
          organisme_id: urssafSta.id,
          label: 'Allocations Familiales',
          description: 'Cotisations pour les prestations familiales',
          type: 'PATRONAL',
          pourcentage_patronal: 5.25,
        },
        {
          organisme_id: poleEmploiSta.id,
          label: 'Assurance Chômage',
          description: "Cotisations d'assurance chômage",
          type: 'DEUX',
          pourcentage_salarial: 2.4,
          pourcentage_patronal: 4.05,
        },
        {
          organisme_id: retraiteSta.id,
          label: 'Retraite Complémentaire',
          description: 'Cotisations de retraite complémentaire AGIRC-ARRCO',
          type: 'DEUX',
          pourcentage_salarial: 3.15,
          pourcentage_patronal: 4.72,
        },
        // ITG Portage cotisations
        {
          organisme_id: urssafItg.id,
          label: 'Sécurité Sociale',
          description: 'Cotisations maladie, maternité, invalidité, décès',
          type: 'DEUX',
          pourcentage_salarial: 0.75,
          pourcentage_patronal: 13.0,
        },
        {
          organisme_id: poleEmploiItg.id,
          label: 'Assurance Chômage',
          description: "Cotisations d'assurance chômage",
          type: 'DEUX',
          pourcentage_salarial: 2.4,
          pourcentage_patronal: 4.05,
        },
      ],
    });

    // Create freelance requests
    const freelanceRequest1 = await prisma.freelanceRequest.create({
      data: {
        freelance_id: freelance1.id,
        mission_status: 'OPEN',
        client_name: 'Société Française Tech',
        client_address: '25 Rue de la République, 75011 Paris',
        client_sector: "Technologies de l'Information",
        priority: 'HIGH',
        tjm: 500.0,
        days: 30.0,
        wants_portage: true,
        want_salaried: true,
        salary: 4500.0,
        start_date: new Date('2025-09-01'),
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
        wants_portage: true,
        want_salaried: false,
        start_date: new Date('2025-10-15'),
      },
    });

    const freelanceRequest3 = await prisma.freelanceRequest.create({
      data: {
        freelance_id: freelance3.id,
        mission_status: 'OPEN',
        client_name: 'Startup Innovante',
        client_address: "10 Avenue de l'Innovation, 75015 Paris",
        client_sector: 'Design et UX',
        priority: 'HIGH',
        tjm: 450.0,
        days: 20.0,
        wants_portage: true,
        want_salaried: true,
        salary: 3800.0,
        start_date: new Date('2025-08-20'),
      },
    });

    const freelanceRequest4 = await prisma.freelanceRequest.create({
      data: {
        freelance_id: freelance4.id,
        mission_status: 'CLOSED',
        client_name: 'Entreprise Data',
        client_address: '5 Rue des Données, 69003 Lyon',
        client_sector: 'Intelligence Artificielle',
        priority: 'LOW',
        tjm: 700.0,
        days: 60.0,
        wants_portage: false,
        want_salaried: false,
        start_date: new Date('2025-07-01'),
      },
    });

    const freelanceRequest5 = await prisma.freelanceRequest.create({
      data: {
        freelance_id: freelance5.id,
        mission_status: 'OPEN',
        client_name: 'Agence Marketing 360',
        client_address: '20 Boulevard du Marketing, 33000 Bordeaux',
        client_sector: 'Marketing Digital',
        priority: 'MEDIUM',
        tjm: 400.0,
        days: 40.0,
        wants_portage: true,
        want_salaried: true,
        salary: 3200.0,
        start_date: new Date('2025-09-15'),
      },
    });

    // Link freelance requests to portage preferences
    await prisma.freelanceRequestPortage.createMany({
      data: [
        { freelance_request_id: freelanceRequest1.id, portage_id: peps.id },
        { freelance_request_id: freelanceRequest1.id, portage_id: feps.id },
        { freelance_request_id: freelanceRequest2.id, portage_id: sneps.id },
        { freelance_request_id: freelanceRequest3.id, portage_id: peps.id },
        { freelance_request_id: freelanceRequest5.id, portage_id: feps.id },
      ],
    });

    // Create freelance request options (services requested by freelancers)
    await prisma.freelanceRequestOption.createMany({
      data: [
        // Request 1 options
        {
          freelance_request_id: freelanceRequest1.id,
          service_option_id: platformService1.id,
          is_required: true,
          response_data: {
            text: 'Recherche le meilleur taux de gestion possible pour une mission de 30 jours',
          },
        },
        {
          freelance_request_id: freelanceRequest1.id,
          service_option_id: platformService2.id,
          is_required: true,
          response_data: {
            selected: ['Assurance RC Pro', 'Formation continue', 'Gestion administrative'],
          },
        },
        {
          freelance_request_id: freelanceRequest1.id,
          service_option_id: platformService3.id,
          is_required: true,
          response_data: { selected: '30 jours' },
        },
        {
          freelance_request_id: freelanceRequest1.id,
          service_option_id: platformService5.id,
          is_required: false,
          response_data: { selected: 'CDI' },
        },
        // Request 2 options
        {
          freelance_request_id: freelanceRequest2.id,
          service_option_id: platformService1.id,
          is_required: true,
          response_data: {
            text: 'Mission longue durée, recherche taux préférentiel',
          },
        },
        {
          freelance_request_id: freelanceRequest2.id,
          service_option_id: platformService2.id,
          is_required: true,
          response_data: {
            selected: ['Assurance RC Pro', 'Assistance juridique', 'Accompagnement commercial'],
          },
        },
        {
          freelance_request_id: freelanceRequest2.id,
          service_option_id: platformService7.id,
          is_required: false,
          response_data: { selected: 'Oui' },
        },
        // Request 3 options
        {
          freelance_request_id: freelanceRequest3.id,
          service_option_id: platformService1.id,
          is_required: true,
          response_data: {
            text: "Première mission en portage, besoin d'accompagnement",
          },
        },
        {
          freelance_request_id: freelanceRequest3.id,
          service_option_id: platformService2.id,
          is_required: true,
          response_data: {
            selected: [
              'Assurance RC Pro',
              'Formation continue',
              'Gestion administrative',
              'Mutuelle collective',
            ],
          },
        },
        {
          freelance_request_id: freelanceRequest3.id,
          service_option_id: platformService3.id,
          is_required: true,
          response_data: { selected: '15 jours' },
        },
        // Request 5 options
        {
          freelance_request_id: freelanceRequest5.id,
          service_option_id: platformService1.id,
          is_required: true,
          response_data: {
            text: 'Spécialiste marketing digital, recherche société de portage spécialisée',
          },
        },
        {
          freelance_request_id: freelanceRequest5.id,
          service_option_id: platformService2.id,
          is_required: false,
          response_data: {
            selected: ['Formation continue', 'Accompagnement commercial'],
          },
        },
      ],
    });

    // Create company responses
    const response1Sta = await prisma.companyResponse.create({
      data: {
        request_id: freelanceRequest1.id,
        company_id: staPortage.id,
        response_data: {
          services: [
            {
              service_id: platformService1.id,
              service_name: 'Taux de Gestion',
              service_description: 'Pourcentage prélevé par la société de portage',
              is_available: true,
              management_fee: 8.5,
              comment: 'Taux compétitif avec expertise de 15 ans dans le secteur',
            },
            {
              service_id: platformService2.id,
              service_name: 'Services Inclus',
              service_description: 'Services additionnels proposés',
              is_available: true,
              management_fee: 0,
              comment:
                'Assurance RC Pro, Formation continue, Gestion administrative, Mutuelle collective',
            },
            {
              service_id: platformService3.id,
              service_name: 'Délai de Paiement',
              service_description: 'Délai de versement du salaire après facturation',
              is_available: true,
              management_fee: 0,
              comment: '30 jours',
            },
            {
              service_id: platformService4.id,
              service_name: 'Frais de Dossier',
              service_description: "Frais d'ouverture et de gestion du dossier",
              is_available: true,
              management_fee: 150,
              comment: "Frais d'ouverture unique",
            },
          ],
          selected_organismes: [
            {
              organisme_id: urssafSta.id,
              label: 'URSSAF',
              total_patronal: 1850.5,
              total_salarial: 1200.75,
            },
            {
              organisme_id: poleEmploiSta.id,
              label: 'Pôle Emploi',
              total_patronal: 420.0,
              total_salarial: 285.5,
            },
            {
              organisme_id: retraiteSta.id,
              label: 'Caisse de Retraite',
              total_patronal: 650.25,
              total_salarial: 485.75,
            },
          ],
        },
      },
    });

    const response1Itg = await prisma.companyResponse.create({
      data: {
        request_id: freelanceRequest1.id,
        company_id: itgPortage.id,
        response_data: {
          services: [
            {
              service_id: platformService1.id,
              service_name: 'Taux de Gestion',
              service_description: 'Pourcentage prélevé par la société de portage',
              is_available: true,
              management_fee: 7.8,
              comment: 'Taux spécialement compétitif pour les métiers IT',
            },
            {
              service_id: platformService2.id,
              service_name: 'Services Inclus',
              service_description: 'Services additionnels proposés',
              is_available: true,
              management_fee: 0,
              comment: 'Assurance RC Pro, Assistance juridique, Formation technique',
            },
            {
              service_id: platformService3.id,
              service_name: 'Délai de Paiement',
              service_description: 'Délai de versement du salaire après facturation',
              is_available: true,
              management_fee: 0,
              comment: '15 jours - Paiement rapide',
            },
            {
              service_id: platformService4.id,
              service_name: 'Frais de Dossier',
              service_description: "Frais d'ouverture et de gestion du dossier",
              is_available: false,
              management_fee: 0,
              comment: 'Aucun frais de dossier',
            },
          ],
          selected_organismes: [
            {
              organisme_id: urssafItg.id,
              label: 'URSSAF',
              total_patronal: 1820.3,
              total_salarial: 1180.25,
            },
            {
              organisme_id: poleEmploiItg.id,
              label: 'Pôle Emploi',
              total_patronal: 410.5,
              total_salarial: 275.8,
            },
          ],
        },
      },
    });

    const response1Freelance = await prisma.companyResponse.create({
      data: {
        request_id: freelanceRequest1.id,
        company_id: freelancePlus.id,
        response_data: {
          services: [
            {
              service_id: platformService1.id,
              service_name: 'Taux de Gestion',
              service_description: 'Pourcentage prélevé par la société de portage',
              is_available: true,
              management_fee: 6.9,
              comment: 'Le meilleur taux du marché',
            },
            {
              service_id: platformService2.id,
              service_name: 'Services Inclus',
              service_description: 'Services additionnels proposés',
              is_available: true,
              management_fee: 0,
              comment: 'Assurance RC Pro, Plateforme digitale, Support 24/7',
            },
            {
              service_id: platformService3.id,
              service_name: 'Délai de Paiement',
              service_description: 'Délai de versement du salaire après facturation',
              is_available: true,
              management_fee: 0,
              comment: '15 jours via plateforme digitale',
            },
            {
              service_id: platformService6.id,
              service_name: 'Description des Services',
              service_description: 'Description détaillée des services proposés',
              is_available: true,
              management_fee: 0,
              comment: 'Portage 100% digital avec interface moderne et intuitive',
            },
          ],
          selected_organismes: [
            {
              organisme_id: urssafSta.id,
              label: 'URSSAF',
              total_patronal: 1780.0,
              total_salarial: 1150.0,
            },
          ],
        },
      },
    });

    const response2Sta = await prisma.companyResponse.create({
      data: {
        request_id: freelanceRequest2.id,
        company_id: staPortage.id,
        response_data: {
          services: [
            {
              service_id: platformService1.id,
              service_name: 'Taux de Gestion',
              service_description: 'Pourcentage prélevé par la société de portage',
              is_available: true,
              management_fee: 8.0,
              comment: 'Taux préférentiel pour missions longue durée',
            },
            {
              service_id: platformService2.id,
              service_name: 'Services Inclus',
              service_description: 'Services additionnels proposés',
              is_available: true,
              management_fee: 0,
              comment:
                'Assurance RC Pro, Assistance juridique, Accompagnement commercial, Formation continue',
            },
            {
              service_id: platformService3.id,
              service_name: 'Délai de Paiement',
              service_description: 'Délai de versement du salaire après facturation',
              is_available: true,
              management_fee: 0,
              comment: '30 jours',
            },
            {
              service_id: platformService4.id,
              service_name: 'Frais de Dossier',
              service_description: "Frais d'ouverture et de gestion du dossier",
              is_available: true,
              management_fee: 100,
              comment: 'Frais réduits pour mission longue',
            },
            {
              service_id: platformService5.id,
              service_name: 'Type de Contrat',
              service_description: 'Type de contrat de portage proposé',
              is_available: true,
              management_fee: 0,
              comment: 'CDI disponible pour missions longues',
            },
          ],
          selected_organismes: [
            {
              organisme_id: urssafSta.id,
              label: 'URSSAF',
              total_patronal: 2850.5,
              total_salarial: 1850.25,
            },
            {
              organisme_id: poleEmploiSta.id,
              label: 'Pôle Emploi',
              total_patronal: 620.0,
              total_salarial: 420.5,
            },
            {
              organisme_id: retraiteSta.id,
              label: 'Caisse de Retraite',
              total_patronal: 980.75,
              total_salarial: 735.25,
            },
          ],
        },
      },
    });

    const response3Itg = await prisma.companyResponse.create({
      data: {
        request_id: freelanceRequest3.id,
        company_id: itgPortage.id,
        response_data: {
          services: [
            {
              service_id: platformService1.id,
              service_name: 'Taux de Gestion',
              service_description: 'Pourcentage prélevé par la société de portage',
              is_available: true,
              management_fee: 7.5,
              comment: 'Taux spécialisé pour designers UX/UI',
            },
            {
              service_id: platformService2.id,
              service_name: 'Services Inclus',
              service_description: 'Services additionnels proposés',
              is_available: true,
              management_fee: 0,
              comment:
                'Assurance RC Pro, Formation design, Outils Adobe inclus, Mutuelle collective',
            },
            {
              service_id: platformService3.id,
              service_name: 'Délai de Paiement',
              service_description: 'Délai de versement du salaire après facturation',
              is_available: true,
              management_fee: 0,
              comment: '15 jours',
            },
            {
              service_id: platformService4.id,
              service_name: 'Frais de Dossier',
              service_description: "Frais d'ouverture et de gestion du dossier",
              is_available: true,
              management_fee: 50,
              comment: 'Frais réduits pour la communauté créative',
            },
            {
              service_id: platformService6.id,
              service_name: 'Description des Services',
              service_description: 'Description détaillée des services proposés',
              is_available: true,
              management_fee: 0,
              comment: 'Spécialisation design avec accès aux outils Adobe et communauté créative',
            },
          ],
          selected_organismes: [
            {
              organisme_id: urssafItg.id,
              label: 'URSSAF',
              total_patronal: 1580.75,
              total_salarial: 1050.25,
            },
            {
              organisme_id: poleEmploiItg.id,
              label: 'Pôle Emploi',
              total_patronal: 350.5,
              total_salarial: 240.8,
            },
          ],
        },
      },
    });

    const response5Freelance = await prisma.companyResponse.create({
      data: {
        request_id: freelanceRequest5.id,
        company_id: freelancePlus.id,
        response_data: {
          services: [
            {
              service_id: platformService1.id,
              service_name: 'Taux de Gestion',
              service_description: 'Pourcentage prélevé par la société de portage',
              is_available: true,
              management_fee: 6.9,
              comment: 'Taux spécialisé marketing digital',
            },
            {
              service_id: platformService2.id,
              service_name: 'Services Inclus',
              service_description: 'Services additionnels proposés',
              is_available: true,
              management_fee: 0,
              comment: 'Formation marketing, Outils Google Ads, Accompagnement commercial',
            },
            {
              service_id: platformService3.id,
              service_name: 'Délai de Paiement',
              service_description: 'Délai de versement du salaire après facturation',
              is_available: true,
              management_fee: 0,
              comment: '15 jours via plateforme digitale',
            },
            {
              service_id: platformService6.id,
              service_name: 'Description des Services',
              service_description: 'Description détaillée des services proposés',
              is_available: true,
              management_fee: 0,
              comment:
                "Spécialisation marketing digital avec accès aux outils premium et réseau d'experts",
            },
            {
              service_id: platformService7.id,
              service_name: 'Avance sur Salaire',
              service_description: "Possibilité d'obtenir une avance sur le salaire",
              is_available: true,
              management_fee: 0,
              comment: 'Oui, selon conditions',
            },
          ],
          selected_organismes: [
            {
              organisme_id: urssafSta.id,
              label: 'URSSAF',
              total_patronal: 1420.5,
              total_salarial: 920.75,
            },
            {
              organisme_id: poleEmploiSta.id,
              label: 'Pôle Emploi',
              total_patronal: 290.8,
              total_salarial: 195.25,
            },
          ],
        },
      },
    });

    // Add response for freelanceRequest4 (Data Science mission)
    const response4Itg = await prisma.companyResponse.create({
      data: {
        request_id: freelanceRequest4.id,
        company_id: itgPortage.id,
        response_data: {
          services: [
            {
              service_id: platformService1.id,
              service_name: 'Taux de Gestion',
              service_description: 'Pourcentage prélevé par la société de portage',
              is_available: true,
              management_fee: 7.2,
              comment: 'Taux spécialisé pour experts Data Science',
            },
            {
              service_id: platformService2.id,
              service_name: 'Services Inclus',
              service_description: 'Services additionnels proposés',
              is_available: true,
              management_fee: 0,
              comment:
                'Assurance RC Pro, Formation IA/ML, Accès outils analytics, Support technique',
            },
            {
              service_id: platformService3.id,
              service_name: 'Délai de Paiement',
              service_description: 'Délai de versement du salaire après facturation',
              is_available: true,
              management_fee: 0,
              comment: '15 jours',
            },
            {
              service_id: platformService6.id,
              service_name: 'Description des Services',
              service_description: 'Description détaillée des services proposés',
              is_available: true,
              management_fee: 0,
              comment:
                'Expertise Data Science avec accès aux derniers outils et formations spécialisées',
            },
          ],
          selected_organismes: [
            {
              organisme_id: urssafItg.id,
              label: 'URSSAF',
              total_patronal: 3200.75,
              total_salarial: 2100.5,
            },
            {
              organisme_id: poleEmploiItg.id,
              label: 'Pôle Emploi',
              total_patronal: 850.25,
              total_salarial: 580.75,
            },
          ],
        },
      },
    });

    // Link company responses to organismes (simplified - detailed data is now in response_data JSON)
    await prisma.companyResponseOrganisme.createMany({
      data: [
        // Response 1 STA organismes
        { company_response_id: response1Sta.id, organisme_id: urssafSta.id },
        { company_response_id: response1Sta.id, organisme_id: poleEmploiSta.id },
        { company_response_id: response1Sta.id, organisme_id: retraiteSta.id },

        // Response 1 ITG organismes
        { company_response_id: response1Itg.id, organisme_id: urssafItg.id },
        { company_response_id: response1Itg.id, organisme_id: poleEmploiItg.id },

        // Response 1 FreelancePlus organismes
        { company_response_id: response1Freelance.id, organisme_id: urssafSta.id },

        // Response 2 STA organismes
        { company_response_id: response2Sta.id, organisme_id: urssafSta.id },
        { company_response_id: response2Sta.id, organisme_id: poleEmploiSta.id },
        { company_response_id: response2Sta.id, organisme_id: retraiteSta.id },

        // Response 3 ITG organismes
        { company_response_id: response3Itg.id, organisme_id: urssafItg.id },
        { company_response_id: response3Itg.id, organisme_id: poleEmploiItg.id },

        // Response 4 ITG organismes (Data Science mission)
        { company_response_id: response4Itg.id, organisme_id: urssafItg.id },
        { company_response_id: response4Itg.id, organisme_id: poleEmploiItg.id },

        // Response 5 FreelancePlus organismes
        { company_response_id: response5Freelance.id, organisme_id: urssafSta.id },
        { company_response_id: response5Freelance.id, organisme_id: poleEmploiSta.id },
      ],
    });

    logger.info('Données de portage salarial créées avec succès!', {
      summary: {
        users: {
          admin: adminUser.id,
          companyAdmins: [staAdminUser.id, itgAdminUser.id, freelanceAdminUser.id],
          managers: [managerUser1.id, managerUser2.id],
          freelancers: [
            freelanceUser1.id,
            freelanceUser2.id,
            freelanceUser3.id,
            freelanceUser4.id,
            freelanceUser5.id,
          ],
        },
        companies: {
          staPortage: staPortage.id,
          itgPortage: itgPortage.id,
          freelancePlus: freelancePlus.id,
        },
        metiers: 10,
        portageAssociations: [peps.id, feps.id, sneps.id],
        platformServices: 7,
        freelanceRequests: 5,
        companyResponses: 5,
        organismes: {
          staPortage: [urssafSta.id, poleEmploiSta.id, retraiteSta.id],
          itgPortage: [urssafItg.id, poleEmploiItg.id],
        },
        cotisations: 6,
      },
      statistics: {
        totalUsers: 13,
        totalCompanies: 3,
        totalFreelancers: 5,
        totalRequests: 5,
        totalResponses: 5,
        averageManagementFee: 7.7,
      },
      notes: [
        'Tous les mots de passe sont: Admin123!',
        'Les sociétés de portage sont certifiées',
        'Les freelancers ont des profils variés',
        'Les cotisations sociales sont réalistes',
        'Les réponses incluent des détails financiers',
      ],
    });
  } catch (e) {
    logger.error('Erreur lors du seeding de la base de données', e as Error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
