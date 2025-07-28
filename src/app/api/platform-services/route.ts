import { NextResponse } from 'next/server';

import { PlatformServiceService } from '@/services';

export async function GET() {
  try {
    const platformServices = await PlatformServiceService.getAvailableServices();

    return NextResponse.json({
      success: true,
      data: platformServices,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch platform services' }, { status: 500 });
  }
}
