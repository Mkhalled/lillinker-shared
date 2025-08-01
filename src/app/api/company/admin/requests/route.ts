import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';

import { authOptions } from '@/lib/auth';
import { CompanyService } from '@/services';
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || session.user.role !== 'COMPANY') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);

  // Get All freelance requests for the user with pagination
  const requests = await CompanyService.getFreelanceRequests(page, pageSize);
  return NextResponse.json({
    requests,
  });
}
