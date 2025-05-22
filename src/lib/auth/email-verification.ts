import { logger } from '@/lib/logger';
import { prisma } from '@/lib/prisma';

interface VerificationResult {
  success: boolean;
  message: string;
}

export async function verifyEmail(token: string): Promise<VerificationResult> {
  try {
    const user = await prisma.user.findUnique({
      where: { emailVerificationToken: token },
    });

    if (!user) {
      return {
        success: false,
        message: 'Invalid verification token',
      };
    }

    if (user.emailVerified) {
      return {
        success: true,
        message: 'Email already verified',
      };
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: true },
    });

    return {
      success: true,
      message: 'Email verified successfully',
    };
  } catch (error) {
    logger.error('Email verification error', error as Error);
    throw error;
  }
}
