export function mapRiskRating(score: number) {
  if (score >= 90) return 'A+';
  if (score >= 85) return 'A';
  if (score >= 80) return 'A-';
  if (score >= 75) return 'B+';
  if (score >= 70) return 'B';
  if (score >= 65) return 'B-';
  if (score >= 55) return 'C+';
  if (score >= 50) return 'C';
  return 'High Risk';
}

export function poolRiskScore(input: {
  companyQuality: number;
  assetQuality: number;
  diversification: number;
  smeContribution: number;
  concentrationRisk: number;
}) {
  const score = Math.round(
    input.companyQuality * 0.4 +
      input.assetQuality * 0.25 +
      input.diversification * 0.15 +
      input.smeContribution * 0.1 +
      (100 - input.concentrationRisk) * 0.1
  );
  return { score, rating: mapRiskRating(score) };
}
