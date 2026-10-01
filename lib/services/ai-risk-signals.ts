export interface RiskSignal {
  signal: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  confidence: number;
  description: string;
  source: string;
}

export interface AIRiskAnalysisResult {
  success: boolean;
  signals: RiskSignal[];
  overallRiskScore: number;
  recommendation: string;
  error?: string;
}

export async function analyzeFinancialRisks(
  revenue: number,
  expenses: number,
  liabilities: number,
  cashFlow: number
): Promise<AIRiskAnalysisResult> {
  console.log('🤖 AI Financial Risk Analysis (Stub)');
  console.log('  Revenue:', revenue);
  console.log('  Expenses:', expenses);
  console.log('  Liabilities:', liabilities);
  console.log('  Cash Flow:', cashFlow);

  await new Promise((resolve) => setTimeout(resolve, 600));

  const signals: RiskSignal[] = [];

  if (cashFlow < expenses * 0.2) {
    signals.push({
      signal: 'LOW_CASH_FLOW',
      severity: 'HIGH',
      confidence: 0.87,
      description: 'Cash flow is less than 20% of monthly expenses',
      source: 'AI Financial Analyzer',
    });
  }

  if (liabilities > revenue * 12 * 0.8) {
    signals.push({
      signal: 'HIGH_DEBT_RATIO',
      severity: 'MEDIUM',
      confidence: 0.92,
      description: 'Total liabilities exceed 80% of annual revenue',
      source: 'AI Financial Analyzer',
    });
  }

  const overallRiskScore = signals.length > 0 ? 65 : 85;

  return {
    success: true,
    signals,
    overallRiskScore,
    recommendation:
      signals.length > 0
        ? 'Review cash flow carefully. Consider requesting additional collateral.'
        : 'Financial profile appears stable.',
  };
}

export async function detectFraudSignals(
  documents: Array<{ documentType: string; fileName: string; uploadedAt: Date }>
): Promise<AIRiskAnalysisResult> {
  console.log('🔍 AI Fraud Detection (Stub)');
  console.log('  Documents:', documents.length);

  await new Promise((resolve) => setTimeout(resolve, 800));

  const signals: RiskSignal[] = [];

  const hasMultipleVersions = documents.filter((d) => d.documentType === 'TRADE_LICENSE').length > 1;
  if (hasMultipleVersions) {
    signals.push({
      signal: 'MULTIPLE_DOCUMENT_VERSIONS',
      severity: 'MEDIUM',
      confidence: 0.75,
      description: 'Multiple versions of the same document type detected',
      source: 'AI Fraud Detector',
    });
  }

  const recentUploads = documents.filter(
    (d) => Date.now() - new Date(d.uploadedAt).getTime() < 3600000
  ).length;
  if (recentUploads === documents.length && documents.length > 5) {
    signals.push({
      signal: 'BULK_UPLOAD_PATTERN',
      severity: 'LOW',
      confidence: 0.6,
      description: 'All documents uploaded in a short time frame',
      source: 'AI Fraud Detector',
    });
  }

  return {
    success: true,
    signals,
    overallRiskScore: signals.length > 0 ? 70 : 90,
    recommendation:
      signals.length > 0 ? 'Manual verification recommended' : 'No fraud signals detected',
  };
}

export async function analyzeMarketRisks(
  industry: string,
  assetType: string
): Promise<AIRiskAnalysisResult> {
  console.log('📊 AI Market Risk Analysis (Stub)');
  console.log('  Industry:', industry);
  console.log('  Asset Type:', assetType);

  await new Promise((resolve) => setTimeout(resolve, 500));

  const signals: RiskSignal[] = [];

  if (industry.toLowerCase().includes('hospitality')) {
    signals.push({
      signal: 'INDUSTRY_VOLATILITY',
      severity: 'MEDIUM',
      confidence: 0.82,
      description: 'Hospitality sector shows increased volatility in current market',
      source: 'AI Market Analyzer',
    });
  }

  if (assetType === 'REFRIGERATED_VEHICLE') {
    signals.push({
      signal: 'SPECIALIZED_ASSET',
      severity: 'LOW',
      confidence: 0.78,
      description: 'Specialized asset may have limited resale market',
      source: 'AI Market Analyzer',
    });
  }

  return {
    success: true,
    signals,
    overallRiskScore: 75,
    recommendation: 'Market conditions appear favorable for this asset class',
  };
}

export async function generateUnderwritingInsights(
  companyRiskScore: number,
  assetRiskScore: number,
  dealRiskScore: number
): Promise<string[]> {
  console.log('💡 AI Underwriting Insights (Stub)');
  
  await new Promise((resolve) => setTimeout(resolve, 400));

  const insights: string[] = [];

  if (companyRiskScore > 80) {
    insights.push('✅ Strong company fundamentals indicate low credit risk');
  } else if (companyRiskScore < 50) {
    insights.push('⚠️ Consider requesting personal guarantees or additional collateral');
  }

  if (assetRiskScore > 80) {
    insights.push('✅ Asset has strong market liquidity and resale potential');
  }

  if (dealRiskScore > 75) {
    insights.push('✅ Deal structure is well-balanced');
  } else if (dealRiskScore < 55) {
    insights.push('⚠️ Consider adjusting LTV ratio or term length');
  }

  insights.push('💡 AI Recommendation: This application aligns with portfolio risk parameters');

  return insights;
}
