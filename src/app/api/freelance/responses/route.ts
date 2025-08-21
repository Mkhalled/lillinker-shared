import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';

import { authOptions } from '@/lib/auth';
import { FreelanceService } from '@/services';

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || session.user.role !== 'FREELANCE') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Parse params
  const { searchParams } = new URL(req.url);
  const id = Number(searchParams.get('id'));

  // Get freelance request by request ID
  const result = await FreelanceService.getFreelanceRequestByRequestId(id);
  return NextResponse.json(result);
}
