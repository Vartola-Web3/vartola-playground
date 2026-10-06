import { AdminPage, Badge, Card, Stat, Table, statusTone } from '@/components/ops/ui';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function CompliancePage() {
  const [cases, users, wallets] = await Promise.all([
    prisma.complianceCase.findMany({ orderBy: { updatedAt: 'desc' }, take: 100 }).catch(() => []),
    prisma.user.findMany({ select: { id: true, role: true, accountStatus: true, country: true, residency: true, investorType: true, emailVerifiedAt: true, phoneVerifiedAt: true } }).catch(() => []),
    prisma.userWallet.count().catch(() => 0),
  ]);
  const count = (status: string) => cases.filter((row) => row.status === status).length;
  const restricted = users.filter((user) => user.accountStatus !== 'ACTIVE').length;
  const byCountry = new Map<string, number>();
  for (const user of users) byCountry.set(user.country || user.residency || 'Unspecified', (byCountry.get(user.country || user.residency || 'Unspecified') || 0) + 1);
  return (
    <AdminPage title="Compliance cases" intro="KYC/KYB state, review flags and account restrictions. Personal data stays off this page and off-chain. Only non-sensitive permissions and attestations are mirrored on-chain.">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Cases" value={cases.length} />
        <Stat label="Verified" value={count('VERIFIED') + count('APPROVED')} />
        <Stat label="In review" value={count('IN_REVIEW') + count('REVIEW') + count('PENDING')} />
        <Stat label="Restricted accounts" value={restricted} />
        <Stat label="Wallets with permission records" value={wallets} />
        <Stat label="Provider" value={cases[0]?.provider || 'SIMULATION'} hint="Sumsub test mode when credentials exist" />
      </div>
      <Card title="Cases (no personal data shown)">
        <Table head={['Subject', 'Provider', 'Status', 'Review reason', 'Updated']} rows={cases.map((row) => [`${row.subjectType} ${row.subjectId.slice(0, 8)}…`, row.provider, <Badge key={row.id} tone={statusTone(row.status)}>{row.status}</Badge>, row.reviewReason || '—', row.updatedAt.toLocaleDateString()])} empty="No compliance cases yet." />
      </Card>
      <Card title="Jurisdiction mix" note="Counts only, no identities.">
        <Table head={['Jurisdiction', 'Accounts']} rows={[...byCountry.entries()].map(([name, total]) => [name, total])} />
      </Card>
    </AdminPage>
  );
}
