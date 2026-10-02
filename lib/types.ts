// User Roles
export type UserRole = 'SME' | 'INVESTOR' | 'UNDERWRITER' | 'ADMIN';

// Application Statuses
export type ApplicationStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'CONDITIONALLY_APPROVED'
  | 'REJECTED'
  | 'FUNDED'
  | 'CANCELLED';

// Risk Tiers
export type RiskTier = 'TIER_A' | 'TIER_B' | 'TIER_C' | 'TIER_D';

// Asset Types
export type AssetType =
  | 'DELIVERY_MOTORCYCLE'
  | 'CARGO_VAN'
  | 'PICKUP'
  | 'SMALL_TRUCK'
  | 'MEDIUM_TRUCK';

// Facility Statuses
export type FacilityStatus =
  | 'PENDING_FUNDING'
  | 'ACTIVE'
  | 'CURRENT'
  | 'LATE'
  | 'DEFAULT'
  | 'COMPLETED'
  | 'CLOSED';

// Pool Statuses
export type PoolStatus =
  | 'DRAFT'
  | 'OPEN'
  | 'FUNDING'
  | 'CLOSED'
  | 'ACTIVE'
  | 'LIQUIDATING'
  | 'COMPLETED';

// Investment Statuses
export type InvestmentStatus = 'PENDING' | 'ACTIVE' | 'REDEEMED' | 'CANCELLED';

// Payment Statuses
export type PaymentStatus = 'SCHEDULED' | 'PENDING' | 'PAID' | 'LATE' | 'MISSED';

// Document Types
export type DocumentType =
  | 'TRADE_LICENSE'
  | 'EMIRATES_ID'
  | 'BANK_STATEMENT'
  | 'FINANCIAL_STATEMENT'
  | 'ASSET_INVOICE'
  | 'ASSET_PHOTO'
  | 'INSURANCE_CERTIFICATE'
  | 'OTHER';

// Review Decision
export type ReviewDecision =
  | 'APPROVED'
  | 'CONDITIONALLY_APPROVED'
  | 'REJECTED'
  | 'REQUEST_MORE_INFO';

// Risk Score Result
export interface RiskScoreResult {
  companyRiskScore: number;
  assetRiskScore: number;
  dealRiskScore: number;
  riskTier: RiskTier;
  recommendations: string[];
}

// Tier Parameters
export interface TierParameters {
  maxLTV: number;
  minContribution: number;
  maxTerm: number;
  indicativeRate: { min: number; max: number };
}
