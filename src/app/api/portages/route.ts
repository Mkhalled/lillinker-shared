import { NextResponse } from 'next/server';

import { PlatformServiceService } from '@/services';

export async function GET() {
  try {
    const portages = await PlatformServiceService.getLabelSyndicats();
    return NextResponse.json({
      success: true,
      data: portages,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch getLabelSyndicats',
        data: [],
      },
      { status: 500 }
    );
  }
}
