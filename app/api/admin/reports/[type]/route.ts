import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { isAdminOperator } from '@/lib/auth/roles';
import { canApp } from '@/lib/ops/roles';
import { REPORT_TYPES, buildReport, renderHtml, type ReportType } from '@/lib/ops/reports';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest, { params }: { params: Promise<{ type: string }> }) {
  const session = await auth();
  if (!session?.user || !isAdminOperator(session.user.role) || !canApp(session.user.role, 'export_reports')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { type } = await params;
  if (!(REPORT_TYPES as readonly string[]).includes(type)) return NextResponse.json({ error: 'Unknown report' }, { status: 404 });
  const report = await buildReport(type as ReportType, request.nextUrl.searchParams.get('facility') || undefined);
  if (!report) return NextResponse.json({ error: 'Pass ?facility=<number or id> for this report' }, { status: 400 });
  if (request.nextUrl.searchParams.get('format') === 'json') return NextResponse.json(report);
  return new NextResponse(renderHtml(report), { headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' } });
}
