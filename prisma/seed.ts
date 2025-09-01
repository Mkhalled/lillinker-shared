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
  description?: string;
  logo?: string;
  siret?: string;
  consultant_count: number;
  management_min?: number;
  management_max?: number;
  is_portage?: boolean;
  date_creation?: Date;
  chiffre_affaires?: number;
  adresse?: string;
  site_web?: string;
  convention_collective?: string;
  code_naf_ape?: string;
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
    await prisma.requestLabelSelected.deleteMany();
    await prisma.freelanceRequest.deleteMany();
    await prisma.companyService.deleteMany();
    await prisma.platformServiceData.deleteMany();
    await prisma.platformService.deleteMany();
    await prisma.secteurActiviteCompany.deleteMany();
    await prisma.companyLabel.deleteMany();
    await prisma.companyManager.deleteMany();
    await prisma.freelance.deleteMany();
    await prisma.cotisation.deleteMany();
    await prisma.organisme.deleteMany();
    await prisma.company.deleteMany();
    await prisma.secteurActivite.deleteMany();
    await prisma.labelSyndicat.deleteMany();
    await prisma.session.deleteMany();
    await prisma.account.deleteMany();
    await prisma.user.deleteMany();
    // Secteur d'activité
    const IT = await prisma.secteurActivite.create({
      data: { code: 'IT', name: 'IT - Digital' },
    });
    const ACCOUNTING = await prisma.secteurActivite.create({
      data: { code: 'ACCOUNTING', name: 'Gestion - comptabilité' },
    });
    const FINANCE = await prisma.secteurActivite.create({
      data: { code: 'FINANCE', name: 'Finance, banque et assurances' },
    });
    const MARKETING = await prisma.secteurActivite.create({
      data: { code: 'MARKETING', name: 'Marketing' },
    });
    const HR = await prisma.secteurActivite.create({
      data: { code: 'HR', name: 'Ressources humaines' },
    });
    const EVENT = await prisma.secteurActivite.create({
      data: { code: 'EVENT', name: 'Événementiel' },
    });
    const BUILDING = await prisma.secteurActivite.create({
      data: { code: 'BUILDING', name: 'BTP' },
    });
    const REAL_ESTATE = await prisma.secteurActivite.create({
      data: { code: 'REAL_ESTATE', name: 'Immobilier' },
    });
    const AUTOMOTIVE = await prisma.secteurActivite.create({
      data: { code: 'AUTOMOTIVE', name: 'Automobile' },
    });
    const PERSONAL_SERVICES = await prisma.secteurActivite.create({
      data: { code: 'PERSONAL_SERVICES', name: 'Service à la personne' },
    });
    const SPORT = await prisma.secteurActivite.create({
      data: { code: 'SPORT', name: 'Sport' },
    });
    const OTHER = await prisma.secteurActivite.create({
      data: { code: 'OTHER', name: 'Autre' },
    });
    // Create platform admin user (no company affiliation)
    const adminPlateforme = await createUser({
      first_name: 'Admin',
      last_name: 'Plateforme',
      email: 'admin@lillinker.com',
      phone_number: '+33123456789',
      role: 'ADMIN',
      status: true,
      email_verified: true,
      sex: 'MALE',
    });
    // Create Consultant profil
    const adminUnitPortageCompany = await createUser({
      first_name: 'Ludovic',
      last_name: 'DA SILVA',
      email: 'l.dasilva@unit-portage.fr',
      role: 'COMPANY',
      phone_number: '+33123456792',
      status: true,
      email_verified: true,
      sex: 'MALE',
    });
    // Create freelance users
    const freelanceUser1 = await createUser({
      first_name: 'Khalled',
      last_name: 'Meneouali',
      email: 'khalled.men@gmail.com',
      role: 'FREELANCE',
      phone_number: '+33123456792',
      status: true,
      email_verified: true,
      sex: 'MALE',
    });
    // Create freelance profiles
    const freelance1 = await prisma.freelance.create({
      data: {
        freelance_id: freelanceUser1.id,
        secteur_activite_id: IT.id,
      },
    });
    // Create the main portage companies
    const unitPortage = await createCompany({
      admin_user_id: adminUnitPortageCompany.id,
      name: 'UNIT PORTAGE',
      description:
        "UNIT PORTAGE est une société de portage salarial à taille humaine, qui a pour mission d'accompagner les travailleurs indépendants dans la réussite de leur activité. Nous sommes fiers de mettre en avant l'accompagnement, la transparence et l'éthique dans toutes les actions de notre entreprise. Notre modèle de portage salarial est basé sur une transparence totale. Nous vous donnons toutes les informations nécessaires pour comprendre les coûts liés à notre prestation et vous garantissons qu'il n'y a aucuns frais cachés sur nos frais de gestion et aucun charges sociales supplémentaire",
      logo: 'https://lillinker.com/logos/sta-portage.png',
      siret: '900571803',
      consultant_count: 90,
      management_min: 5,
      management_max: 10,
      is_portage: true,
      date_creation: new Date('2015-03-15'),
      chiffre_affaires: 2500000,
      adresse: '123 Rue de la République, 75011 Paris',
      site_web: 'https://unit-portage.fr',
      convention_collective: 'Convention collective du portage salarial',
      code_naf_ape: '7830Z',
    });
    // Link companies to secteurs activités
    await prisma.secteurActiviteCompany.createMany({
      data: [
        { company_id: unitPortage.id, secteur_activite_id: IT.id },
        { company_id: unitPortage.id, secteur_activite_id: ACCOUNTING.id },
        { company_id: unitPortage.id, secteur_activite_id: FINANCE.id },
        { company_id: unitPortage.id, secteur_activite_id: MARKETING.id },
        { company_id: unitPortage.id, secteur_activite_id: HR.id },
        { company_id: unitPortage.id, secteur_activite_id: EVENT.id },
        { company_id: unitPortage.id, secteur_activite_id: BUILDING.id },
        { company_id: unitPortage.id, secteur_activite_id: REAL_ESTATE.id },
        { company_id: unitPortage.id, secteur_activite_id: AUTOMOTIVE.id },
        { company_id: unitPortage.id, secteur_activite_id: PERSONAL_SERVICES.id },
        { company_id: unitPortage.id, secteur_activite_id: SPORT.id },
        { company_id: unitPortage.id, secteur_activite_id: OTHER.id },
      ],
    });
    // Create label syndicats
    const peps = await prisma.labelSyndicat.create({
      data: {
        name: "PEPS (Syndicat des Professionnels de l'Emploi)",
        description: 'Syndicat national des entreprises de portage salarial en France',
        logo: 'https://example.com/logos/peps.png',
      },
    });
    const feps = await prisma.labelSyndicat.create({
      data: {
        name: 'FEPS (Fédération des Entreprises de Portage Salarial)',
        description: 'Fédération regroupant les principales entreprises de portage salarial',
        logo: 'https://example.com/logos/feps.png',
      },
    });
    const sneps = await prisma.labelSyndicat.create({
      data: {
        name: 'SNEPS (Syndicat National des Entreprises de Portage Salarial)',
        description:
          'Organisation professionnelle représentant les entreprises de portage salarial',
        logo: null,
      },
    });
    // Link portage companies to professional associations
    await prisma.companyLabel.createMany({
      data: [
        { company_id: unitPortage.id, label_syndicat_id: peps.id },
        { company_id: unitPortage.id, label_syndicat_id: feps.id },
        { company_id: unitPortage.id, label_syndicat_id: sneps.id },
      ],
    });
    // Create platform services for portage salarial with PlatformServiceData
    const platformService1 = await prisma.platformService.create({
      data: {
        user_id: adminPlateforme.id,
        label: 'Une avance sur salaire',
        description: "Paiement mensuel même si le client n'a pas encore réglé la facture",
        requires_data: false,
        status: 'ACTIVE',
        dataFields: {
          create: [],
        },
      },
    });
    const platformService2 = await prisma.platformService.create({
      data: {
        user_id: adminPlateforme.id,
        label: 'Une fin de contrat avec rupture conventionnelle',
        description:
          "La rupture conventionnelle est une modalité de fin de contrat amiable entre le salarié porté et la société de portage. Elle permet de mettre fin au CDI de portage salarial (s'il existe) d'un commun accord, tout en donnant droit aux allocations chômage.",
        requires_data: false,
        status: 'ACTIVE',
        dataFields: {
          create: [],
        },
      },
    });
    const platformService3 = await prisma.platformService.create({
      data: {
        user_id: adminPlateforme.id,
        label: 'Un interlocuteur unique dédié',
        description:
          "Bénéficiez d'un interlocuteur unique dédié qui connaît votre dossier et vous accompagne au quotidien. Vous gagnez en réactivité, en simplicité et en sérénité dans la gestion de vos missions et de votre rémunération.",
        requires_data: false,
        status: 'ACTIVE',
        dataFields: {
          create: [],
        },
      },
    });
    const platformService4 = await prisma.platformService.create({
      data: {
        user_id: adminPlateforme.id,
        label: 'Rétrocession de la TVA sur frais professionnels',
        description:
          'Possibilité de récupérer la TVA payée sur vos dépenses professionnelles (déplacements, matériel, abonnements…), ce qui réduit directement le coût réel de vos frais.',
        requires_data: false,
        status: 'ACTIVE',
        dataFields: {
          create: [],
        },
      },
    });
    const platformService5 = await prisma.platformService.create({
      data: {
        user_id: adminPlateforme.id,
        label: 'Prise en charge des indemnités kilométriques',
        description:
          'Remboursement de vos déplacements professionnels avec véhicule personnel, calculé selon le barème fiscal officiel (nombre de kilomètres et puissance fiscale du véhicule).',
        requires_data: true,
        status: 'ACTIVE',
        dataFields: {
          create: [
            {
              label: 'Nombre de kilomètres',
              description: 'Nombre de kilomètres effectués pour la mission',
              data_type: 'NUMBER',
            },
          ],
        },
      },
    });
    // Create company services
    await prisma.companyService.createMany({
      data: [
        { company_id: unitPortage.id, service_id: platformService1.id, is_active: true },
        { company_id: unitPortage.id, service_id: platformService2.id, is_active: true },
        { company_id: unitPortage.id, service_id: platformService3.id, is_active: true },
        { company_id: unitPortage.id, service_id: platformService4.id, is_active: true },
        { company_id: unitPortage.id, service_id: platformService5.id, is_active: true },
      ],
    });
    // Create organismes sociaux and cotisations for each company
    const urssafSecSoc = await prisma.organisme.create({
      data: {
        company_id: unitPortage.id,
        label: 'URSSAF – Sécurité sociale',
        description: 'Cotisations sociales pour financer la Sécurité sociale.',
      },
    });
    const csgCrds = await prisma.organisme.create({
      data: {
        company_id: unitPortage.id,
        label: 'CSG / CRDS',
        description:
          'Contribution Sociale Généralisée & Contribution au Remboursement de la Dette Sociale',
      },
    });
    const franceTravail = await prisma.organisme.create({
      data: {
        company_id: unitPortage.id,
        label: 'France Travail',
        description: "Gère l'assurance chômage.",
      },
    });
    const retraiteComplementaire = await prisma.organisme.create({
      data: {
        company_id: unitPortage.id,
        label: 'AGIRC-ARRCO',
        description: 'Retraite complémentaire',
      },
    });
    const autresContributions = await prisma.organisme.create({
      data: {
        company_id: unitPortage.id,
        label: 'Autres contributions',
        description: 'Autres contributions',
      },
    });
    const rcPro = await prisma.organisme.create({
      data: {
        company_id: unitPortage.id,
        label: 'RC Pro (Responsabilité civile professionnelle)',
        description:
          "Couvrir les risques liés à l'activité du consultant (erreurs, litiges client).",
      },
    });
    // Create cotisations
    await prisma.cotisation.createMany({
      data: [
        {
          organisme_id: urssafSecSoc.id,
          label: 'Maladie, maternité, invalidité, décès',
          description:
            "Financement des soins de santé, arrêts maladie, maternité/paternité, indemnités en cas d'invalidité ou décès.",
          type: 'PATRONAL',
          pourcentage_salarial: 7,
        },
        {
          organisme_id: urssafSecSoc.id,
          label: 'Vieillesse plafonnée',
          description:
            'Cotisation retraite de base sur le salaire dans la limite du plafond Sécurité sociale (~3 864 €/mois en 2025).',
          type: 'DEUX',
          pourcentage_salarial: 6.9,
          pourcentage_patronal: 8.55,
        },
        {
          organisme_id: urssafSecSoc.id,
          label: 'Vieillesse déplafonnée',
          description:
            'Cotisation retraite de base sur la totalité du salaire (au-delà du plafond).',
          type: 'DEUX',
          pourcentage_salarial: 0.4,
          pourcentage_patronal: 1.9,
        },
        {
          organisme_id: urssafSecSoc.id,
          label: 'Allocations familiales',
          description: 'Financement des aides aux familles (allocations CAF).',
          type: 'PATRONAL',
          pourcentage_patronal: 3.45,
        },
        {
          organisme_id: urssafSecSoc.id,
          label: 'Accident du travail',
          description:
            "Financement des indemnités en cas d'accidents professionnels ou maladies professionnelles.",
          type: 'PATRONAL',
          pourcentage_patronal: 0.9,
        },
        {
          organisme_id: csgCrds.id,
          label: 'CSG déductible',
          description: 'CSG déductible',
          type: 'SALARIAL',
          pourcentage_salarial: 6.8,
        },
        {
          organisme_id: csgCrds.id,
          label: 'CSG/CRDS non déductible',
          description: 'CSG/CRDS non déductible',
          type: 'SALARIAL',
          pourcentage_salarial: 2.9,
        },
        {
          organisme_id: franceTravail.id,
          label: 'Assurance chômage',
          description: 'Financement des allocations chômage',
          type: 'PATRONAL',
          pourcentage_patronal: 4.05,
        },
        {
          organisme_id: franceTravail.id,
          label:
            'AGS (Association pour la Gestion du régime de garantie des créances des Salariés)',
          description: "Couvre les salaires impayés en cas de faillite de l'employeur.",
          type: 'PATRONAL',
          pourcentage_patronal: 0.15,
        },
        {
          organisme_id: retraiteComplementaire.id,
          label: "Tranche 1 (jusqu'à 1 PASS ~3 864 €/mois)",
          description:
            "Retraite complémentaire pour les salaires jusqu'à 1 PASS (Plafond Annuel de la Sécurité Sociale)",
          type: 'DEUX',
          pourcentage_salarial: 3.15,
          pourcentage_patronal: 4.72,
        },
        {
          organisme_id: retraiteComplementaire.id,
          label: 'Tranche 2 (entre 1 et 8 PASS)',
          description:
            'Retraite complémentaire pour les salaires entre 1 et 8 PASS (Plafond Annuel de la Sécurité Sociale)',
          type: 'DEUX',
          pourcentage_salarial: 8.64,
          pourcentage_patronal: 12.95,
        },
        {
          organisme_id: retraiteComplementaire.id,
          label: "CEG (Contribution d'Équilibre Général)",
          description:
            "Cotisation additionnelle pour assurer l'équilibre financier du régime de retraite complémentaire.",
          type: 'DEUX',
          pourcentage_salarial: 0.86,
          pourcentage_patronal: 1.29,
        },
        {
          organisme_id: retraiteComplementaire.id,
          label: 'CET (Contribution Équilibre Technique)',
          description:
            'Cotisation exceptionnelle pour compenser les déficits temporaires du régime de retraite complémentaire.',
          type: 'DEUX',
          pourcentage_salarial: 0.14,
          pourcentage_patronal: 0.21,
        },
        {
          organisme_id: autresContributions.id,
          label: "FNAL (Fonds National d'Aide au Logement)",
          description: 'Financement des aides au logement pour les salariés.',
          type: 'PATRONAL',
          pourcentage_patronal: 0.1,
        },
        {
          organisme_id: autresContributions.id,
          label: 'Formation professionnelle',
          description: 'Financement de la formation continue des salariés.',
          type: 'PATRONAL',
          pourcentage_patronal: 0.55,
        },
        {
          organisme_id: autresContributions.id,
          label: "Taxe d'apprentissage",
          description: 'Financement des formations technologiques et professionnelles.',
          type: 'PATRONAL',
          pourcentage_patronal: 0.68,
        },
        {
          organisme_id: autresContributions.id,
          label: 'Mutuelle obligatoire',
          description: 'Financement de la complémentaire santé obligatoire pour les salariés.',
          type: 'DEUX',
          pourcentage_patronal: 0,
          pourcentage_salarial: 0,
        },
        {
          organisme_id: autresContributions.id,
          label: 'Prévoyance',
          description: 'Financement des garanties prévoyance (incapacité, invalidité, décès).',
          type: 'PATRONAL',
          pourcentage_patronal: 1.5,
        },
        {
          organisme_id: rcPro.id,
          label: 'RC Pro (Responsabilité civile professionnelle)',
          description:
            "Couvrir les risques liés à l'activité du consultant (erreurs, litiges client).",
          type: 'PATRONAL',
          pourcentage_patronal: 0,
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
    // Link freelance requests to label syndicat preferences
    await prisma.requestLabelSelected.createMany({
      data: [
        { freelance_request_id: freelanceRequest1.id, label_syndicat_id: peps.id },
        { freelance_request_id: freelanceRequest1.id, label_syndicat_id: feps.id },
      ],
    });
    // Create freelance request options
    await prisma.freelanceRequestOption.createMany({
      data: [
        {
          freelance_request_id: freelanceRequest1.id,
          service_option_id: platformService1.id,
          is_required: true,
          response_data: {
            text: 'Recherche le meilleur taux de gestion possible pour une mission de 30 jours',
          },
        },
      ],
    });
    // Create company responses
    const response1UnitPortage = await prisma.companyResponse.create({
      data: {
        request_id: freelanceRequest1.id,
        company_id: unitPortage.id,
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
              organisme_id: urssafSecSoc.id,
              label: 'URSSAF',
              total_patronal: 1850.5,
              total_salarial: 1200.75,
            },
            {
              organisme_id: franceTravail.id,
              label: 'Pôle Emploi',
              total_patronal: 420.0,
              total_salarial: 285.5,
            },
            {
              organisme_id: retraiteComplementaire.id,
              label: 'Caisse de Retraite',
              total_patronal: 650.25,
              total_salarial: 485.75,
            },
          ],
        },
      },
    });
    // Link company responses to organismes
    await prisma.companyResponseOrganisme.createMany({
      data: [
        { company_response_id: response1UnitPortage.id, organisme_id: urssafSecSoc.id },
        { company_response_id: response1UnitPortage.id, organisme_id: franceTravail.id },
        { company_response_id: response1UnitPortage.id, organisme_id: retraiteComplementaire.id },
      ],
    });
    logger.info('Database seeded successfully with updated schema!');
  } catch (e) {
    logger.error('Erreur lors du seeding de la base de données', e as Error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}
main();
