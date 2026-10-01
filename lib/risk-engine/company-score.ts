import { RISK_ENGINE_CONFIG, INDUSTRY_SCORES } from './config';

export interface CompanyData {
  establishedDate: Date;
  monthlyRevenue: number | null;
  monthlyExpenses: number | null;
  liabilities: number | null;
  industry: string;
}

export interface ApplicationData {
  documents: Array<{ documentType: string }>;
}

export interface CompanyScoreBreakdown {
  ageScore: number;
  revenueScore: number;
  cashFlowScore: number;
  debtScore: number;
  industryScore: number;
  docScore: number;
  totalScore: number;
}

function monthsSince(date: Date): number {
  const now = new Date();
  const months = (now.getFullYear() - date.getFullYear()) * 12;
  return months + (now.getMonth() - date.getMonth());
}

export function calculateCompanyRiskScore(
  company: CompanyData,
  application: ApplicationData
): CompanyScoreBreakdown {
  const weights = RISK_ENGINE_CONFIG.companyWeights;

  // 1. Business Age Score (0-100)
  const ageInMonths = monthsSince(company.establishedDate);
  const ageScore = Math.min(100, (ageInMonths / 60) * 100); // Max at 5 years

  // 2. Revenue Score (0-100)
  const monthlyRevenue = company.monthlyRevenue || 0;
  const revenueScore = Math.min(100, (monthlyRevenue / 500000) * 100); // Max at AED 500K/month

  // 3. Cash Flow Score (0-100)
  const cashFlow = (company.monthlyRevenue || 0) - (company.monthlyExpenses || 0);
  const cashFlowScore =
    cashFlow > 0 ? Math.min(100, (cashFlow / 100000) * 100) : 0; // Max at AED 100K/month

  // 4. Debt Ratio Score (0-100)
  const annualRevenue = (company.monthlyRevenue || 0) * 12;
  const debtRatio =
    annualRevenue > 0 ? (company.liabilities || 0) / annualRevenue : 2;
  const debtScore =
    debtRatio < 0.3
      ? 100
      : debtRatio < 0.5
      ? 80
      : debtRatio < 0.8
      ? 60
      : debtRatio < 1.2
      ? 40
      : 20;

  // 5. Industry Risk Score (0-100)
  const industryScore = INDUSTRY_SCORES[company.industry] || 50;

  // 6. Document Completeness Score (0-100)
  const requiredDocs = ['TRADE_LICENSE', 'BANK_STATEMENT', 'FINANCIAL_STATEMENT'];
  const uploadedDocs = application.documents.map((d) => d.documentType);
  const completeness =
    requiredDocs.filter((d) => uploadedDocs.includes(d)).length / requiredDocs.length;
  const docScore = completeness * 100;

  // Weighted Average
  const totalScore = Math.round(
    ageScore * weights.age +
      revenueScore * weights.revenue +
      cashFlowScore * weights.cashFlow +
      debtScore * weights.debtRatio +
      industryScore * weights.industry +
      docScore * weights.documents
  );

  return {
    ageScore: Math.round(ageScore),
    revenueScore: Math.round(revenueScore),
    cashFlowScore: Math.round(cashFlowScore),
    debtScore: Math.round(debtScore),
    industryScore: Math.round(industryScore),
    docScore: Math.round(docScore),
    totalScore,
  };
}
