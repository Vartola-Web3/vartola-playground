import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/db';
import { createSumsubSdkToken, sumsubConfigured } from '@/lib/integrations/sumsub';

async function subjectFor(userId: string, role: string) {
  if (role !== 'SME') return { subjectType: 'INDIVIDUAL', subjectId: userId };
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { companyId: true } });
  return { subjectType: 'COMPANY', subjectId: user?.companyId || userId };
}

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { subjectType, subjectId } = await subjectFor(session.user.id, session.user.role);
  const compliance = await prisma.complianceCase.upsert({
    where: { subjectType_subjectId: { subjectType, subjectId } },
    update: {},
    create: { subjectType, subjectId, provider: sumsubConfigured() ? 'SUMSUB' : 'SIMULATION' },
  });
  return NextResponse.json({ compliance, providerConfigured: sumsubConfigured() });
}

export async function POST() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!sumsubConfigured()) {
    return NextResponse.json({ error: 'Sumsub Sandbox is ready in code but needs its sandbox keys.' }, { status: 503 });
  }
  const { subjectType, subjectId } = await subjectFor(session.user.id, session.user.role);
  const result = await createSumsubSdkToken(session.user.id, session.user.email);
  await prisma.complianceCase.upsert({
    where: { subjectType_subjectId: { subjectType, subjectId } },
    update: { provider: 'SUMSUB', providerRef: result.userId, status: 'PENDING' },
    create: { subjectType, subjectId, provider: 'SUMSUB', providerRef: result.userId, status: 'PENDING' },
  });
  return NextResponse.json({ provider: 'SUMSUB', accessToken: result.token });
}
