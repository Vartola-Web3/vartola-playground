import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { analyzeApplicationWithAI, generateApplicationSummary } from '@/lib/services/ai-underwriting-assistant';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'UNDERWRITER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { applicationId } = body;

    console.log('🤖 AI Assist API called for application:', applicationId);

    const demoInput = {
      company: {
        monthlyRevenue: 180000,
        monthlyExpenses: 140000,
        liabilities: 300000,
        industry: 'Logistics & Transportation',
      },
      asset: {
        assetType: 'TRUCK',
        assetValue: 300000,
      },
      deal: {
        financeAmount: 225000,
        requestedTerm: 36,
      },
      riskScores: {
        companyRiskScore: 72,
        assetRiskScore: 84,
        dealRiskScore: 75,
      },
      documents: [
        {
          documentType: 'TRADE_LICENSE',
          fileName: 'trade-license.pdf',
          uploadedAt: new Date(Date.now() - 86400000),
        },
        {
          documentType: 'FINANCIAL_STATEMENT',
          fileName: 'financials.pdf',
          uploadedAt: new Date(Date.now() - 86400000),
        },
        {
          documentType: 'ASSET_QUOTE',
          fileName: 'truck-quote.pdf',
          uploadedAt: new Date(Date.now() - 86400000),
        },
      ],
    };

    const analysis = await analyzeApplicationWithAI(demoInput);
    const summary = await generateApplicationSummary(
      'APP-2024-001',
      'Gulf Logistics LLC',
      'Isuzu NPR 75P 16FT Box Truck',
      225000,
      'TIER_B'
    );

    return NextResponse.json({
      success: true,
      analysis,
      summary,
      note: 'This is a Phase 3 stub implementation. Real AI would use OpenAI/Claude APIs.',
    });
  } catch (error) {
    console.error('AI assist error:', error);
    return NextResponse.json(
      { error: 'Failed to run AI analysis' },
      { status: 500 }
    );
  }
}
