// Mainnet readiness scorecard. Statuses are set from real evidence. Nothing is marked COMPLETE without it, and the
// Mainnet action stays locked until every required gate is COMPLETE.

export type Status = 'COMPLETE' | 'PARTIAL' | 'BLOCKED' | 'NOT STARTED';
export type Requirement = { category: string; requirement: string; status: Status; evidence: string; required: boolean };

export const REQUIREMENTS: Requirement[] = [
  { category: 'TECHNICAL', requirement: 'Soroban contracts deployed and exercised on Testnet', status: 'COMPLETE', evidence: '/technical, /proof: v3 contracts, three facilities, 44 contract tests', required: true },
  { category: 'TECHNICAL', requirement: 'Indexer and reconciliation running', status: 'COMPLETE', evidence: '/admin/reconciliation, scheduled cron', required: true },
  { category: 'TECHNICAL', requirement: 'Performance tested at production volume', status: 'PARTIAL', evidence: 'Local load simulation only (docs/operations/BENCHMARKS.md); no real volume test', required: true },
  { category: 'SECURITY', requirement: 'Independent smart-contract audit', status: 'NOT STARTED', evidence: 'Audit readiness package prepared (docs/audit-package); no audit engaged', required: true },
  { category: 'SECURITY', requirement: 'Penetration test', status: 'NOT STARTED', evidence: 'None performed', required: true },
  { category: 'SECURITY', requirement: 'Admin MFA and encrypted secrets', status: 'COMPLETE', evidence: 'TOTP MFA in Alpha mode; encrypted settings (lib/security)', required: true },
  { category: 'SECURITY', requirement: 'Multisig for privileged operations', status: 'PARTIAL', evidence: 'Policies defined, not enforced on-chain', required: true },
  { category: 'SECURITY', requirement: 'Managed key custody (HSM or equivalent)', status: 'NOT STARTED', evidence: 'Testnet role keys only', required: true },
  { category: 'LEGAL', requirement: 'Approved facility, investor and assignment agreements', status: 'NOT STARTED', evidence: 'Drafts only, not reviewed by counsel', required: true },
  { category: 'LEGAL', requirement: 'Asset ownership and security structure', status: 'NOT STARTED', evidence: 'Requires counsel', required: true },
  { category: 'REGULATORY', requirement: 'Regulatory opinion and licensing route', status: 'NOT STARTED', evidence: 'No licence or approval held', required: true },
  { category: 'CUSTODY', requirement: 'Production custody and client-money design', status: 'BLOCKED', evidence: 'Depends on regulated partner', required: true },
  { category: 'PAYMENTS', requirement: 'Approved settlement asset and payment rail', status: 'BLOCKED', evidence: 'VTAED is a Testnet asset with no value', required: true },
  { category: 'OPERATIONS', requirement: 'Production environment and runbooks', status: 'PARTIAL', evidence: 'docs/security and docs/operations drafted; not exercised', required: true },
  { category: 'SERVICING', requirement: 'Servicing and collections workflow', status: 'PARTIAL', evidence: '/admin/collections built; no live servicing partner', required: true },
  { category: 'MONITORING', requirement: 'Production monitoring and alerting', status: 'PARTIAL', evidence: '/admin/operations-health; no external pager integration', required: true },
  { category: 'BUSINESS CONTINUITY', requirement: 'Backup, recovery and wind-down plan tested', status: 'PARTIAL', evidence: 'Plans drafted; recovery not tested end to end', required: true },
];

export function summarize(requirements = REQUIREMENTS) {
  const byCategory = new Map<string, Record<Status, number>>();
  for (const item of requirements) {
    const row = byCategory.get(item.category) || { COMPLETE: 0, PARTIAL: 0, BLOCKED: 0, 'NOT STARTED': 0 };
    row[item.status] += 1;
    byCategory.set(item.category, row);
  }
  const required = requirements.filter((item) => item.required);
  const complete = required.filter((item) => item.status === 'COMPLETE').length;
  return { byCategory: [...byCategory.entries()], complete, total: required.length, mainnetUnlocked: complete === required.length };
}

// The only way to unlock Mainnet is for every required item to be COMPLETE.
export const mainnetAvailable = (requirements = REQUIREMENTS) => summarize(requirements).mainnetUnlocked;
