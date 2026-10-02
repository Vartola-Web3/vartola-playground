import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/db';
import { calculateRisk } from '@/lib/risk-engine';
import { AssetType } from '@/lib/types';
import { inferDocumentType, saveUploads } from '@/lib/services/save-uploads';

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

    const form = await request.formData();
    const asDraft = form.get('asDraft') === 'true';
    const assetType = String(form.get('assetType') || '');
    const assetDescription = String(form.get('assetDescription') || '');
    const assetValue = Number(form.get('assetValue'));
    const smeContribution = Number(form.get('smeContribution'));
    const financeAmount = Number(form.get('financeAmount'));
    const requestedTerm = Number(form.get('requestedTerm'));
    const files = form.getAll('files').filter((entry): entry is File => entry instanceof File && entry.size > 0);

    const riskResult = calculateRisk({
      company: {
        establishedDate: user.company.establishedDate,
        monthlyRevenue: user.company.monthlyRevenue || 0,
        monthlyExpenses: user.company.monthlyExpenses || 0,
        liabilities: user.company.liabilities || 0,
        industry: user.company.industry,
      },
      asset: { assetType: assetType as AssetType, assetDescription, assetValue },
      deal: { financeAmount, assetValue, requestedTerm },
      application: { documents: files.map((file) => ({ documentType: inferDocumentType(file.name) })) },
    });

    let application = null;
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const applicationCount = await prisma.application.count();
      const applicationNo = `APP-${new Date().getFullYear()}-${String(applicationCount + 1 + attempt).padStart(4, '0')}`;
      try {
        application = await prisma.application.create({
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
            status: asDraft ? 'DRAFT' : 'SUBMITTED',
            companyRiskScore: riskResult.companyRiskScore,
            assetRiskScore: riskResult.assetRiskScore,
            dealRiskScore: riskResult.dealRiskScore,
            riskTier: riskResult.riskTier,
          },
        });
        break;
      } catch (error) {
        const code = (error as { code?: string }).code;
        if (code !== 'P2002' || attempt === 4) throw error;
      }
    }

    if (!application) {
      return NextResponse.json({ error: 'Failed to create application' }, { status: 500 });
    }

    if (files.length > 0) {
      await saveUploads(files, application.id, user.id);
    }

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: asDraft ? 'APPLICATION_DRAFT' : 'APPLICATION_SUBMITTED',
        entityType: 'Application',
        entityId: application.id,
        changes: JSON.stringify({ applicationNo: application.applicationNo, riskTier: riskResult.riskTier }),
      },
    });

    const applicationWithDocs = await prisma.application.findUnique({
      where: { id: application.id },
      include: { documents: true },
    });

    return NextResponse.json({
      success: true,
      application: applicationWithDocs ?? application,
      riskAssessment: riskResult,
    });
  } catch (error) {
    console.error('Application creation error:', error);
    const message = error instanceof Error ? error.message : 'Failed to create application';
    const status = message.startsWith('Unsupported') || message.startsWith('File exceeds') ? 400 : 500;
    return NextResponse.json({ error: status === 400 ? message : 'Failed to create application' }, { status });
  }
}
