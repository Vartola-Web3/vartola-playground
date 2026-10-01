import { AssetType } from '@/lib/types';
import { RISK_ENGINE_CONFIG, ASSET_TYPE_SCORES, ASSET_LIQUIDITY_SCORES } from './config';

export interface AssetData {
  assetType: AssetType;
  assetDescription: string;
  assetValue: number;
}

export interface AssetScoreBreakdown {
  assetTypeScore: number;
  ageScore: number;
  valueScore: number;
  conditionScore: number;
  liquidityScore: number;
  totalScore: number;
}

export function calculateAssetRiskScore(asset: AssetData): AssetScoreBreakdown {
  const weights = RISK_ENGINE_CONFIG.assetWeights;

  // 1. Asset Type Score (0-100)
  const assetTypeScore = ASSET_TYPE_SCORES[asset.assetType] || 50;

  // 2. Asset Age Score (0-100)
  const isNew = asset.assetDescription.toLowerCase().includes('new');
  const ageScore = isNew ? 100 : 70;

  // 3. Value vs. Market Score (0-100)
  const assetValue = asset.assetValue;
  const valueScore = assetValue >= 50000 && assetValue <= 1000000 ? 80 : 60;

  // 4. Asset Condition Score (0-100)
  const conditionScore = isNew ? 100 : 75;

  // 5. Resale Liquidity Score (0-100)
  const liquidityScore = ASSET_LIQUIDITY_SCORES[asset.assetType] || 60;

  // Weighted Average
  const totalScore = Math.round(
    assetTypeScore * weights.type +
      ageScore * weights.age +
      valueScore * weights.value +
      conditionScore * weights.condition +
      liquidityScore * weights.liquidity
  );

  return {
    assetTypeScore: Math.round(assetTypeScore),
    ageScore: Math.round(ageScore),
    valueScore: Math.round(valueScore),
    conditionScore: Math.round(conditionScore),
    liquidityScore: Math.round(liquidityScore),
    totalScore,
  };
}
