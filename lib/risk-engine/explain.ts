import type { FacilityRiskResult, ComponentName } from './facility-score';

// Underwriter-facing explanation of a facility score: positive factors, negative factors, key risks, mitigants.
// Derived only from the deterministic components, so the explanation always matches the number.

const LABEL: Record<ComponentName, string> = {
  business: 'Company financial strength',
  asset: 'Asset quality',
  deal: 'Deal structure',
  servicing: 'Payment performance',
  concentration: 'Portfolio concentration',
  contribution: 'SME contribution',
  financeToValue: 'Finance-to-value',
  paymentCapacity: 'Cash-flow coverage',
  liquidity: 'Asset resale liquidity',
};

const RISK_TEXT: Partial<Record<ComponentName, [string, string]>> = {
  business: ['Weak operating or balance-sheet profile', 'Review recent financials and consider a larger contribution or guarantor'],
  asset: ['Asset with weaker resale or depreciation profile', 'Tighten finance-to-value and require insurance'],
  deal: ['Long term or stretched structure', 'Shorten the term or lower the advance'],
  servicing: ['Late or missed payments', 'Escalate through the collections workflow'],
  concentration: ['Large share of the portfolio with one SME', 'Apply a concentration limit before further funding'],
  contribution: ['Low SME contribution', 'Require a higher upfront contribution'],
  financeToValue: ['High finance-to-value leaves a thin collateral buffer', 'Lower the financed amount or add reserve'],
  paymentCapacity: ['Payment is a large share of net cash flow, or cash flow is unknown', 'Obtain bank statements and size the payment to cash flow'],
  liquidity: ['Asset may be hard to resell', 'Prefer common asset classes with a deep secondary market'],
};

const MITIGANT_TEXT: Partial<Record<ComponentName, string>> = {
  contribution: 'High SME contribution',
  financeToValue: 'Conservative finance-to-value',
  liquidity: 'Strong asset resale liquidity',
  concentration: 'Low concentration with one SME',
  servicing: 'Clean payment history',
  paymentCapacity: 'Comfortable cash-flow coverage',
  deal: 'Short, conservative deal structure',
  business: 'Established, profitable company',
  asset: 'Durable, well-supported asset class',
};

export type RiskExplanation = {
  positives: string[];
  negatives: string[];
  keyRisks: string[];
  mitigants: string[];
  headline: string;
};

export function explainRisk(result: FacilityRiskResult): RiskExplanation {
  const entries = (Object.entries(result.components) as [ComponentName, number][]).filter(([, value]) => typeof value === 'number');
  const positives = entries.filter(([, value]) => value >= 80).sort((a, b) => b[1] - a[1]).map(([name, value]) => `${LABEL[name]} scores ${Math.round(value)}`);
  const weak = entries.filter(([, value]) => value < 60).sort((a, b) => a[1] - b[1]);
  const negatives = weak.map(([name, value]) => `${LABEL[name]} scores ${Math.round(value)}`);
  const keyRisks = weak.map(([name]) => RISK_TEXT[name]?.[0]).filter((text): text is string => Boolean(text));
  const mitigants = entries.filter(([, value]) => value >= 80).map(([name]) => MITIGANT_TEXT[name]).filter((text): text is string => Boolean(text));
  return {
    positives,
    negatives,
    keyRisks,
    mitigants,
    headline: `Grade ${result.grade}, score ${result.score}, model ${result.modelVersion}. Internal estimate, not a regulated rating.`,
  };
}

// Suggested underwriter actions for the weak components.
export function suggestedActions(result: FacilityRiskResult) {
  return (Object.entries(result.components) as [ComponentName, number][])
    .filter(([, value]) => typeof value === 'number' && value < 60)
    .map(([name]) => RISK_TEXT[name]?.[1])
    .filter((text): text is string => Boolean(text));
}
