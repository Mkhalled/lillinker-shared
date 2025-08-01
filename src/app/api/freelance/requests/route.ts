import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';

import { authOptions } from '@/lib/auth';
import { FreelanceService } from '@/services';

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || session.user.role !== 'FREELANCE') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Parse pagination params
  const { searchParams } = new URL(req.url);
  const page = Number(searchParams.get('page')) || 1;
  const pageSize = Number(searchParams.get('pageSize')) || 10;

  // Get paginated freelance requests for the user
  const result = await FreelanceService.getFreelanceRequestsByFreelanceId(
    Number(session.user.id),
    page,
    pageSize
  );

  return NextResponse.json(result);
}
