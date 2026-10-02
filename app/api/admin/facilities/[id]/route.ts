import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/db';
import {
  activateFacility,
  ensureChecklists,
  markStatus,
  recordRecovery,
  recordRepayment,
  refreshFundingStatus,
  releaseFacilityFunds,
  settleEarly,
} from '@/lib/lifecycle/service';

async function guard() {
  const session = await auth();
  if (!session?.user || !['ADMIN', 'UNDERWRITER'].includes(session.user.role)) return null;
  return session;
}

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await guard();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  await ensureChecklists(id);
  await refreshFundingStatus(id);
  const facility = await prisma.facility.findUnique({
    where: { id },
    include: {
      releaseConditions: true,
      activationChecks: true,
      releases: true,
      beneficiary: true,
      payments: true,
      application: { include: { company: true } },
    },
  });
  return NextResponse.json({ facility });
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await guard();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const body = await request.json();
  try {
    if (body.action === 'beneficiary') {
      const beneficiary = await prisma.beneficiary.create({
        data: { type: body.type || 'SUPPLIER', legalName: body.legalName, walletAddress: body.walletAddress || null, verificationStatus: 'APPROVED' },
      });
      await prisma.facility.update({ where: { id }, data: { beneficiaryId: beneficiary.id, serviceFeeRate: Number(body.serviceFeeRate || 0), reserveRate: Number(body.reserveRate || 0) } });
    } else if (body.action === 'verify') {
      await prisma.facilityReleaseCondition.update({ where: { id: body.conditionId }, data: { status: body.status, verifiedAt: new Date() } });
      await refreshFundingStatus(id);
    } else if (body.action === 'check') {
      await prisma.facilityActivationCheck.update({ where: { id: body.checkId }, data: { status: 'VERIFIED' } });
    } else if (body.action === 'release') {
      await releaseFacilityFunds(id, session.user.id);
    } else if (body.action === 'activate') {
      await activateFacility(id, session.user.id);
    } else if (body.action === 'repay') {
      await recordRepayment(id, session.user.id, Number(body.amount), body.key || `pay:${id}:${Date.now()}`);
    } else if (body.action === 'settle') {
      await settleEarly(id, session.user.id, Number(body.amount));
    } else if (body.action === 'status') {
      await markStatus(id, session.user.id, body.status, body.reason || '');
    } else if (body.action === 'recover') {
      await recordRecovery(id, session.user.id, Number(body.amount));
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Lifecycle action failed';
    const status = /Unique constraint|already released|idempotency/i.test(message) ? 409 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
