import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';

import { getPlatformConfig, savePlatformConfig } from '@/lib/config/platform-config';

export async function GET() {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const config = await getPlatformConfig();
    return NextResponse.json({ config });
  } catch (error) {
    console.error('Config fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch config' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    await savePlatformConfig(body);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Config save error:', error);
    return NextResponse.json({ error: 'Failed to save config' }, { status: 500 });
  }
}
