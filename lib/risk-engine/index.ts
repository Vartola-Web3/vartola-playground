import { RiskTier } from '@/lib/types';
import {
  calculateCompanyRiskScore,
  CompanyData,
  ApplicationData,
  CompanyScoreBreakdown,
} from './company-score';
import { calculateAssetRiskScore, AssetData, AssetScoreBreakdown } from './asset-score';
import { calculateDealRiskScore, DealData, DealScoreBreakdown } from './deal-score';
import { RISK_ENGINE_CONFIG, TIER_PARAMETERS, TierParameters } from './config';

export interface RiskEngineInput {
  company: CompanyData;
  asset: AssetData;
  deal: DealData;
  application: ApplicationData;
}

export interface RiskEngineResult {
  companyRiskScore: number;
  assetRiskScore: number;
  dealRiskScore: number;
  riskTier: RiskTier;
  companyBreakdown: CompanyScoreBreakdown;
  assetBreakdown: AssetScoreBreakdown;
  dealBreakdown: DealScoreBreakdown;
  recommendations: string[];
  tierParameters: TierParameters;
}

export function assignRiskTier(dealRiskScore: number): RiskTier {
  if (dealRiskScore >= RISK_ENGINE_CONFIG.tierThresholds.A) return 'TIER_A';
  if (dealRiskScore >= RISK_ENGINE_CONFIG.tierThresholds.B) return 'TIER_B';
  if (dealRiskScore >= RISK_ENGINE_CONFIG.tierThresholds.C) return 'TIER_C';
  return 'TIER_D';
}

function generateRecommendations(
  tier: RiskTier,
  companyScore: number,
  assetScore: number,
  dealScore: number,
  ltv: number
): string[] {
  const recommendations: string[] = [];

  if (companyScore >= 70) {
    recommendations.push('✓ Company shows solid financial health');
  } else if (companyScore >= 50) {
    recommendations.push('⚠ Consider requesting additional financial documentation');
  } else {
    recommendations.push('⚠ Company financials require close review');
  }

  if (assetScore >= 80) {
    recommendations.push('✓ Asset has strong resale market and liquidity');
  } else if (assetScore >= 60) {
    recommendations.push('⚠ Asset resale market is acceptable');
  } else {
    recommendations.push('⚠ Asset recovery may be challenging');
  }

  if (ltv > 0.75) {
    recommendations.push('⚠ Consider higher SME contribution to reduce LTV');
  }

  if (tier === 'TIER_A') {
    recommendations.push('✓ Excellent risk profile - recommend approval');
  } else if (tier === 'TIER_B') {
    recommendations.push('✓ Good risk profile - senior underwriter approval recommended');
  } else if (tier === 'TIER_C') {
    recommendations.push('⚠ Elevated risk - credit committee review required');
  } else {
    recommendations.push('⚠ High risk - recommend rejection or special terms');
  }

  return recommendations;
}

export function calculateRisk(input: RiskEngineInput): RiskEngineResult {
  const companyBreakdown = calculateCompanyRiskScore(input.company, input.application);
  const assetBreakdown = calculateAssetRiskScore(input.asset);
  const dealBreakdown = calculateDealRiskScore(
    companyBreakdown.totalScore,
    assetBreakdown.totalScore,
    input.deal,
    input.company
  );

  const tier = assignRiskTier(dealBreakdown.totalScore);
  const ltv = input.deal.financeAmount / input.deal.assetValue;

  const recommendations = generateRecommendations(
    tier,
    companyBreakdown.totalScore,
    assetBreakdown.totalScore,
    dealBreakdown.totalScore,
    ltv
  );

  return {
    companyRiskScore: companyBreakdown.totalScore,
    assetRiskScore: assetBreakdown.totalScore,
    dealRiskScore: dealBreakdown.totalScore,
    riskTier: tier,
    companyBreakdown,
    assetBreakdown,
    dealBreakdown,
    recommendations,
    tierParameters: TIER_PARAMETERS[tier],
  };
}

// Re-export types for convenience
export type {
  CompanyData,
  ApplicationData,
  AssetData,
  DealData,
  CompanyScoreBreakdown,
  AssetScoreBreakdown,
  DealScoreBreakdown,
  TierParameters,
};
