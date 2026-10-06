import { AdminPage, Badge, Card, Stat, Table, statusTone } from '@/components/ops/ui';
import { MfaPanel } from '@/components/ops/mfa-panel';
import { prisma } from '@/lib/db';
import { isAlphaMode } from '@/lib/config/app-mode';
import { hoursAgo } from '@/lib/ops/time';
import { TESTNET } from '@/lib/docs/testnet';
import { ACTIONS, MATRIX, MFA_REQUIRED, MULTISIG_POLICIES, PRIVILEGED_ROLES, multisigStatus, separationViolations } from '@/lib/ops/roles';

export const dynamic = 'force-dynamic';

export default async function SecurityPage() {
  const since = hoursAgo(7 * 24);
  const [mfaEnrolled, adminCount, failed, privileged, roles] = await Promise.all([
    prisma.userMfa.count({ where: { confirmedAt: { not: null } } }).catch(() => 0),
    prisma.user.count({ where: { role: { in: ['ADMIN', 'ADMIN_REVIEWER'] } } }).catch(() => 0),
    prisma.auditLog.count({ where: { action: { contains: 'FAILED' }, createdAt: { gte: since } } }).catch(() => 0),
    prisma.auditLog.count({ where: { OR: [{ action: { contains: 'RELEASE' } }, { action: { contains: 'ROLE' } }, { action: { contains: 'PAUSE' } }], createdAt: { gte: since } } }).catch(() => 0),
    prisma.contractRole.findMany({ orderBy: { role: 'asc' } }).catch(() => []),
  ]);
  const violations = separationViolations();
  return (
    <AdminPage title="Security center" intro="Controls and evidence. No secret is ever shown. Everything here is INTERNAL / PRE-AUDIT: no independent audit or penetration test has been completed.">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Admin MFA" value={`${mfaEnrolled} of ${adminCount} enrolled`} hint={isAlphaMode() ? 'Enforced in Alpha mode' : 'Enforced in Alpha mode; demo accounts exempt'} />
        <Stat label="Contract version" value={`v${TESTNET.deployment.contractVersion ?? 3}`} hint="Stellar Testnet" />
        <Stat label="Failed attempts (7d)" value={failed} />
        <Stat label="Privileged actions (7d)" value={privileged} />
        <Stat label="Emergency pause" value="Available" hint="Pauser role can pause; only the contract admin can resume" />
        <Stat label="Key management" value="Testnet role keys" hint="Production needs managed custody" />
        <Stat label="Multisig" value={<Badge tone={statusTone(multisigStatus())}>{multisigStatus()}</Badge>} />
        <Stat label="Independent audit" value={<Badge tone="bad">NOT STARTED</Badge>} hint="Audit readiness package prepared" />
      </div>

      <Card title="Your account second factor"><MfaPanel /></Card>

      <Card title="Privileged role wallets" note="Separate wallets per contract role. Addresses only.">
        <Table head={['Role', 'Address']} rows={roles.map((row) => [row.role, <span key={row.role} className="break-all">{row.address}</span>])} empty="Recorded when Alpha governance is prepared." />
      </Card>

      <Card title="Privileged role matrix" note={violations.length ? `Separation violations: ${violations.join('; ')}` : 'Separation of duties holds: release authorization and supplier payment are different roles.'}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[40rem] text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200"><th className="py-2 pr-2 font-medium">Action</th>{PRIVILEGED_ROLES.map((role) => <th key={role} className="px-1 py-2 font-medium">{role.replaceAll('_', ' ')}</th>)}</tr>
            </thead>
            <tbody>
              {ACTIONS.map((action) => (
                <tr key={action} className="border-b border-slate-100">
                  <td className="py-1.5 pr-2">{action.replaceAll('_', ' ')}</td>
                  {PRIVILEGED_ROLES.map((role) => <td key={role} className="px-1 text-center">{MATRIX[action].includes(role) ? '●' : ''}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs text-slate-500">MFA required for: {MFA_REQUIRED.join(', ')}.</p>
      </Card>

      <Card title="Multisig readiness" note="Thresholds are configured policy. They are not enforced on-chain in this build and must not be described as production multisig.">
        <Table head={['Operation', 'Threshold', 'Enforced on-chain']} rows={MULTISIG_POLICIES.map((policy) => [policy.operation, `${policy.threshold}-of-${policy.signers}`, policy.enforcedOnChain ? 'Yes' : 'No'])} />
      </Card>
    </AdminPage>
  );
}
