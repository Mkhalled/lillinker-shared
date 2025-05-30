import { NextResponse } from 'next/server';

import { logger } from '@/lib/logger';
import { AuthService } from '@/services/auth.service';
import { validateUserRegistrationWithError } from '@/validations/user.validation';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';


export async function POST(req: Request) {
  try {
    logger.info('Starting user registration process');
    const body = await req.json();
    logger.debug('Received registration request', { ...body   });

    const validationResult = validateUserRegistrationWithError(body);
    if (!validationResult.success) {
      logger.error('Validation error during user registration', { error: validationResult.error });
      return NextResponse.json(
        { error: 'Validation error', details: validationResult.error?.errors },
        { status: 400 }
      );
    }

    const validatedData = validationResult.data!;
    logger.debug('Input validation successful', {
      email: validatedData.email,
      role: validatedData.role,
    });

    try {
      const hashedPassword =  await bcrypt.hash(validatedData.password, 10);
       const emailVerificationToken = uuidv4(); // random UUID token
      const emailVerificationTokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // now + 24 hours
      const userInput = {
        ...validatedData,
        password: hashedPassword, 
        isActive: false,
        emailVerified: false,
        emailVerificationToken,
        emailVerificationTokenExpiresAt
      };
      const result = await AuthService.registerUser(userInput);

      logger.info('User registration completed successfully', {
        userId: result.id,
        email: result.email,
        roleId: result.roleId,
      });
      return NextResponse.json(
        { message: 'User registered successfully', user: result },
        { status: 201 }
      );
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'User with this email or username already exists') {
          return NextResponse.json({ error: error.message }, { status: 400 });
        }
      }
      throw error;
    }
  } catch (error) {
    logger.error('Error during user registration', { error });
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An error occurred during registration' },
      { status: 500 }
    );
  }
}
