import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';

import { prisma } from '@/lib/db';
import { calculateRisk } from '@/lib/risk-engine';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'SME') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { company: true },
    });

    if (!user || !user.company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    const body = await request.json();
    const {
      assetType,
      assetDescription,
      assetValue,
      smeContribution,
      financeAmount,
      requestedTerm,
      documents,
    } = body;

    const applicationCount = await prisma.application.count();
    const applicationNo = `APP-${new Date().getFullYear()}-${String(applicationCount + 1).padStart(4, '0')}`;

    const riskInput = {
      company: {
        establishedDate: user.company.establishedDate,
        monthlyRevenue: user.company.monthlyRevenue || 0,
        monthlyExpenses: user.company.monthlyExpenses || 0,
        liabilities: user.company.liabilities || 0,
        industry: user.company.industry,
      },
      asset: {
        assetType,
        assetDescription,
        assetValue,
      },
      deal: {
        financeAmount,
        assetValue,
        requestedTerm,
      },
      application: {
        documents: documents || [],
      },
    };

    const riskResult = calculateRisk(riskInput);

    const application = await prisma.application.create({
      data: {
        applicationNo,
        companyId: user.company.id,
        submittedBy: user.id,
        assetType,
        assetDescription,
        assetValue,
        smeContribution,
        financeAmount,
        requestedTerm,
        status: 'SUBMITTED',
        companyRiskScore: riskResult.companyRiskScore,
        assetRiskScore: riskResult.assetRiskScore,
        dealRiskScore: riskResult.dealRiskScore,
        riskTier: riskResult.riskTier,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'APPLICATION_SUBMITTED',
        entityType: 'Application',
        entityId: application.id,
        changes: JSON.stringify({ applicationNo, riskTier: riskResult.riskTier }),
      },
    });

    return NextResponse.json({
      success: true,
      application,
      riskAssessment: riskResult,
    });
  } catch (error) {
    console.error('Application creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create application' },
      { status: 500 }
    );
  }
}
