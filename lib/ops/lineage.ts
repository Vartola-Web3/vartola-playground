// Data lineage register. It documents, for important fields, the source type and where the value is produced, so an
// administrator or auditor can trace a number. It is a map of the code.

export type Source = 'CONTRACT' | 'INDEXED EVENT' | 'CALCULATED' | 'ADMIN INPUT' | 'PROVIDER' | 'DOCUMENT';
export type Lineage = { field: string; source: Source; producedBy: string; reference: string };

export const LINEAGE: Lineage[] = [
  { field: 'Facility status', source: 'CONTRACT', producedBy: 'Soroban facility contract, projected to Prisma by the indexer', reference: 'facility_contract v3; lib/alpha/reconcile.ts' },
  { field: 'Funded amount and issued units', source: 'CONTRACT', producedBy: 'Facility contract subscription and reserve calls', reference: 'funded_amount, issued_units' },
  { field: 'Investor position units', source: 'CONTRACT', producedBy: 'Facility contract positions, non-transferable', reference: 'lib/alpha/positions.ts' },
  { field: 'Transaction hash and ledger', source: 'INDEXED EVENT', producedBy: 'Cursor-based indexer from Soroban events', reference: 'lib/stellar/indexer.ts; chain_events' },
  { field: 'Repayment split (fee, reserve, principal, income)', source: 'CALCULATED', producedBy: 'One waterfall shared by the contract and the TypeScript mirror', reference: 'finance_math; lib/finance/waterfall-v2.ts' },
  { field: 'Outstanding principal', source: 'CONTRACT', producedBy: 'Contract principal_outstanding; Prisma mirrors it', reference: 'lib/alpha/reconcile.ts' },
  { field: 'Facility risk score and grade', source: 'CALCULATED', producedBy: 'Deterministic rule-based model with hashed inputs', reference: 'facility-risk-v2; lib/risk-engine/facility-score.ts' },
  { field: 'Risk attestation', source: 'CONTRACT', producedBy: 'Underwriter attests the input hash, model version, score and grade', reference: 'RiskAttested event' },
  { field: 'PD, LGD, EAD and expected loss', source: 'CALCULATED', producedBy: 'Internal expected-loss model with configurable assumptions', reference: 'vartola-el-v1; lib/risk-engine/expected-loss.ts' },
  { field: 'Asset valuation', source: 'ADMIN INPUT', producedBy: 'Entered by an administrator with a valuation source', reference: 'asset servicing events' },
  { field: 'Asset health score', source: 'CALCULATED', producedBy: 'Internal indicator from insurance, registration, maintenance, condition, age and valuation', reference: 'asset-health-v1' },
  { field: 'KYC / KYB status', source: 'PROVIDER', producedBy: 'Sumsub webhook updates a compliance case', reference: 'compliance_cases' },
  { field: 'Document hash', source: 'DOCUMENT', producedBy: 'SHA-256 of the uploaded file at upload time', reference: 'document_attestations' },
  { field: 'Release conditions', source: 'CONTRACT', producedBy: 'Each condition attested by its role with an evidence hash', reference: 'ReleaseConditionAttested events' },
  { field: 'Collections stage', source: 'ADMIN INPUT', producedBy: 'A person confirms each move; allowed paths enforced', reference: 'lib/servicing/collections.ts; audit log' },
  { field: 'Pilot pipeline entries and KPIs', source: 'ADMIN INPUT', producedBy: 'Entered by an administrator; KPIs computed from entries only', reference: 'lib/ops/pilots.ts' },
];
