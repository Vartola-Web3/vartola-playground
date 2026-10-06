import { AdminPage, Badge, Card, Stat, Table, TESTNET_BANNER, aed, statusTone } from '@/components/ops/ui';
import { treasurySummary } from '@/lib/ops/portfolio-data';
import { getLastReconciliation } from '@/lib/alpha/ops-state';
import { MATRIX } from '@/lib/ops/roles';
import { RecordManager } from '@/components/ops/record-manager';

export const dynamic = 'force-dynamic';

export default async function TreasuryPage() {
  const [t, last] = await Promise.all([treasurySummary(), getLastReconciliation().catch(() => null)]);
  const recon = last?.status || 'NOT RUN';
  const metrics: [string, number, string][] = [
    ['Total committed', t.totalCommitted, 'Investor commitments'],
    ['Total funded', t.totalFunded, 'Facility funding'],
    ['Total deployed', t.totalDeployed, 'Released toward approved suppliers'],
    ['Escrow balances', t.escrowBalance, 'Funded, not yet released'],
    ['Supplier releases', t.supplierReleases, 'Confirmed supplier payments'],
    ['Expected repayments', t.expectedRepayments, 'Scheduled'],
    ['Received repayments', t.receivedRepayments, 'Paid'],
    ['Outstanding principal', t.outstandingPrincipal, 'Drawn facilities'],
    ['Investor liabilities', t.investorLiabilities, 'Deployed less principal returned'],
    ['Reserve balances', t.reserveBalance, 'Configured reserves only; not a guarantee'],
    ['Recovery balances', t.recoveryBalance, 'Net recovery proceeds'],
    ['Settlement amounts', t.settlementAmounts, 'Completed facilities'],
  ];
  return (
    <AdminPage title="Treasury control center" intro={`${TESTNET_BANNER} Application state is the Prisma read model. In Alpha mode the chain state is the source and reconciliation compares them.`}>
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <span>Mode: <strong>{t.mode}</strong></span>
        <span>Reconciliation: <Badge tone={statusTone(recon)}>{recon}</Badge></span>
        <span>{t.chainConfirmedFacilities} of {t.facilities} facilities chain-confirmed</span>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{metrics.map(([label, value, hint]) => <Stat key={label} label={label} value={aed(value)} hint={hint} />)}</div>
      <Card title="Chain state vs application state" note="Application state is shown above. Chain state is read live by reconciliation and the public proof pages; a mismatch is reported there and never overwritten.">
        <Table
          head={['Check', 'Source of truth', 'Status']}
          rows={[
            ['Facility state, funding, units', 'Soroban facility contract (Alpha) / Prisma (Demo)', <Badge key="a" tone={statusTone(recon)}>{recon}</Badge>],
            ['Investor positions', 'Soroban positions / Prisma allocations', <Badge key="b" tone={statusTone(recon)}>{recon}</Badge>],
            ['Repayments, distributions, recovery', 'Soroban events / Prisma payments', <Badge key="c" tone={statusTone(recon)}>{recon}</Badge>],
          ]}
        />
      </Card>
      <Card title="Who may move money" note="Least privilege. Release authorization and supplier payment are separate roles.">
        <Table head={['Action', 'Roles']} rows={(['authorize_release', 'pay_supplier', 'exceptional_release', 'change_settlement_asset', 'rotate_admin'] as const).map((action) => [action.replaceAll('_', ' '), MATRIX[action].join(', ')])} />
      </Card>
      <Card title="Facility reserves" note="A reserve is optional and set by facility terms. It may be used only for the permitted uses listed on the facility. It is not a guarantee of investor protection.">
        <p className="mb-3 text-xs text-slate-500">Record the reserve policy per facility. Balances here feed the reserve balance above.</p>
      </Card>
      <RecordManager
        kind="FACILITY_RESERVE"
        title="facility reserve"
        keyField="facilityNo"
        defaultStatus="ACTIVE"
        statuses={['PROPOSED', 'ACTIVE', 'SUSPENDED']}
        fields={[
          { name: 'facilityNo', label: 'Facility' },
          { name: 'reserveRate', label: 'Reserve rate (basis points of each payment)', type: 'number' },
          { name: 'reserveTarget', label: 'Reserve target', type: 'number' },
          { name: 'reserveBalance', label: 'Reserve balance', type: 'number' },
          { name: 'reservePolicy', label: 'Permitted uses', type: 'select', options: ['SHORTFALL', 'SERVICING_COST', 'RECOVERY_COST', 'INSURANCE_DEDUCTIBLE', 'OTHER_CONFIGURED'] },
        ]}
        summaryFields={['reserveRate', 'reserveTarget', 'reserveBalance', 'reservePolicy']}
      />
    </AdminPage>
  );
}
