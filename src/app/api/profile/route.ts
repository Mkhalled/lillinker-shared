import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { ProfileService } from '@/services/profile/profile-service.service';

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get basic user info
  const userInfo = await ProfileService.getAuthUserInfo(Number(session.user.id));

  // Get role-based info
  const roleInfo = await ProfileService.getRoleBasedInfo(
    Number(session.user.id),
    session.user.role
  );

  return NextResponse.json({
    user: userInfo,
    roleData: roleInfo,
  });
}
