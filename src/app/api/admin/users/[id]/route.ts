import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

import { UserDAO } from '@/dao/user.dao';
import { logger } from '@/lib/logger';
import { accountActivationEmail } from '@/lib/mailer';

const secret = process.env.NEXTAUTH_SECRET!;

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    logger.info('HIT: /api/admin/users/[id] PUT request', { userId: params.id });
    const token = await getToken({ req, secret });
    if (!token) {
      logger.warn('Unauthorized access attempt', { userId: params.id });
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    if (token.role !== 'PLATFORM_ADMIN') {
      logger.warn('Access denied for user', { userId: token.id, role: token.role });
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const userId = params.id;

    await UserDAO.update(userId, { isActive: true });
    const user = await UserDAO.findUserBasicInfoById(userId);
    if (user) {
      const fullName = `${user.firstname} ${user.lastname}`;
      await accountActivationEmail(user.email, fullName);
    }
    logger.info('User account activated successfully', { userId });
    return NextResponse.json({ message: 'Account Activated successfully' }, { status: 200 });
  } catch (error) {
    logger.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
