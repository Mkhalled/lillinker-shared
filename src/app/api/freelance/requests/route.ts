import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';

import { authOptions } from '@/lib/auth';
import { FreelanceService } from '@/services';
export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || session.user.role !== 'FREELANCE') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get All freelance requests for the user
  const requests = await FreelanceService.getFreelanceRequestsByFreelanceId(
    Number(session.user.id)
  );
  return NextResponse.json({
    requests,
  });
}
