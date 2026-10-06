// Privileged role matrix. Least privilege: every action lists the only roles allowed to perform it.
// Application roles map onto these through ROLE_MAP; on-chain roles live in the facility contract (ADMIN, PAUSER,
// TREASURY, UNDERWRITER, OPERATIONS, COMPLIANCE) and are held by separate wallets.

export const PRIVILEGED_ROLES = ['PLATFORM_OWNER', 'CONTRACT_ADMIN', 'PAUSER', 'TREASURY', 'UNDERWRITER', 'OPERATIONS', 'COMPLIANCE', 'SERVICING', 'AUDITOR_READ_ONLY'] as const;
export type PrivilegedRole = (typeof PRIVILEGED_ROLES)[number];

export const ACTIONS = [
  'view_dashboards', 'manage_users', 'approve_underwriting', 'score_facility', 'attest_risk', 'attest_documents',
  'authorize_release', 'pay_supplier', 'confirm_delivery', 'record_repayment', 'quote_settlement', 'manage_collections',
  'authorize_recovery', 'pause_contracts', 'unpause_contracts', 'rotate_admin', 'upgrade_contract', 'manage_compliance',
  'manage_pilots', 'run_reconciliation', 'export_reports', 'manage_secrets', 'change_settlement_asset', 'exceptional_release',
] as const;
export type Action = (typeof ACTIONS)[number];

export const MATRIX: Record<Action, PrivilegedRole[]> = {
  view_dashboards: ['PLATFORM_OWNER', 'CONTRACT_ADMIN', 'TREASURY', 'UNDERWRITER', 'OPERATIONS', 'COMPLIANCE', 'SERVICING', 'AUDITOR_READ_ONLY'],
  manage_users: ['PLATFORM_OWNER'],
  approve_underwriting: ['UNDERWRITER'],
  score_facility: ['UNDERWRITER', 'OPERATIONS'],
  attest_risk: ['UNDERWRITER'],
  attest_documents: ['OPERATIONS', 'COMPLIANCE'],
  authorize_release: ['CONTRACT_ADMIN'],
  pay_supplier: ['TREASURY'],
  confirm_delivery: ['OPERATIONS'],
  record_repayment: ['OPERATIONS', 'SERVICING'],
  quote_settlement: ['OPERATIONS'],
  manage_collections: ['SERVICING', 'OPERATIONS'],
  authorize_recovery: ['OPERATIONS', 'CONTRACT_ADMIN'],
  pause_contracts: ['PAUSER', 'CONTRACT_ADMIN'],
  unpause_contracts: ['CONTRACT_ADMIN'],
  rotate_admin: ['PLATFORM_OWNER', 'CONTRACT_ADMIN'],
  upgrade_contract: ['PLATFORM_OWNER', 'CONTRACT_ADMIN'],
  manage_compliance: ['COMPLIANCE'],
  manage_pilots: ['PLATFORM_OWNER', 'OPERATIONS'],
  run_reconciliation: ['OPERATIONS', 'PLATFORM_OWNER', 'AUDITOR_READ_ONLY'],
  export_reports: ['PLATFORM_OWNER', 'OPERATIONS', 'TREASURY', 'AUDITOR_READ_ONLY'],
  manage_secrets: ['PLATFORM_OWNER'],
  change_settlement_asset: ['PLATFORM_OWNER', 'CONTRACT_ADMIN'],
  exceptional_release: ['PLATFORM_OWNER', 'CONTRACT_ADMIN'],
};

// Roles that must have MFA in Alpha and production-oriented modes.
export const MFA_REQUIRED: PrivilegedRole[] = ['PLATFORM_OWNER', 'CONTRACT_ADMIN', 'TREASURY', 'OPERATIONS'];

// Application login roles mapped to the privileged role they currently hold in this build.
export const ROLE_MAP: Record<string, PrivilegedRole[]> = {
  ADMIN: ['PLATFORM_OWNER', 'CONTRACT_ADMIN'],
  ADMIN_REVIEWER: ['OPERATIONS', 'SERVICING'],
  UNDERWRITER: ['UNDERWRITER'],
};

export const can = (roles: PrivilegedRole[], action: Action) => roles.some((role) => MATRIX[action].includes(role));
export const rolesFor = (appRole?: string | null): PrivilegedRole[] => ROLE_MAP[appRole || ''] || [];
export const canApp = (appRole: string | null | undefined, action: Action) => can(rolesFor(appRole), action);

// Separation of duties that must always hold.
export function separationViolations() {
  const issues: string[] = [];
  const holds = (action: Action, role: PrivilegedRole) => MATRIX[action].includes(role);
  if (MATRIX.authorize_release.some((role) => MATRIX.pay_supplier.includes(role))) issues.push('Release authorization and supplier payment share a role');
  if (holds('approve_underwriting', 'TREASURY')) issues.push('Treasury can approve underwriting');
  if (MATRIX.pause_contracts.includes('AUDITOR_READ_ONLY')) issues.push('Auditor can pause contracts');
  return issues;
}

// Multisig readiness. These policies are configuration. They are NOT enforced on-chain in this build: the
// Testnet deployment uses single role keys. Do not describe production multisig until it is deployed and used.
export type MultisigPolicy = { operation: string; threshold: number; signers: number; enforcedOnChain: boolean };
export const MULTISIG_POLICIES: MultisigPolicy[] = [
  { operation: 'Contract upgrade', threshold: 3, signers: 5, enforcedOnChain: false },
  { operation: 'Admin rotation', threshold: 2, signers: 3, enforcedOnChain: false },
  { operation: 'Treasury movement above limit', threshold: 2, signers: 3, enforcedOnChain: false },
  { operation: 'New settlement asset', threshold: 3, signers: 5, enforcedOnChain: false },
  { operation: 'Exceptional release', threshold: 2, signers: 3, enforcedOnChain: false },
];
export const multisigStatus = () => (MULTISIG_POLICIES.every((policy) => policy.enforcedOnChain) ? 'ENFORCED' : 'READY, NOT ENFORCED');

export function approvalSatisfied(policy: MultisigPolicy, approvals: string[]) {
  return new Set(approvals).size >= policy.threshold;
}
