import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';

import { authOptions } from '@/lib/auth';
import { CompanyService } from '@/services';
export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || session.user.role !== 'COMPANY') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get All freelance requests for the user
  const requests = await CompanyService.getFreelanceRequests();
  return NextResponse.json({
    requests,
  });
}
