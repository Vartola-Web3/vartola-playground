import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';

import { prisma } from '@/lib/db';
import { calculateRisk } from '@/lib/risk-engine';
import { AssetType } from '@/lib/types';
import { tryRecordChainEvent } from '@/lib/stellar/record';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'UNDERWRITER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { applicationId, decision, comments, conditions } = body;
    const allowedDecisions = ['APPROVED', 'CONDITIONALLY_APPROVED', 'REJECTED'];
    if (!allowedDecisions.includes(decision)) {
      return NextResponse.json({ error: 'Invalid decision' }, { status: 400 });
    }

    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: { company: true, documents: true, facility: true },
    });

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    if (['APPROVED', 'FUNDED'].includes(application.status) || application.facility) {
      return NextResponse.json({ error: 'Application already decided' }, { status: 400 });
    }

    const riskInput = {
      company: {
        establishedDate: application.company.establishedDate,
        monthlyRevenue: application.company.monthlyRevenue || 0,
        monthlyExpenses: application.company.monthlyExpenses || 0,
        liabilities: application.company.liabilities || 0,
        industry: application.company.industry,
      },
      asset: {
        assetType: application.assetType as AssetType,
        assetDescription: application.assetDescription,
        assetValue: application.assetValue,
      },
      deal: {
        financeAmount: application.financeAmount,
        assetValue: application.assetValue,
        requestedTerm: application.requestedTerm,
      },
      application: {
        documents: application.documents,
      },
    };

    const riskResult = calculateRisk(riskInput);

    const review = await prisma.underwritingReview.create({
      data: {
        applicationId,
        reviewedBy: session.user.id,
        decision,
        comments,
        conditions,
        recommendedTier: riskResult.riskTier,
      },
    });

    const newStatus =
      decision === 'APPROVED'
        ? 'APPROVED'
        : decision === 'CONDITIONALLY_APPROVED'
          ? 'CONDITIONALLY_APPROVED'
          : 'REJECTED';

    await prisma.application.update({
      where: { id: applicationId },
      data: {
        status: newStatus,
        companyRiskScore: riskResult.companyRiskScore,
        assetRiskScore: riskResult.assetRiskScore,
        dealRiskScore: riskResult.dealRiskScore,
        riskTier: riskResult.riskTier,
        approvedAt: decision === 'APPROVED' ? new Date() : null,
        approvedBy: decision === 'APPROVED' ? session.user.id : null,
        rejectedAt: decision === 'REJECTED' ? new Date() : null,
        rejectionReason: decision === 'REJECTED' ? comments : null,
      },
    });

    if (decision === 'APPROVED') {
      const facilityNo = `FAC-${new Date().getFullYear()}-${String(await prisma.facility.count() + 1).padStart(4, '0')}`;
      
      const monthlyPayment = calculateMonthlyPayment(
        application.financeAmount,
        application.requestedTerm,
        riskResult.tierParameters.indicativeRate.min / 100
      );

      const facility = await prisma.facility.create({
        data: {
          facilityNo,
          applicationId: application.id,
          // Approval creates an eligible asset. An admin explicitly decides
          // which opportunity it belongs to; never attach it to an arbitrary pool.
          poolId: null,
          financeAmount: application.financeAmount,
          term: application.requestedTerm,
          monthlyPayment,
          status: 'PENDING_FUNDING',
          stellarTxHash: null,
          stellarAssetId: null,
          activatedAt: null,
          maturityDate: new Date(Date.now() + application.requestedTerm * 30 * 24 * 60 * 60 * 1000),
        },
      });

      await tryRecordChainEvent({
        type: 'CREATE_FACILITY',
        entityType: 'Facility',
        entityId: facility.id,
        payload: { facilityNo, assetValue: application.assetValue, financeAmount: application.financeAmount, term: application.requestedTerm },
      });

      for (let i = 1; i <= application.requestedTerm; i++) {
        await prisma.payment.create({
          data: {
            facilityId: facility.id,
            paymentNo: i,
            dueDate: new Date(Date.now() + i * 30 * 24 * 60 * 60 * 1000),
            amount: monthlyPayment,
            status: 'SCHEDULED',
          },
        });
      }

    }

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: `APPLICATION_${decision}`,
        entityType: 'Application',
        entityId: applicationId,
        changes: JSON.stringify({
          decision,
          comments,
          riskTier: riskResult.riskTier,
          companyRiskScore: riskResult.companyRiskScore,
          assetRiskScore: riskResult.assetRiskScore,
          dealRiskScore: riskResult.dealRiskScore,
        }),
      },
    });

    return NextResponse.json({ success: true, review, riskResult });
  } catch (error) {
    console.error('Review submission error:', error);
    return NextResponse.json(
      { error: 'Failed to submit review' },
      { status: 500 }
    );
  }
}

function calculateMonthlyPayment(principal: number, termMonths: number, annualRate: number): number {
  const monthlyRate = annualRate / 12;
  if (monthlyRate === 0) return principal / termMonths;
  
  const payment = principal * (monthlyRate * Math.pow(1 + monthlyRate, termMonths)) / 
    (Math.pow(1 + monthlyRate, termMonths) - 1);
  return Math.round(payment * 100) / 100;
}
