import { hash } from 'bcryptjs';
import { randomBytes } from 'crypto';
import { prisma } from '@/lib/prisma';
import { sendVerificationEmail } from '@/lib/mailer';
import type { 
  InitialRegistration, 
  CompanyOnboarding, 
  FreelanceOnboarding 
} from '@/lib/validations/auth.validation';

export class AuthService {
  static async initiateRegistration(data: InitialRegistration) {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new Error('Un utilisateur avec cette adresse e-mail existe déjà');
    }

    // Generate verification token
    const verificationToken = randomBytes(32).toString('hex');
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

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

    return { user, verificationToken };
  }

  static async completeCompanyOnboarding(userId: number, data: CompanyOnboarding) {
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

      const results = {
        company,
        platformService: null as any,
        companyServices: [] as any[],
      };

      // Handle selected existing platform services
      if (data.selected_services && data.selected_services.length > 0) {
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
      }

      // Handle new service creation if provided
      if (data.service_label && data.service_label.trim() !== '') {
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
      }

      return results;
    });
  }

  static async completeFreelanceOnboarding(userId: number, data: FreelanceOnboarding) {
    return await prisma.$transaction(async (tx) => {
      // Create freelance profile
      const freelance = await tx.freelance.create({
        data: {
          freelance_id: userId,
          metier: data.metier,
        },
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

      // Create freelance request options if services are specified
      if (data.required_services && data.required_services.length > 0) {
        const requestOptions = await Promise.all(
          data.required_services.map(serviceId =>
            tx.freelanceRequestOption.create({
              data: {
                freelance_request_id: freelanceRequest.id,
                service_option_id: serviceId,
                is_required: true,
              },
            })
          )
        );

        return { freelance, freelanceRequest, requestOptions };
      }

      return { freelance, freelanceRequest, requestOptions: [] };
    });
  }

  static async finalizeRegistration(userId: number) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
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

    // Send verification email
    await sendVerificationEmail(
      user.email,
      verificationToken,
      user.first_name
    );

    return { success: true, message: 'Verification email sent' };
  }

  static async verifyEmailAndSetPassword(token: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { 
        verification_token: token,
        verification_token_expires: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      throw new Error('Token de vérification invalide ou expiré');
    }

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

    return { success: true, message: 'Email vérifié et mot de passe défini avec succès' };
  }

  static async getAvailableServices() {
    return await prisma.companyService.findMany({
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
  }
}