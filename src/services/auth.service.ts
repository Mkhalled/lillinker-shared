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
            is_portage: data.is_portage || false,
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
          platformServices: [] as unknown[],
          companyServices: [] as unknown[],
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

        // Handle selected metiers
        if (data.selected_metiers && data.selected_metiers.length > 0) {
          logger.debug('Processing selected metiers', {
            ...logContext,
            selectedMetiersCount: data.selected_metiers.length,
            metierIds: data.selected_metiers,
          });

          await tx.companyMetier.createMany({
            data: data.selected_metiers.map(metierId => ({
              company_id: company.id,
              metier_id: metierId,
            })),
          });

          logger.info('Company metiers linked successfully', {
            ...logContext,
            linkedMetiersCount: data.selected_metiers.length,
          });
        }

        // Handle selected portages (for portage companies)
        if (data.is_portage && data.selected_portages && data.selected_portages.length > 0) {
          logger.debug('Processing selected portages', {
            ...logContext,
            selectedPortagesCount: data.selected_portages.length,
            portageIds: data.selected_portages,
          });

          await tx.companyPortage.createMany({
            data: data.selected_portages.map(portageId => ({
              company_id: company.id,
              portage_id: portageId,
            })),
          });

          logger.info('Company portages linked successfully', {
            ...logContext,
            linkedPortagesCount: data.selected_portages.length,
          });
        }

        // Handle new services creation (multiple services support)
        const newServicesToCreate = [];
        
        // Check for new services array (preferred method)
        if (data.new_services && data.new_services.length > 0) {
          newServicesToCreate.push(...data.new_services);
        }
        
        // Check for legacy single service (backward compatibility)
        if (data.service_label && data.service_label.trim() !== '') {
          newServicesToCreate.push({
            service_label: data.service_label,
            service_description: data.service_description,
            data_type: data.data_type!,
            requires_data: data.requires_data || false,
            data_label: data.data_label,
            data_description: data.data_description,
            choices: data.choices,
          });
        }

        // Create all new services
        if (newServicesToCreate.length > 0) {
          logger.debug('Creating new platform services', {
            ...logContext,
            newServicesCount: newServicesToCreate.length,
            serviceLabels: newServicesToCreate.map(s => s.service_label),
          });

          for (const newService of newServicesToCreate) {
            const platformService = await tx.platformService.create({
              data: {
                user_id: userId,
                label: newService.service_label,
                description: newService.service_description || '',
                data_type: newService.data_type,
                requires_data: newService.requires_data,
                data_label: newService.data_label || '',
                data_description: newService.data_description || '',
                choices: newService.choices && newService.choices.length > 0 ? newService.choices : undefined,
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

            results.platformServices.push(platformService);
            results.companyServices.push(companyService);

            logger.info('New platform service created and linked', {
              ...logContext,
              platformServiceId: platformService.id,
              serviceLabel: newService.service_label,
              status: platformService.status,
            });
          }
        }

        logger.info('Company onboarding completed successfully', {
          ...logContext,
          companyId: company.id,
          totalServicesLinked: results.companyServices.length,
          newServicesCreated: results.platformServices.length,
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
      metier_id: data.metier_id,
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
            metier_id: data.metier_id,
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
            wants_portage: data.wants_portage || false,
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

          // Create request options directly for platform services
          const requestOptions = await Promise.all(
            data.selected_services.map(async (selectedService) => {
              // Verify that the platform service exists
              const platformService = await tx.platformService.findUnique({
                where: { id: selectedService.serviceId },
              });

              if (platformService) {
                // Convert responseData string to appropriate JSON structure based on data_type
                let responseDataJson;
                if (selectedService.responseData && selectedService.responseData.trim() !== '') {
                  switch (platformService.data_type) {
                    case 'TEXT':
                      responseDataJson = { text: selectedService.responseData };
                      break;
                    case 'NUMBER':
                      responseDataJson = { number: selectedService.responseData };
                      break;
                    case 'SELECT': {
                      // For SELECT type, responseData comes as comma-separated values
                      const selections = selectedService.responseData.split(',').map(s => s.trim()).filter(s => s !== '');
                      responseDataJson = { select: selections };
                      break;
                    }
                    case 'RADIO': {
                      responseDataJson = { radio: selectedService.responseData };
                      break;
                    }
                    default:
                      responseDataJson = { value: selectedService.responseData };
                  }
                } else {
                  responseDataJson = undefined;
                }

                // Create freelance request option with direct reference to platform service
                const option = await tx.freelanceRequestOption.create({
                  data: {
                    freelance_request_id: freelanceRequest.id,
                    service_option_id: selectedService.serviceId,
                    is_required: selectedService.isRequired,
                    response_data: responseDataJson,
                  },
                });

                logger.debug('Freelance request option created', {
                  ...logContext,
                  serviceId: selectedService.serviceId,
                  platformServiceLabel: platformService.label,
                  dataType: platformService.data_type,
                  isRequired: selectedService.isRequired,
                  responseData: responseDataJson,
                });

                return option;
              } else {
                logger.warn('Platform service not found', {
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

          // Handle selected portages (if freelancer wants portage)
          if (data.wants_portage && data.selected_portages && data.selected_portages.length > 0) {
            logger.debug('Processing freelance portage preferences', {
              ...logContext,
              selectedPortagesCount: data.selected_portages.length,
              portageIds: data.selected_portages,
            });

            await tx.freelanceRequestPortage.createMany({
              data: data.selected_portages.map(portageId => ({
                freelance_request_id: freelanceRequest.id,
                portage_id: portageId,
              })),
            });

            logger.info('Freelance portage preferences recorded', {
              ...logContext,
              linkedPortagesCount: data.selected_portages.length,
            });
          }

          return { freelance, freelanceRequest, requestOptions: validRequestOptions };
        }

        // Handle portages even without services
        if (data.wants_portage && data.selected_portages && data.selected_portages.length > 0) {
          logger.debug('Processing freelance portage preferences (without services)', {
            ...logContext,
            selectedPortagesCount: data.selected_portages.length,
            portageIds: data.selected_portages,
          });

          await tx.freelanceRequestPortage.createMany({
            data: data.selected_portages.map(portageId => ({
              freelance_request_id: freelanceRequest.id,
              portage_id: portageId,
            })),
          });

          logger.info('Freelance portage preferences recorded (without services)', {
            ...logContext,
            linkedPortagesCount: data.selected_portages.length,
          });
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