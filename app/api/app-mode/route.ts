import { NextResponse } from 'next/server';
import { appMode } from '@/lib/config/app-mode';

export async function GET() {
  const mode = appMode();
  return NextResponse.json({
    mode,
    label: mode === 'ALPHA' ? 'Alpha · Stellar Testnet' : 'Demo / Test Data',
    asset: mode === 'ALPHA' ? 'VTAED' : 'tAED',
  });
}
