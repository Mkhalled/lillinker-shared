import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

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
  const sortOrder = searchParams.get('sortOrder') || 'asc'; // default as needed
  const date = searchParams.get('date') || '';

  // Pass new params to your service
  const requests = await CompanyService.getFreelanceRequests(page, pageSize, sortOrder, date);

  return NextResponse.json({
    requests,
  });
}
