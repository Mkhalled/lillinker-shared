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

    // tables de references

    // <option value="IT" selected="">IT - Digital</option>
    // <option value="ACCOUNTING">Gestion - comptabilité</option>
    // <option value="FINANCE">Finance, banque et assurances</option>
    // <option value="MARKETING">Marketing</option>
    // <option value="HR">Ressources humaines</option>
    // <option value="EVENT">Événementiel</option>
    // <option value="BUILDING">BTP</option>
    // <option value="REAL_ESTATE">Immobilier</option>
    //<option value="AUTOMOTIVE">Automobile</option>
    // <option value="PERSONAL_SERVICES">Service à la personne</option>
    // <option value="SPORT">Sport</option>
    // <option value="OTHER">Autre</option>

    // Secteur d'activité
    const IT = await prisma.metier.create({
      data: { name: 'IT - Digital' },
    });

    const ACCOUNTING = await prisma.metier.create({
      data: { name: 'Gestion - comptabilité' },
    });

    const FINANCE = await prisma.metier.create({
      data: { name: 'Finance, banque et assurances' },
    });

    const MARKETING = await prisma.metier.create({
      data: { name: 'Marketing' },
    });

    const HR = await prisma.metier.create({
      data: { name: 'Ressources humaines' },
    });

    const EVENT = await prisma.metier.create({
      data: { name: 'Événementiel' },
    });

    const BUILDING = await prisma.metier.create({
      data: { name: 'BTP' },
    });

    const REAL_ESTATE = await prisma.metier.create({
      data: { name: 'Immobilier' },
    });

    const AUTOMOTIVE = await prisma.metier.create({
      data: { name: 'Automobile' },
    });

    const PERSONAL_SERVICES = await prisma.metier.create({
      data: { name: 'Service à la personne' },
    });
    const SPORT = await prisma.metier.create({
      data: { name: 'Sport' },
    });
    const OTHER = await prisma.metier.create({
      data: { name: 'Autre' },
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

    //
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
      first_name: 'khalled',
      last_name: 'meneouali',
      email: 'khalled.men@gmail.com',
      role: 'FREELANCE',
      phone_number: '+33123456792',
      status: true,
      email_verified: true,
      sex: 'MALE',
    });

    // const freelanceUser1 = await createUser({
    //   first_name: 'Marie',
    //   last_name: 'Dubois',
    //   email: 'marie.dubois@example.com',
    //   phone_number: '+33123456793',
    //   role: 'FREELANCE',
    //   status: true,
    //   email_verified: true,
    //   sex: 'FEMALE',
    // });

    // const freelanceUser2 = await createUser({
    //   first_name: 'Pierre',
    //   last_name: 'Martin',
    //   email: 'pierre.martin@example.com',
    //   phone_number: '+33123456794',
    //   role: 'FREELANCE',
    //   status: true,
    //   email_verified: true,
    //   sex: 'MALE',
    // });

    // const freelanceUser3 = await createUser({
    //   first_name: 'Sophie',
    //   last_name: 'Legrand',
    //   email: 'sophie.legrand@example.com',
    //   phone_number: '+33123456795',
    //   role: 'FREELANCE',
    //   status: true,
    //   email_verified: false,
    //   sex: 'FEMALE',
    // });

    // const freelanceUser4 = await createUser({
    //   first_name: 'Thomas',
    //   last_name: 'Moreau',
    //   email: 'thomas.moreau@example.com',
    //   phone_number: '+33123456796',
    //   role: 'FREELANCE',
    //   status: true,
    //   email_verified: true,
    //   sex: 'MALE',
    // });

    // const freelanceUser5 = await createUser({
    //   first_name: 'Julie',
    //   last_name: 'Bernard',
    //   email: 'julie.bernard@example.com',
    //   phone_number: '+33123456797',
    //   role: 'FREELANCE',
    //   status: true,
    //   email_verified: false,
    //   sex: 'FEMALE',
    // });

    // Create freelance profiles
    const freelance1 = await prisma.freelance.create({
      data: {
        freelance_id: freelanceUser1.id,
        metier_id: IT.id,
      },
    });

    // const freelance2 = await prisma.freelance.create({
    //   data: {
    //     freelance_id: freelanceUser2.id,
    //     metier_id: metierConsultant.id,
    //   },
    // });

    // const freelance3 = await prisma.freelance.create({
    //   data: {
    //     freelance_id: freelanceUser3.id,
    //     metier_id: metierDesigner.id,
    //   },
    // });

    // const freelance4 = await prisma.freelance.create({
    //   data: {
    //     freelance_id: freelanceUser4.id,
    //     metier_id: metierDataScientist.id,
    //   },
    // });

    // const freelance5 = await prisma.freelance.create({
    //   data: {
    //     freelance_id: freelanceUser5.id,
    //     metier_id: metierMarketing.id,
    //   },
    // });

    // Create company admin users for each portage company
    // const staAdminUser = await createUser({
    //   first_name: 'Sophie',
    //   last_name: 'Directeur',
    //   email: 'directeur@sta-portage.com',
    //   role: 'COMPANY',
    //   phone_number: '+33123456790',
    //   status: true,
    //   email_verified: true,
    //   sex: 'FEMALE',
    // });

    // const itgAdminUser = await createUser({
    //   first_name: 'Marc',
    //   last_name: 'Responsable',
    //   email: 'commercial@itg-portage.com',
    //   role: 'COMPANY',
    //   phone_number: '+33123456791',
    //   status: true,
    //   email_verified: true,
    //   sex: 'MALE',
    // });

    // const freelanceAdminUser = await createUser({
    //   first_name: 'Claire',
    //   last_name: 'Laurent',
    //   email: 'contact@freelance-plus.com',
    //   role: 'COMPANY',
    //   phone_number: '+33123456792',
    //   status: true,
    //   email_verified: true,
    //   sex: 'FEMALE',
    // });

    // Create the main portage companies
    const unitPortage = await createCompany({
      admin_user_id: adminUnitPortageCompany.id,
      name: 'UNIT PORTAGE',
      description:
        'UNIT PORTAGE est une société de portage salarial à taille humaine, qui a pour mission d’accompagner les travailleurs indépendants dans la réussite de leur activité. Nous sommes fiers de mettre en avant l’accompagnement, la transparence et l’éthique dans toutes les actions de notre entreprise. Notre modèle de portage salarial est basé sur une transparence totale. Nous vous donnons toutes les informations nécessaires pour comprendre les coûts liés à notre prestation et vous garantissons qu’il n’y a aucuns frais cachés sur nos frais de gestion et aucun charges sociales supplémentaire',
      logo: 'https://lillinker.com/logos/sta-portage.png',
      siret: '900571803',
      consultant_count: 90,
      management_fees: 5,
      is_portage: true,
    });

    // Link companies to metiers (many-to-many relationship)
    await prisma.companyMetier.createMany({
      data: [
        // unitPortage
        { company_id: unitPortage.id, metier_id: IT.id },
        { company_id: unitPortage.id, metier_id: ACCOUNTING.id },
        { company_id: unitPortage.id, metier_id: FINANCE.id },
        { company_id: unitPortage.id, metier_id: MARKETING.id },
        { company_id: unitPortage.id, metier_id: HR.id },
        { company_id: unitPortage.id, metier_id: EVENT.id },
        { company_id: unitPortage.id, metier_id: BUILDING.id },
        { company_id: unitPortage.id, metier_id: REAL_ESTATE.id },
        { company_id: unitPortage.id, metier_id: AUTOMOTIVE.id },
        { company_id: unitPortage.id, metier_id: PERSONAL_SERVICES.id },
        { company_id: unitPortage.id, metier_id: SPORT.id },
        { company_id: unitPortage.id, metier_id: OTHER.id },
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
        { company_id: unitPortage.id, portage_id: peps.id },
        { company_id: unitPortage.id, portage_id: feps.id },
        { company_id: unitPortage.id, portage_id: sneps.id },
      ],
    });

    // // Create manager users
    // const managerUser1 = await createUser({
    //   first_name: 'Claire',
    //   last_name: 'Laurent',
    //   email: 'claire.laurent@sta-portage.com',
    //   role: 'MANAGER',
    //   phone_number: '+33123456798',
    //   status: true,
    //   email_verified: true,
    //   sex: 'FEMALE',
    // });

    // const managerUser2 = await createUser({
    //   first_name: 'Antoine',
    //   last_name: 'Dupont',
    //   email: 'antoine.dupont@itg-portage.com',
    //   role: 'MANAGER',
    //   phone_number: '+33123456799',
    //   status: true,
    //   email_verified: true,
    //   sex: 'MALE',
    // });

    // // Create company manager relationships
    // await prisma.companyManager.createMany({
    //   data: [
    //     { company_id: staPortage.id, user_id: managerUser1.id },
    //     { company_id: itgPortage.id, user_id: managerUser2.id },
    //   ],
    // });

    // Create platform services for portage salarial
    const platformService1 = await prisma.platformService.create({
      data: {
        user_id: adminPlateforme.id,
        label: 'Une avance sur salaire',
        description: 'paiement mensuel même si le client n’a pas encore réglé la facture',
        data_type: 'NUMBER',
        requires_data: false,
        data_label: '',
        data_description: '',
        status: 'ACTIVE',
      },
    });
    const platformService2 = await prisma.platformService.create({
      data: {
        user_id: adminPlateforme.id,
        label: 'Une fin de contrat avec repture conventionnel ',
        description:
          'La rupture conventionnelle est une modalité de fin de contrat amiable entre le salarié porté et la société de portage.Elle permet de mettre fin au CDI de portage salarial (s’il existe) d’un commun accord, tout en donnant droit aux allocations chômage.',
        data_type: 'NUMBER',
        requires_data: false,
        data_label: '',
        data_description: '',
        status: 'ACTIVE',
      },
    });
    const platformService3 = await prisma.platformService.create({
      data: {
        user_id: adminPlateforme.id,
        label: 'Un interlocuteur unique dédié',
        description:
          'Bénéficiez d’un interlocuteur unique dédié qui connaît votre dossier et vous accompagne au quotidien. Vous gagnez en réactivité, en simplicité et en sérénité dans la gestion de vos missions et de votre rémunération.',
        data_type: 'NUMBER',
        requires_data: false,
        data_label: '',
        data_description: '',
        status: 'ACTIVE',
      },
    });
    const platformService4 = await prisma.platformService.create({
      data: {
        user_id: adminPlateforme.id,
        label: 'Rétrocession de la TVA sur frais professionnels',
        description:
          'Possibilité de récupérer la TVA payée sur vos dépenses professionnelles (déplacements, matériel, abonnements…), ce qui réduit directement le coût réel de vos frais.',
        data_type: 'NUMBER',
        requires_data: false,
        data_label: '',
        data_description: '',
        status: 'ACTIVE',
      },
    });
    const platformService5 = await prisma.platformService.create({
      data: {
        user_id: adminPlateforme.id,
        label: 'Prise en charge des indemnités kilométriques',
        description:
          'Remboursement de vos déplacements professionnels avec véhicule personnel, calculé selon le barème fiscal officiel (nombre de kilomètres et puissance fiscale du véhicule).',
        data_type: 'NUMBER',
        requires_data: true,
        data_label: 'nombre de kilomètres',
        data_description: 'nombre de kilomètres effectués pour la mission',
        status: 'ACTIVE',
      },
    });

    // const platformService2 = await prisma.platformService.create({
    //   data: {
    //     user_id: adminPlateforme.id,
    //     label: 'Services Inclus',
    //     description: 'Services additionnels proposés par la société de portage',
    //      data_type: 'SELECT',
    //     requires_data: false,
    //     data_label: 'Services proposés',
    //     data_description: 'Sélectionnez les services inclus dans votre offre',
    //     choices: [
    //       'Assurance RC Pro',
    //       'Formation continue',
    //       'Assistance juridique',
    //       'Gestion administrative',
    //       'Accompagnement commercial',
    //       'Mutuelle collective',
    //       'Prévoyance',
    //       'CSE (Comité Social et Économique)',
    //    ],
    //     status: 'ACTIVE',
    //   },
    // });

    // const platformService3 = await prisma.platformService.create({
    //   data: {
    //     user_id: adminPlateforme.id,
    //     label: 'Délai de Paiement',
    //     description: 'Délai de versement du salaire après facturation client',
    //     data_type: 'SELECT',
    //     requires_data: true,
    //     data_label: 'Délai de paiement',
    //     data_description: 'Délai habituel pour le versement du salaire',
    //     choices: ['15 jours', '30 jours', '45 jours', '60 jours'],
    //     status: 'ACTIVE',
    //   },
    // });

    // const platformService4 = await prisma.platformService.create({
    //   data: {
    //     user_id: adminPlateforme.id,
    //     label: 'Frais de Dossier',
    //     description: "Frais d'ouverture et de gestion du dossier consultant",
    //     data_type: 'NUMBER',
    //     requires_data: false,
    //     data_label: 'Frais de dossier (€)',
    //     data_description: "Montant des frais d'ouverture de dossier",
    //     status: 'ACTIVE',
    //   },
    // });

    // const platformService5 = await prisma.platformService.create({
    //   data: {
    //     user_id: adminPlateforme.id,
    //     label: 'Type de Contrat',
    //     description: 'Type de contrat de portage proposé',
    //     data_type: 'RADIO',
    //     requires_data: true,
    //     data_label: 'Type de contrat',
    //     data_description: 'Sélectionnez le type de contrat de portage',
    //     choices: ['CDI', 'CDD'],
    //     status: 'ACTIVE',
    //   },
    // });

    // const platformService6 = await prisma.platformService.create({
    //   data: {
    //     user_id: adminPlateforme.id,
    //     label: 'Description des Services',
    //     description: 'Description détaillée des services proposés par la société de portage',
    //     data_type: 'TEXT',
    //     requires_data: false,
    //     data_label: 'Description des services',
    //     data_description: 'Décrivez en détail les services que vous proposez aux consultants',
    //     status: 'ACTIVE',
    //   },
    // });

    // const platformService7 = await prisma.platformService.create({
    //   data: {
    //     user_id: adminPlateforme.id,
    //     label: 'Avance sur Salaire',
    //     description: "Possibilité d'obtenir une avance sur le salaire en cours de mission",
    //     data_type: 'RADIO',
    //     requires_data: true,
    //     data_label: 'Avance sur salaire disponible',
    //     data_description: 'Proposez-vous des avances sur salaire ?',
    //     choices: ['Oui', 'Non', 'Selon conditions'],
    //     status: 'ACTIVE',
    //   },
    // });

    // Create company services
    await prisma.companyService.createMany({
      data: [
        // unitPortage services
        { company_id: unitPortage.id, service_id: platformService1.id, is_active: true },
        { company_id: unitPortage.id, service_id: platformService2.id, is_active: true },
        { company_id: unitPortage.id, service_id: platformService3.id, is_active: true },
        { company_id: unitPortage.id, service_id: platformService4.id, is_active: true },
        { company_id: unitPortage.id, service_id: platformService5.id, is_active: true },
      ],
    });

    // Create organismes sociaux and cotisations for each company
    // unitPortage organismes
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
        description: 'Gère l’assurance chômage.',
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
        label: 'Couvrir les risques liés à l’activité du consultant (erreurs, litiges client).',
        description: 'Autres contributions',
      },
    });

    // Create cotisations
    await prisma.cotisation.createMany({
      data: [
        {
          organisme_id: urssafSecSoc.id,
          label: 'Maladie, maternité, invalidité, décès',
          description:
            'Financement des soins de santé, arrêts maladie, maternité/paternité, indemnités en cas d’invalidité ou décès.',
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
            'Financement des indemnités en cas d’accidents professionnels ou maladies professionnelles.',
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
          description: "'CSG/CRDS non déductible",
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
          description: 'Couvre les salaires impayés en cas de faillite de l’employeur.',
          type: 'PATRONAL',
          pourcentage_patronal: 0.15,
        },

        {
          organisme_id: retraiteComplementaire.id,
          label: 'Tranche 1 (jusqu’à 1 PASS ~3 864 €/mois)',
          description:
            'Retraite complémentaire pour les salaires jusqu’à 1 PASS (Plafond Annuel de la Sécurité Sociale)',
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
          label: 'CEG (Contribution d’Équilibre Général)',
          description:
            'Cotisation additionnelle pour assurer l’équilibre financier du régime de retraite complémentaire.',
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
          label: 'FNAL (Fonds National d’Aide au Logement)',
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
          label: 'Taxe d’apprentissage',
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
            'Couvrir les risques liés à l’activité du consultant (erreurs, litiges client).  ',
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

    // const freelanceRequest2 = await prisma.freelanceRequest.create({
    //   data: {
    //     freelance_id: freelance2.id,
    //     mission_status: 'PENDING',
    //     client_name: 'Cabinet de Conseil Lyon',
    //     client_address: '15 Place Bellecour, 69002 Lyon',
    //     client_sector: 'Conseil et Transformation Digitale',
    //     priority: 'MEDIUM',
    //     tjm: 650.0,
    //     days: 45.0,
    //     wants_portage: true,
    //     want_salaried: false,
    //     start_date: new Date('2025-10-15'),
    //   },
    // });

    // const freelanceRequest3 = await prisma.freelanceRequest.create({
    //   data: {
    //     freelance_id: freelance3.id,
    //     mission_status: 'OPEN',
    //     client_name: 'Startup Innovante',
    //     client_address: "10 Avenue de l'Innovation, 75015 Paris",
    //     client_sector: 'Design et UX',
    //     priority: 'HIGH',
    //     tjm: 450.0,
    //     days: 20.0,
    //     wants_portage: true,
    //     want_salaried: true,
    //     salary: 3800.0,
    //     start_date: new Date('2025-08-20'),
    //   },
    // });

    // const freelanceRequest4 = await prisma.freelanceRequest.create({
    //   data: {
    //     freelance_id: freelance4.id,
    //     mission_status: 'CLOSED',
    //     client_name: 'Entreprise Data',
    //     client_address: '5 Rue des Données, 69003 Lyon',
    //     client_sector: 'Intelligence Artificielle',
    //     priority: 'LOW',
    //     tjm: 700.0,
    //     days: 60.0,
    //     wants_portage: false,
    //     want_salaried: false,
    //     start_date: new Date('2025-07-01'),
    //   },
    // });

    // const freelanceRequest5 = await prisma.freelanceRequest.create({
    //   data: {
    //     freelance_id: freelance5.id,
    //     mission_status: 'OPEN',
    //     client_name: 'Agence Marketing 360',
    //     client_address: '20 Boulevard du Marketing, 33000 Bordeaux',
    //     client_sector: 'Marketing Digital',
    //     priority: 'MEDIUM',
    //     tjm: 400.0,
    //     days: 40.0,
    //     wants_portage: true,
    //     want_salaried: true,
    //     salary: 3200.0,
    //     start_date: new Date('2025-09-15'),
    //   },
    // });

    // Link freelance requests to portage preferences
    await prisma.freelanceRequestPortage.createMany({
      data: [
        { freelance_request_id: freelanceRequest1.id, portage_id: peps.id },
        { freelance_request_id: freelanceRequest1.id, portage_id: feps.id },
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
        // {
        //   freelance_request_id: freelanceRequest1.id,
        //   service_option_id: platformService2.id,
        //   is_required: true,
        //   response_data: {
        //     selected: ['Assurance RC Pro', 'Formation continue', 'Gestion administrative'],
        //   },
        // },
        // {
        //   freelance_request_id: freelanceRequest1.id,
        //   service_option_id: platformService3.id,
        //   is_required: true,
        //   response_data: { selected: '30 jours' },
        // },
        // {
        //   freelance_request_id: freelanceRequest1.id,
        //   service_option_id: platformService5.id,
        //   is_required: false,
        //   response_data: { selected: 'CDI' },
        // },
        // // Request 2 options
        // {
        //   freelance_request_id: freelanceRequest2.id,
        //   service_option_id: platformService1.id,
        //   is_required: true,
        //   response_data: {
        //     text: 'Mission longue durée, recherche taux préférentiel',
        //   },
        // },
        // {
        //   freelance_request_id: freelanceRequest2.id,
        //   service_option_id: platformService2.id,
        //   is_required: true,
        //   response_data: {
        //     selected: ['Assurance RC Pro', 'Assistance juridique', 'Accompagnement commercial'],
        //   },
        // },
        // {
        //   freelance_request_id: freelanceRequest2.id,
        //   service_option_id: platformService7.id,
        //   is_required: false,
        //   response_data: { selected: 'Oui' },
        // },
        // // Request 3 options
        // {
        //   freelance_request_id: freelanceRequest3.id,
        //   service_option_id: platformService1.id,
        //   is_required: true,
        //   response_data: {
        //     text: "Première mission en portage, besoin d'accompagnement",
        //   },
        // },
        // {
        //   freelance_request_id: freelanceRequest3.id,
        //   service_option_id: platformService2.id,
        //   is_required: true,
        //   response_data: {
        //     selected: [
        //       'Assurance RC Pro',
        //       'Formation continue',
        //       'Gestion administrative',
        //       'Mutuelle collective',
        //     ],
        //   },
        // },
        // {
        //   freelance_request_id: freelanceRequest3.id,
        //   service_option_id: platformService3.id,
        //   is_required: true,
        //   response_data: { selected: '15 jours' },
        // },
        // // Request 5 options
        // {
        //   freelance_request_id: freelanceRequest5.id,
        //   service_option_id: platformService1.id,
        //   is_required: true,
        //   response_data: {
        //     text: 'Spécialiste marketing digital, recherche société de portage spécialisée',
        //   },
        // },
        // {
        //   freelance_request_id: freelanceRequest5.id,
        //   service_option_id: platformService2.id,
        //   is_required: false,
        //   response_data: {
        //     selected: ['Formation continue', 'Accompagnement commercial'],
        //   },
        // },
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

    // const response1Itg = await prisma.companyResponse.create({
    //   data: {
    //     request_id: freelanceRequest1.id,
    //     company_id: itgPortage.id,
    //     response_data: {
    //       services: [
    //         {
    //           service_id: platformService1.id,
    //           service_name: 'Taux de Gestion',
    //           service_description: 'Pourcentage prélevé par la société de portage',
    //           is_available: true,
    //           management_fee: 7.8,
    //           comment: 'Taux spécialement compétitif pour les métiers IT',
    //         },
    //         {
    //           service_id: platformService2.id,
    //           service_name: 'Services Inclus',
    //           service_description: 'Services additionnels proposés',
    //           is_available: true,
    //           management_fee: 0,
    //           comment: 'Assurance RC Pro, Assistance juridique, Formation technique',
    //         },
    //         {
    //           service_id: platformService3.id,
    //           service_name: 'Délai de Paiement',
    //           service_description: 'Délai de versement du salaire après facturation',
    //           is_available: true,
    //           management_fee: 0,
    //           comment: '15 jours - Paiement rapide',
    //         },
    //         {
    //           service_id: platformService4.id,
    //           service_name: 'Frais de Dossier',
    //           service_description: "Frais d'ouverture et de gestion du dossier",
    //           is_available: false,
    //           management_fee: 0,
    //           comment: 'Aucun frais de dossier',
    //         },
    //       ],
    //       selected_organismes: [
    //         {
    //           organisme_id: urssafItg.id,
    //           label: 'URSSAF',
    //           total_patronal: 1820.3,
    //           total_salarial: 1180.25,
    //         },
    //         {
    //           organisme_id: poleEmploiItg.id,
    //           label: 'Pôle Emploi',
    //           total_patronal: 410.5,
    //           total_salarial: 275.8,
    //         },
    //       ],
    //     },
    //   },
    // });

    // const response1Freelance = await prisma.companyResponse.create({
    //   data: {
    //     request_id: freelanceRequest1.id,
    //     company_id: freelancePlus.id,
    //     response_data: {
    //       services: [
    //         {
    //           service_id: platformService1.id,
    //           service_name: 'Taux de Gestion',
    //           service_description: 'Pourcentage prélevé par la société de portage',
    //           is_available: true,
    //           management_fee: 6.9,
    //           comment: 'Le meilleur taux du marché',
    //         },
    //         {
    //           service_id: platformService2.id,
    //           service_name: 'Services Inclus',
    //           service_description: 'Services additionnels proposés',
    //           is_available: true,
    //           management_fee: 0,
    //           comment: 'Assurance RC Pro, Plateforme digitale, Support 24/7',
    //         },
    //         {
    //           service_id: platformService3.id,
    //           service_name: 'Délai de Paiement',
    //           service_description: 'Délai de versement du salaire après facturation',
    //           is_available: true,
    //           management_fee: 0,
    //           comment: '15 jours via plateforme digitale',
    //         },
    //         {
    //           service_id: platformService6.id,
    //           service_name: 'Description des Services',
    //           service_description: 'Description détaillée des services proposés',
    //           is_available: true,
    //           management_fee: 0,
    //           comment: 'Portage 100% digital avec interface moderne et intuitive',
    //         },
    //       ],
    //       selected_organismes: [
    //         {
    //           organisme_id: urssafSta.id,
    //           label: 'URSSAF',
    //           total_patronal: 1780.0,
    //           total_salarial: 1150.0,
    //         },
    //       ],
    //     },
    //   },
    // });

    // const response2Sta = await prisma.companyResponse.create({
    //   data: {
    //     request_id: freelanceRequest2.id,
    //     company_id: staPortage.id,
    //     response_data: {
    //       services: [
    //         {
    //           service_id: platformService1.id,
    //           service_name: 'Taux de Gestion',
    //           service_description: 'Pourcentage prélevé par la société de portage',
    //           is_available: true,
    //           management_fee: 8.0,
    //           comment: 'Taux préférentiel pour missions longue durée',
    //         },
    //         {
    //           service_id: platformService2.id,
    //           service_name: 'Services Inclus',
    //           service_description: 'Services additionnels proposés',
    //           is_available: true,
    //           management_fee: 0,
    //           comment:
    //             'Assurance RC Pro, Assistance juridique, Accompagnement commercial, Formation continue',
    //         },
    //         {
    //           service_id: platformService3.id,
    //           service_name: 'Délai de Paiement',
    //           service_description: 'Délai de versement du salaire après facturation',
    //           is_available: true,
    //           management_fee: 0,
    //           comment: '30 jours',
    //         },
    //         {
    //           service_id: platformService4.id,
    //           service_name: 'Frais de Dossier',
    //           service_description: "Frais d'ouverture et de gestion du dossier",
    //           is_available: true,
    //           management_fee: 100,
    //           comment: 'Frais réduits pour mission longue',
    //         },
    //         {
    //           service_id: platformService5.id,
    //           service_name: 'Type de Contrat',
    //           service_description: 'Type de contrat de portage proposé',
    //           is_available: true,
    //           management_fee: 0,
    //           comment: 'CDI disponible pour missions longues',
    //         },
    //       ],
    //       selected_organismes: [
    //         {
    //           organisme_id: urssafSta.id,
    //           label: 'URSSAF',
    //           total_patronal: 2850.5,
    //           total_salarial: 1850.25,
    //         },
    //         {
    //           organisme_id: poleEmploiSta.id,
    //           label: 'Pôle Emploi',
    //           total_patronal: 620.0,
    //           total_salarial: 420.5,
    //         },
    //         {
    //           organisme_id: retraiteSta.id,
    //           label: 'Caisse de Retraite',
    //           total_patronal: 980.75,
    //           total_salarial: 735.25,
    //         },
    //       ],
    //     },
    //   },
    // });

    // const response3Itg = await prisma.companyResponse.create({
    //   data: {
    //     request_id: freelanceRequest3.id,
    //     company_id: itgPortage.id,
    //     response_data: {
    //       services: [
    //         {
    //           service_id: platformService1.id,
    //           service_name: 'Taux de Gestion',
    //           service_description: 'Pourcentage prélevé par la société de portage',
    //           is_available: true,
    //           management_fee: 7.5,
    //           comment: 'Taux spécialisé pour designers UX/UI',
    //         },
    //         {
    //           service_id: platformService2.id,
    //           service_name: 'Services Inclus',
    //           service_description: 'Services additionnels proposés',
    //           is_available: true,
    //           management_fee: 0,
    //           comment:
    //             'Assurance RC Pro, Formation design, Outils Adobe inclus, Mutuelle collective',
    //         },
    //         {
    //           service_id: platformService3.id,
    //           service_name: 'Délai de Paiement',
    //           service_description: 'Délai de versement du salaire après facturation',
    //           is_available: true,
    //           management_fee: 0,
    //           comment: '15 jours',
    //         },
    //         {
    //           service_id: platformService4.id,
    //           service_name: 'Frais de Dossier',
    //           service_description: "Frais d'ouverture et de gestion du dossier",
    //           is_available: true,
    //           management_fee: 50,
    //           comment: 'Frais réduits pour la communauté créative',
    //         },
    //         {
    //           service_id: platformService6.id,
    //           service_name: 'Description des Services',
    //           service_description: 'Description détaillée des services proposés',
    //           is_available: true,
    //           management_fee: 0,
    //           comment: 'Spécialisation design avec accès aux outils Adobe et communauté créative',
    //         },
    //       ],
    //       selected_organismes: [
    //         {
    //           organisme_id: urssafItg.id,
    //           label: 'URSSAF',
    //           total_patronal: 1580.75,
    //           total_salarial: 1050.25,
    //         },
    //         {
    //           organisme_id: poleEmploiItg.id,
    //           label: 'Pôle Emploi',
    //           total_patronal: 350.5,
    //           total_salarial: 240.8,
    //         },
    //       ],
    //     },
    //   },
    // });

    // const response5Freelance = await prisma.companyResponse.create({
    //   data: {
    //     request_id: freelanceRequest5.id,
    //     company_id: freelancePlus.id,
    //     response_data: {
    //       services: [
    //         {
    //           service_id: platformService1.id,
    //           service_name: 'Taux de Gestion',
    //           service_description: 'Pourcentage prélevé par la société de portage',
    //           is_available: true,
    //           management_fee: 6.9,
    //           comment: 'Taux spécialisé marketing digital',
    //         },
    //         {
    //           service_id: platformService2.id,
    //           service_name: 'Services Inclus',
    //           service_description: 'Services additionnels proposés',
    //           is_available: true,
    //           management_fee: 0,
    //           comment: 'Formation marketing, Outils Google Ads, Accompagnement commercial',
    //         },
    //         {
    //           service_id: platformService3.id,
    //           service_name: 'Délai de Paiement',
    //           service_description: 'Délai de versement du salaire après facturation',
    //           is_available: true,
    //           management_fee: 0,
    //           comment: '15 jours via plateforme digitale',
    //         },
    //         {
    //           service_id: platformService6.id,
    //           service_name: 'Description des Services',
    //           service_description: 'Description détaillée des services proposés',
    //           is_available: true,
    //           management_fee: 0,
    //           comment:
    //             "Spécialisation marketing digital avec accès aux outils premium et réseau d'experts",
    //         },
    //         {
    //           service_id: platformService7.id,
    //           service_name: 'Avance sur Salaire',
    //           service_description: "Possibilité d'obtenir une avance sur le salaire",
    //           is_available: true,
    //           management_fee: 0,
    //           comment: 'Oui, selon conditions',
    //         },
    //       ],
    //       selected_organismes: [
    //         {
    //           organisme_id: urssafSta.id,
    //           label: 'URSSAF',
    //           total_patronal: 1420.5,
    //           total_salarial: 920.75,
    //         },
    //         {
    //           organisme_id: poleEmploiSta.id,
    //           label: 'Pôle Emploi',
    //           total_patronal: 290.8,
    //           total_salarial: 195.25,
    //         },
    //       ],
    //     },
    //   },
    // });

    // // Add response for freelanceRequest4 (Data Science mission)
    // const response4Itg = await prisma.companyResponse.create({
    //   data: {
    //     request_id: freelanceRequest4.id,
    //     company_id: itgPortage.id,
    //     response_data: {
    //       services: [
    //         {
    //           service_id: platformService1.id,
    //           service_name: 'Taux de Gestion',
    //           service_description: 'Pourcentage prélevé par la société de portage',
    //           is_available: true,
    //           management_fee: 7.2,
    //           comment: 'Taux spécialisé pour experts Data Science',
    //         },
    //         {
    //           service_id: platformService2.id,
    //           service_name: 'Services Inclus',
    //           service_description: 'Services additionnels proposés',
    //           is_available: true,
    //           management_fee: 0,
    //           comment:
    //             'Assurance RC Pro, Formation IA/ML, Accès outils analytics, Support technique',
    //         },
    //         {
    //           service_id: platformService3.id,
    //           service_name: 'Délai de Paiement',
    //           service_description: 'Délai de versement du salaire après facturation',
    //           is_available: true,
    //           management_fee: 0,
    //           comment: '15 jours',
    //         },
    //         {
    //           service_id: platformService6.id,
    //           service_name: 'Description des Services',
    //           service_description: 'Description détaillée des services proposés',
    //           is_available: true,
    //           management_fee: 0,
    //           comment:
    //             'Expertise Data Science avec accès aux derniers outils et formations spécialisées',
    //         },
    //       ],
    //       selected_organismes: [
    //         {
    //           organisme_id: urssafItg.id,
    //           label: 'URSSAF',
    //           total_patronal: 3200.75,
    //           total_salarial: 2100.5,
    //         },
    //         {
    //           organisme_id: poleEmploiItg.id,
    //           label: 'Pôle Emploi',
    //           total_patronal: 850.25,
    //           total_salarial: 580.75,
    //         },
    //       ],
    //     },
    //   },
    // });

    // Link company responses to organismes (simplified - detailed data is now in response_data JSON)
    await prisma.companyResponseOrganisme.createMany({
      data: [
        // Response 1 STA organismes
        { company_response_id: response1UnitPortage.id, organisme_id: urssafSecSoc.id },
        { company_response_id: response1UnitPortage.id, organisme_id: franceTravail.id },
        { company_response_id: response1UnitPortage.id, organisme_id: retraiteComplementaire.id },

        // // Response 1 ITG organismes
        // { company_response_id: response1Itg.id, organisme_id: urssafItg.id },
        // { company_response_id: response1Itg.id, organisme_id: poleEmploiItg.id },

        // // Response 1 FreelancePlus organismes
        // { company_response_id: response1Freelance.id, organisme_id: urssafSta.id },

        // // Response 2 STA organismes
        // { company_response_id: response2Sta.id, organisme_id: urssafSta.id },
        // { company_response_id: response2Sta.id, organisme_id: poleEmploiSta.id },
        // { company_response_id: response2Sta.id, organisme_id: retraiteSta.id },

        // // Response 3 ITG organismes
        // { company_response_id: response3Itg.id, organisme_id: urssafItg.id },
        // { company_response_id: response3Itg.id, organisme_id: poleEmploiItg.id },

        // // Response 4 ITG organismes (Data Science mission)
        // { company_response_id: response4Itg.id, organisme_id: urssafItg.id },
        // { company_response_id: response4Itg.id, organisme_id: poleEmploiItg.id },

        // // Response 5 FreelancePlus organismes
        // { company_response_id: response5Freelance.id, organisme_id: urssafSta.id },
        // { company_response_id: response5Freelance.id, organisme_id: poleEmploiSta.id },
      ],
    });

    // logger.info('Données de portage salarial créées avec succès!', {
    //   summary: {
    //     users: {
    //       admin: adminUser.id,
    //       companyAdmins: [staAdminUser.id, itgAdminUser.id, freelanceAdminUser.id],
    //       managers: [managerUser1.id, managerUser2.id],
    //       freelancers: [
    //         freelanceUser1.id,
    //         freelanceUser2.id,
    //         freelanceUser3.id,
    //         freelanceUser4.id,
    //         freelanceUser5.id,
    //       ],
    //     },
    //     companies: {
    //       staPortage: staPortage.id,
    //       itgPortage: itgPortage.id,
    //       freelancePlus: freelancePlus.id,
    //     },
    //     metiers: 10,
    //     portageAssociations: [peps.id, feps.id, sneps.id],
    //     platformServices: 7,
    //     freelanceRequests: 5,
    //     companyResponses: 5,
    //     organismes: {
    //       staPortage: [urssafSta.id, poleEmploiSta.id, retraiteSta.id],
    //       itgPortage: [urssafItg.id, poleEmploiItg.id],
    //     },
    //     cotisations: 6,
    //   },
    //   statistics: {
    //     totalUsers: 13,
    //     totalCompanies: 3,
    //     totalFreelancers: 5,
    //     totalRequests: 5,
    //     totalResponses: 5,
    //     averageManagementFee: 7.7,
    //   },
    //   notes: [
    //     'Tous les mots de passe sont: Admin123!',
    //     'Les sociétés de portage sont certifiées',
    //     'Les freelancers ont des profils variés',
    //     'Les cotisations sociales sont réalistes',
    //     'Les réponses incluent des détails financiers',
    //   ],
    // });
  } catch (e) {
    logger.error('Erreur lors du seeding de la base de données', e as Error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
