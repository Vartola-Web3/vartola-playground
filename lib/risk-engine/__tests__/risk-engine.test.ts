import { calculateRisk, assignRiskTier } from '../index';
import { CompanyData, AssetData, DealData, ApplicationData } from '../index';

describe('Risk Engine', () => {
  const mockCompany: CompanyData = {
    establishedDate: new Date('2021-01-01'),
    monthlyRevenue: 180000,
    monthlyExpenses: 140000,
    liabilities: 300000,
    industry: 'Logistics & Transportation',
  };

  const mockAsset: AssetData = {
    assetType: 'TRUCK',
    assetDescription: 'Isuzu NPR 75P 16FT Box Truck - Brand New',
    assetValue: 300000,
  };

  const mockDeal: DealData = {
    financeAmount: 225000,
    assetValue: 300000,
    requestedTerm: 36,
  };

  const mockApplication: ApplicationData = {
    documents: [
      { documentType: 'TRADE_LICENSE' },
      { documentType: 'BANK_STATEMENT' },
      { documentType: 'FINANCIAL_STATEMENT' },
    ],
  };

  describe('assignRiskTier', () => {
    it('should assign TIER_A for score >= 81', () => {
      expect(assignRiskTier(85)).toBe('TIER_A');
      expect(assignRiskTier(81)).toBe('TIER_A');
    });

    it('should assign TIER_B for score 66-80', () => {
      expect(assignRiskTier(75)).toBe('TIER_B');
      expect(assignRiskTier(66)).toBe('TIER_B');
      expect(assignRiskTier(80)).toBe('TIER_B');
    });

    it('should assign TIER_C for score 51-65', () => {
      expect(assignRiskTier(60)).toBe('TIER_C');
      expect(assignRiskTier(51)).toBe('TIER_C');
      expect(assignRiskTier(65)).toBe('TIER_C');
    });

    it('should assign TIER_D for score <= 50', () => {
      expect(assignRiskTier(50)).toBe('TIER_D');
      expect(assignRiskTier(30)).toBe('TIER_D');
      expect(assignRiskTier(0)).toBe('TIER_D');
    });
  });

  describe('calculateRisk', () => {
    it('should calculate risk for Gulf Logistics truck application', () => {
      const result = calculateRisk({
        company: mockCompany,
        asset: mockAsset,
        deal: mockDeal,
        application: mockApplication,
      });

      expect(result.companyRiskScore).toBeGreaterThan(60);
      expect(result.companyRiskScore).toBeLessThan(80);
      
      expect(result.assetRiskScore).toBeGreaterThan(80);
      expect(result.assetRiskScore).toBeLessThan(90);
      
      expect(result.dealRiskScore).toBeGreaterThan(70);
      expect(result.dealRiskScore).toBeLessThan(80);
      
      expect(result.riskTier).toBe('TIER_B');
      
      expect(result.recommendations).toBeDefined();
      expect(result.recommendations.length).toBeGreaterThan(0);
      
      expect(result.tierParameters).toBeDefined();
      expect(result.tierParameters.maxLTV).toBe(0.75);
      expect(result.tierParameters.minContribution).toBe(0.25);
    });

    it('should handle low-risk scenarios', () => {
      const highQualityCompany: CompanyData = {
        ...mockCompany,
        establishedDate: new Date('2015-01-01'),
        monthlyRevenue: 400000,
        monthlyExpenses: 200000,
        liabilities: 100000,
      };

      const result = calculateRisk({
        company: highQualityCompany,
        asset: mockAsset,
        deal: { ...mockDeal, financeAmount: 150000 },
        application: mockApplication,
      });

      expect(result.riskTier).toMatch(/TIER_A|TIER_B/);
      expect(result.dealRiskScore).toBeGreaterThan(75);
    });

    it('should handle high-risk scenarios', () => {
      const weakCompany: CompanyData = {
        ...mockCompany,
        establishedDate: new Date('2024-01-01'),
        monthlyRevenue: 50000,
        monthlyExpenses: 45000,
        liabilities: 500000,
      };

      const result = calculateRisk({
        company: weakCompany,
        asset: mockAsset,
        deal: { ...mockDeal, financeAmount: 270000 },
        application: { documents: [] },
      });

      expect(result.dealRiskScore).toBeLessThan(60);
    });

    it('should provide detailed breakdowns', () => {
      const result = calculateRisk({
        company: mockCompany,
        asset: mockAsset,
        deal: mockDeal,
        application: mockApplication,
      });

      expect(result.companyBreakdown).toBeDefined();
      expect(result.assetBreakdown).toBeDefined();
      expect(result.dealBreakdown).toBeDefined();
      
      expect(result.companyBreakdown.totalScore).toBe(result.companyRiskScore);
      expect(result.assetBreakdown.totalScore).toBe(result.assetRiskScore);
      expect(result.dealBreakdown.totalScore).toBe(result.dealRiskScore);
    });
  });
});
