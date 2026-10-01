import { analyzeFinancialRisks, detectFraudSignals, analyzeMarketRisks, generateUnderwritingInsights, type RiskSignal } from './ai-risk-signals';

export interface UnderwritingAssistantResult {
  success: boolean;
  analysis: {
    financialRisks: RiskSignal[];
    fraudSignals: RiskSignal[];
    marketRisks: RiskSignal[];
    insights: string[];
    overallRecommendation: string;
    suggestedActions: string[];
  };
  confidence: number;
  error?: string;
}

export interface ApplicationAnalysisInput {
  company: {
    monthlyRevenue: number;
    monthlyExpenses: number;
    liabilities: number;
    industry: string;
  };
  asset: {
    assetType: string;
    assetValue: number;
  };
  deal: {
    financeAmount: number;
    requestedTerm: number;
  };
  riskScores: {
    companyRiskScore: number;
    assetRiskScore: number;
    dealRiskScore: number;
  };
  documents: Array<{
    documentType: string;
    fileName: string;
    uploadedAt: Date;
  }>;
}

export async function analyzeApplicationWithAI(
  input: ApplicationAnalysisInput
): Promise<UnderwritingAssistantResult> {
  console.log('🤖 AI Underwriting Assistant (Stub)');
  console.log('  Analyzing application with AI...');

  try {
    const cashFlow = input.company.monthlyRevenue - input.company.monthlyExpenses;

    const [financialAnalysis, fraudAnalysis, marketAnalysis, insights] = await Promise.all([
      analyzeFinancialRisks(
        input.company.monthlyRevenue,
        input.company.monthlyExpenses,
        input.company.liabilities,
        cashFlow
      ),
      detectFraudSignals(input.documents),
      analyzeMarketRisks(input.company.industry, input.asset.assetType),
      generateUnderwritingInsights(
        input.riskScores.companyRiskScore,
        input.riskScores.assetRiskScore,
        input.riskScores.dealRiskScore
      ),
    ]);

    const allSignals = [
      ...financialAnalysis.signals,
      ...fraudAnalysis.signals,
      ...marketAnalysis.signals,
    ];

    const criticalSignals = allSignals.filter((s) => s.severity === 'CRITICAL').length;
    const highSignals = allSignals.filter((s) => s.severity === 'HIGH').length;

    let overallRecommendation: string;
    let suggestedActions: string[] = [];

    if (criticalSignals > 0 || highSignals > 2) {
      overallRecommendation = 'REJECT or REQUEST_MORE_INFO';
      suggestedActions = [
        'Review all flagged risk signals',
        'Request additional documentation',
        'Consider alternative deal structure',
      ];
    } else if (highSignals > 0 || allSignals.length > 3) {
      overallRecommendation = 'CONDITIONAL_APPROVAL';
      suggestedActions = [
        'Add monitoring conditions',
        'Consider higher SME contribution',
        'Request personal guarantees',
      ];
    } else {
      overallRecommendation = 'APPROVE';
      suggestedActions = [
        'Proceed with standard terms',
        'Monitor payment performance',
        'Schedule periodic reviews',
      ];
    }

    const averageConfidence =
      allSignals.length > 0
        ? allSignals.reduce((sum, s) => sum + s.confidence, 0) / allSignals.length
        : 0.9;

    return {
      success: true,
      analysis: {
        financialRisks: financialAnalysis.signals,
        fraudSignals: fraudAnalysis.signals,
        marketRisks: marketAnalysis.signals,
        insights,
        overallRecommendation,
        suggestedActions,
      },
      confidence: averageConfidence,
    };
  } catch (error) {
    console.error('AI analysis error:', error);
    return {
      success: false,
      analysis: {
        financialRisks: [],
        fraudSignals: [],
        marketRisks: [],
        insights: [],
        overallRecommendation: 'ERROR',
        suggestedActions: ['Manual review required'],
      },
      confidence: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function generateApplicationSummary(
  applicationNo: string,
  companyName: string,
  assetDescription: string,
  financeAmount: number,
  riskTier: string
): Promise<string> {
  console.log('📝 AI Summary Generator (Stub)');

  await new Promise((resolve) => setTimeout(resolve, 300));

  return `
Application ${applicationNo} for ${companyName}:

Asset: ${assetDescription}
Finance Amount: AED ${financeAmount.toLocaleString()}
Risk Tier: ${riskTier}

AI Assessment: This application presents a ${riskTier === 'TIER_A' ? 'low' : riskTier === 'TIER_B' ? 'moderate' : 'elevated'} risk profile based on automated analysis. The company shows ${financeAmount > 200000 ? 'substantial' : 'reasonable'} financing requirements with appropriate asset backing.

Recommended Action: ${riskTier === 'TIER_A' || riskTier === 'TIER_B' ? 'Approve with standard terms' : 'Review with senior underwriter'}.
  `.trim();
}
