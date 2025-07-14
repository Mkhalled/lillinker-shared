import { randomBytes } from 'crypto';

import { hash } from 'bcryptjs';

import { logger } from '@/lib/logger';
import { sendVerificationEmail } from '@/lib/mailer';
import { prisma } from '@/lib/prisma';
import type { 
  InitialRegistration, 
  CompanyOnboarding, 
  FreelanceOnboarding 
} from '@/lib/validations/auth.validation';

export class AuthService {
  static async initiateRegistration(data: InitialRegistration) {
    const logContext = {
      operation: 'initiateRegistration',
      email: data.email,
      role: data.role,
    };

    try {
      logger.info('Starting user registration process', logContext);

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: data.email },
      });

      if (existingUser) {
        logger.warn('Registration attempt with existing email', {
          ...logContext,
          existingUserId: existingUser.id,
        });
        throw new Error('Un utilisateur avec cette adresse e-mail existe déjà');
      }

      // Generate verification token
      const verificationToken = randomBytes(32).toString('hex');
      const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      logger.debug('Generated verification token', {
        ...logContext,
        tokenLength: verificationToken.length,
        expiresAt: verificationTokenExpires,
      });

      // Create user with temporary password (will be set during email verification)
      const tempPassword = await hash(randomBytes(32).toString('hex'), 12);

      const user = await prisma.user.create({
        data: {
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email,
          password: tempPassword,
          role: data.role,
          phone_number: data.phone_number,
          email_verified: false,
          verification_token: verificationToken,
          verification_token_expires: verificationTokenExpires,
          status: false, // Will be activated after onboarding completion
        },
      });

      logger.info('User registration completed successfully', {
        ...logContext,
        userId: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
      });

      return { user, verificationToken };
    } catch (error) {
      logger.error('User registration failed', error as Error, logContext);
      throw error;
    }
  }

  static async completeCompanyOnboarding(userId: number, data: CompanyOnboarding) {
    const logContext = {
      operation: 'completeCompanyOnboarding',
      userId,
      companyName: data.company_name,
      siret: data.siret,
    };

    try {
      logger.info('Starting company onboarding process', logContext);

      return await prisma.$transaction(async (tx) => {
        // Create company
        const company = await tx.company.create({
          data: {
            admin_user_id: userId,
            name: data.company_name,
            description: data.company_description,
            siret: data.siret,
            consultant_count: data.consultant_count,
            management_fees: data.management_fees,
          },
        });

        logger.info('Company record created successfully', {
          ...logContext,
          companyId: company.id,
          consultantCount: data.consultant_count,
          managementFees: data.management_fees,
        });

        const results = {
          company,
          platformService: null as any,
          companyServices: [] as any[],
        };

        // Handle selected existing platform services
        if (data.selected_services && data.selected_services.length > 0) {
          logger.debug('Processing selected platform services', {
            ...logContext,
            selectedServicesCount: data.selected_services.length,
            serviceIds: data.selected_services,
          });

          const companyServices = await Promise.all(
            data.selected_services.map(serviceId =>
              tx.companyService.create({
                data: {
                  company_id: company.id,
                  service_id: serviceId,
                  is_active: true, // Active since these are existing approved services
                },
              })
            )
          );

          results.companyServices = companyServices;
          
          logger.info('Company services linked successfully', {
            ...logContext,
            linkedServicesCount: companyServices.length,
          });
        }

        // Handle new service creation if provided
        if (data.service_label && data.service_label.trim() !== '') {
          logger.debug('Creating new platform service', {
            ...logContext,
            serviceLabel: data.service_label,
            dataType: data.data_type,
            requiresData: data.requires_data,
          });

          const platformService = await tx.platformService.create({
            data: {
              user_id: userId,
              label: data.service_label,
              description: data.service_description || '',
              data_type: data.data_type!,
              requires_data: data.requires_data || false,
              data_label: data.data_label || '',
              data_description: data.data_description || '',
              choices: data.choices && data.choices.length > 0 ? data.choices : undefined,
              status: 'PENDING',
            },
          });

          // Create company service linking for new service
          const companyService = await tx.companyService.create({
            data: {
              company_id: company.id,
              service_id: platformService.id,
              is_active: false, // Will be activated when platform service is approved
            },
          });

          results.platformService = platformService;
          results.companyServices.push(companyService);

          logger.info('New platform service created and linked', {
            ...logContext,
            platformServiceId: platformService.id,
            status: platformService.status,
          });
        }

        logger.info('Company onboarding completed successfully', {
          ...logContext,
          companyId: company.id,
          totalServicesLinked: results.companyServices.length,
          newServiceCreated: !!results.platformService,
        });

        return results;
      });
    } catch (error) {
      logger.error('Company onboarding failed', error as Error, logContext);
      throw error;
    }
  }

  static async completeFreelanceOnboarding(userId: number, data: FreelanceOnboarding) {
    const logContext = {
      operation: 'completeFreelanceOnboarding',
      userId,
      metier: data.metier,
      tjm: data.tjm,
      days: data.days,
    };

    try {
      logger.info('Starting freelance onboarding process', logContext);

      return await prisma.$transaction(async (tx) => {
        // Create freelance profile
        const freelance = await tx.freelance.create({
          data: {
            freelance_id: userId,
            metier: data.metier,
          },
        });

        logger.info('Freelance profile created successfully', {
          ...logContext,
          freelanceId: freelance.id,
        });

        // Create freelance request
        const freelanceRequest = await tx.freelanceRequest.create({
          data: {
            freelance_id: freelance.id,
            mission_status: data.mission_status,
            client_name: data.client_name,
            client_address: data.client_address,
            client_sector: data.client_sector,
            priority: data.priority,
            tjm: data.tjm,
            days: data.days,
          },
        });

        logger.info('Freelance request created successfully', {
          ...logContext,
          freelanceRequestId: freelanceRequest.id,
          missionStatus: data.mission_status,
          priority: data.priority,
          clientName: data.client_name,
        });

        // Create freelance request options if services are specified
        if (data.selected_services && data.selected_services.length > 0) {
          logger.debug('Processing freelance service requests', {
            ...logContext,
            selectedServicesCount: data.selected_services.length,
          });

          // For each selected service, try to find company services or create a pending option
          const requestOptions = await Promise.all(
            data.selected_services.map(async (selectedService) => {
              // Find any company service that offers this platform service
              const companyService = await tx.companyService.findFirst({
                where: {
                  service_id: selectedService.serviceId,
                  is_active: true,
                },
              });

              if (companyService) {
                // Create option with existing company service
                const option = await tx.freelanceRequestOption.create({
                  data: {
                    freelance_request_id: freelanceRequest.id,
                    service_option_id: companyService.id,
                    is_required: selectedService.isRequired,
                    response_data: selectedService.responseData ? { data: selectedService.responseData } : undefined,
                  },
                });

                logger.debug('Freelance request option created', {
                  ...logContext,
                  serviceId: selectedService.serviceId,
                  companyServiceId: companyService.id,
                  isRequired: selectedService.isRequired,
                });

                return option;
              } else {
                // For now, we'll skip services without company providers
                logger.warn('No company service found for requested platform service', {
                  ...logContext,
                  serviceId: selectedService.serviceId,
                });
                return null;
              }
            })
          );

          // Filter out null values
          const validRequestOptions = requestOptions.filter(option => option !== null);

          logger.info('Freelance service requests processed', {
            ...logContext,
            totalRequested: data.selected_services.length,
            successfullyLinked: validRequestOptions.length,
            skipped: data.selected_services.length - validRequestOptions.length,
          });

          return { freelance, freelanceRequest, requestOptions: validRequestOptions };
        }

        logger.info('Freelance onboarding completed successfully', {
          ...logContext,
          freelanceId: freelance.id,
          freelanceRequestId: freelanceRequest.id,
          servicesRequested: 0,
        });

        return { freelance, freelanceRequest, requestOptions: [] };
      });
    } catch (error) {
      logger.error('Freelance onboarding failed', error as Error, logContext);
      throw error;
    }
  }

  static async finalizeRegistration(userId: number) {
    const logContext = {
      operation: 'finalizeRegistration',
      userId,
    };

    try {
      logger.info('Starting registration finalization', logContext);

      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        logger.warn('User not found during registration finalization', logContext);
        throw new Error('User not found');
      }

      // Generate verification token and send email
      const verificationToken = randomBytes(32).toString('hex');
      const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

      await prisma.user.update({
        where: { id: userId },
        data: {
          verification_token: verificationToken,
          verification_token_expires: verificationTokenExpires,
        },
      });

      logger.debug('Verification token updated', {
        ...logContext,
        email: user.email,
        expiresAt: verificationTokenExpires,
      });

      // Send verification email
      await sendVerificationEmail(
        user.email,
        verificationToken,
        user.first_name
      );

      logger.info('Registration finalization completed successfully', {
        ...logContext,
        email: user.email,
        firstName: user.first_name,
      });

      return { success: true, message: 'Verification email sent' };
    } catch (error) {
      logger.error('Registration finalization failed', error as Error, logContext);
      throw error;
    }
  }

  static async verifyEmailAndSetPassword(token: string, password: string) {
    const logContext = {
      operation: 'verifyEmailAndSetPassword',
      tokenLength: token.length,
    };

    try {
      logger.info('Starting email verification and password setting', logContext);

      const user = await prisma.user.findUnique({
        where: { 
          verification_token: token,
          verification_token_expires: {
            gt: new Date(),
          },
        },
      });

      if (!user) {
        logger.warn('Invalid or expired verification token', {
          ...logContext,
          token: token.substring(0, 8) + '...', // Log partial token for debugging
        });
        throw new Error('Token de vérification invalide ou expiré');
      }

      logger.debug('Valid verification token found', {
        ...logContext,
        userId: user.id,
        email: user.email,
      });

      const hashedPassword = await hash(password, 12);

      await prisma.user.update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
          email_verified: true,
          verification_token: null,
          verification_token_expires: null,
        },
      });

      logger.info('Email verification and password setting completed successfully', {
        ...logContext,
        userId: user.id,
        email: user.email,
        firstName: user.first_name,
      });

      return { success: true, message: 'Email vérifié et mot de passe défini avec succès' };
    } catch (error) {
      logger.error('Email verification and password setting failed', error as Error, logContext);
      throw error;
    }
  }

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