import { RISK_ENGINE_CONFIG } from './config';
import { CompanyData } from './company-score';

export interface DealData {
  financeAmount: number;
  assetValue: number;
  requestedTerm: number;
}

export interface DealScoreBreakdown {
  companyScore: number;
  assetScore: number;
  ltvScore: number;
  termScore: number;
  affordabilityScore: number;
  totalScore: number;
}

function calculateMonthlyPayment(
  principal: number,
  termMonths: number,
  annualRate: number
): number {
  const monthlyRate = annualRate / 12;
  const payment =
    (principal * monthlyRate * Math.pow(1 + monthlyRate, termMonths)) /
    (Math.pow(1 + monthlyRate, termMonths) - 1);
  return payment;
}

export function calculateDealRiskScore(
  companyScore: number,
  assetScore: number,
  deal: DealData,
  company: CompanyData
): DealScoreBreakdown {
  const weights = RISK_ENGINE_CONFIG.dealWeights;

  // 1. Company and Asset Scores (already 0-100)
  // These are passed in directly

  // 2. Finance-to-Value (LTV) Score (0-100)
  const ltv = deal.financeAmount / deal.assetValue;
  const ltvScore =
    ltv < 0.5 ? 100 : ltv < 0.65 ? 90 : ltv < 0.75 ? 80 : ltv < 0.85 ? 60 : 40;

  // 3. Term Length Score (0-100)
  const term = deal.requestedTerm;
  const termScore = term <= 24 ? 100 : term <= 36 ? 85 : term <= 48 ? 70 : 50;

  // 4. Payment Affordability Score (0-100)
  const monthlyPayment = calculateMonthlyPayment(deal.financeAmount, deal.requestedTerm, 0.08);
  const cashFlow = (company.monthlyRevenue || 0) - (company.monthlyExpenses || 0);
  const paymentRatio = cashFlow > 0 ? monthlyPayment / cashFlow : 2;
  const affordabilityScore =
    paymentRatio < 0.2
      ? 100
      : paymentRatio < 0.3
      ? 85
      : paymentRatio < 0.4
      ? 70
      : paymentRatio < 0.5
      ? 50
      : 30;

  // Weighted Average
  const totalScore = Math.round(
    companyScore * weights.company +
      assetScore * weights.asset +
      ltvScore * weights.ltv +
      termScore * weights.term +
      affordabilityScore * weights.affordability
  );

  return {
    companyScore,
    assetScore,
    ltvScore: Math.round(ltvScore),
    termScore: Math.round(termScore),
    affordabilityScore: Math.round(affordabilityScore),
    totalScore,
  };
}
