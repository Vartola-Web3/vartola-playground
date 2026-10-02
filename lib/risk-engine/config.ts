import { AssetType, RiskTier } from '@/lib/types';

export const RISK_ENGINE_CONFIG = {
  companyWeights: {
    age: 0.15,
    revenue: 0.25,
    cashFlow: 0.25,
    debtRatio: 0.20,
    industry: 0.10,
    documents: 0.05,
  },
  assetWeights: {
    type: 0.30,
    age: 0.20,
    value: 0.20,
    condition: 0.15,
    liquidity: 0.15,
  },
  dealWeights: {
    company: 0.40,
    asset: 0.30,
    ltv: 0.15,
    term: 0.10,
    affordability: 0.05,
  },
  tierThresholds: {
    A: 81,
    B: 66,
    C: 51,
    D: 0,
  },
};

export const INDUSTRY_SCORES: Record<string, number> = {
  'Logistics & Transportation': 75,
  'E-commerce Delivery': 80,
  'Construction': 60,
  'Hospitality': 55,
  'Healthcare': 85,
  'Manufacturing': 70,
  'Retail': 65,
  'F&B': 60,
  'Other': 50,
};

export const ASSET_TYPE_SCORES: Record<string, number> = {
  DELIVERY_MOTORCYCLE: 78,
  CARGO_VAN: 84,
  PICKUP: 80,
  SMALL_TRUCK: 86,
  MEDIUM_TRUCK: 82,
  TRUCK: 86,
  DELIVERY_VAN: 84,
  REFRIGERATED_VEHICLE: 74,
  TRAILER: 70,
  FORKLIFT: 60,
  OTHER: 50,
};

export const ASSET_LIQUIDITY_SCORES: Record<string, number> = {
  DELIVERY_MOTORCYCLE: 88,
  CARGO_VAN: 86,
  PICKUP: 84,
  SMALL_TRUCK: 80,
  MEDIUM_TRUCK: 76,
  TRUCK: 80,
  DELIVERY_VAN: 86,
  REFRIGERATED_VEHICLE: 70,
  TRAILER: 75,
  FORKLIFT: 68,
  OTHER: 50,
};

export interface TierParameters {
  maxLTV: number;
  minContribution: number;
  maxTerm: number;
  indicativeRate: { min: number; max: number };
  approvalLevel: string;
}

export const TIER_PARAMETERS: Record<RiskTier, TierParameters> = {
  TIER_A: {
    maxLTV: 0.80,
    minContribution: 0.20,
    maxTerm: 60,
    indicativeRate: { min: 6, max: 8 },
    approvalLevel: 'Auto-approved (subject to verification)',
  },
  TIER_B: {
    maxLTV: 0.75,
    minContribution: 0.25,
    maxTerm: 48,
    indicativeRate: { min: 8, max: 10 },
    approvalLevel: 'Senior Underwriter',
  },
  TIER_C: {
    maxLTV: 0.70,
    minContribution: 0.30,
    maxTerm: 36,
    indicativeRate: { min: 10, max: 12 },
    approvalLevel: 'Credit Committee',
  },
  TIER_D: {
    maxLTV: 0.60,
    minContribution: 0.40,
    maxTerm: 24,
    indicativeRate: { min: 12, max: 15 },
    approvalLevel: 'Reject or Special Approval',
  },
};
