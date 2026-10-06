import { AdminPage, Badge, Card, Table, statusTone } from '@/components/ops/ui';
import { REQUIREMENTS, summarize } from '@/lib/ops/readiness';

export const dynamic = 'force-dynamic';

export default function ReadinessPage() {
  const s = summarize();
  return (
    <AdminPage title="Mainnet readiness" intro="Mainnet is a controlled, regulated transition, not a marketing milestone. Each requirement is set from real evidence. The Mainnet action stays locked until every required gate is complete.">
      <Card title="Gate status">
        <p className="text-sm">{s.complete} of {s.total} required gates complete.</p>
        <button type="button" disabled className="mt-3 cursor-not-allowed rounded-full bg-slate-200 px-4 py-2 text-sm font-medium text-slate-500" title="Locked until every required gate is complete">
          {s.mainnetUnlocked ? 'Mainnet gate open' : 'Mainnet unavailable'}
        </button>
      </Card>
      <Card title="By category">
        <Table head={['Category', 'Complete', 'Partial', 'Blocked', 'Not started']} rows={s.byCategory.map(([category, row]) => [category, row.COMPLETE, row.PARTIAL, row.BLOCKED, row['NOT STARTED']])} />
      </Card>
      <Card title="Requirements and evidence">
        <Table head={['Category', 'Requirement', 'Status', 'Evidence']} rows={REQUIREMENTS.map((item) => [item.category, item.requirement, <Badge key={item.requirement} tone={statusTone(item.status)}>{item.status}</Badge>, item.evidence])} />
      </Card>
    </AdminPage>
  );
}
