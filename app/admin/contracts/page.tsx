import { AdminPage, Card, Table } from '@/components/ops/ui';
import { RecordManager } from '@/components/ops/record-manager';
import { TESTNET, contractUrl, txUrl } from '@/lib/docs/testnet';
import { listRecords } from '@/lib/ops/records';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function ContractsPage() {
  const d = TESTNET.deployment;
  const governance = await listRecords('CONTRACT_GOVERNANCE').catch(() => []);
  const roles = await prisma.contractRole.findMany({ orderBy: { role: 'asc' } }).catch(() => []);
  return (
    <AdminPage title="Contract governance" intro="Contract versions, deployment and upgrade history, and who authorized each change. Contract IDs and transaction hashes come from the recorded Testnet deployment, never from this page.">
      <Card title="Current contracts (Stellar Testnet)">
        <Table
          head={['Contract', 'Version', 'ID']}
          rows={[
            ['wallet_registry', `v${d.contractVersion ?? 3}`, <a key="r" className="break-all text-emerald-700 underline" href={contractUrl(d.registryContractId)}>{d.registryContractId}</a>],
            ['facility_contract', `v${d.contractVersion ?? 3}`, <a key="f" className="break-all text-emerald-700 underline" href={contractUrl(d.facilityContractId)}>{d.facilityContractId}</a>],
            ['VTAED asset contract', 'SAC', <a key="a" className="break-all text-emerald-700 underline" href={contractUrl(d.asset.contractId)}>{d.asset.contractId}</a>],
          ]}
        />
      </Card>
      <Card title="Version history" note="Superseded contracts are kept for traceability. They had no real use.">
        <Table head={['Version', 'Facility contract', 'Note']} rows={(d.history || []).map((row) => [row.version, <span key={row.version} className="break-all">{row.facilityContractId}</span>, row.note])} empty="No earlier versions recorded." />
      </Card>
      <Card title="Deployment transactions">
        <Table head={['Step', 'Ledger', 'Transaction']} rows={Object.entries(d.transactions).map(([step, tx]) => [step, tx.ledger, <a key={step} className="break-all text-emerald-700 underline" href={txUrl(tx.hash)}>{tx.hash}</a>])} />
      </Card>
      <Card title="Role wallets" note="Separate wallets per role. Testnet keys only; production needs multisig and managed custody.">
        <Table head={['Role', 'Address', 'Note']} rows={roles.map((row) => [row.role, <span key={row.role} className="break-all">{row.address}</span>, row.note || ''])} empty="Role wallets are recorded when Alpha governance is prepared." />
      </Card>
      <Card title="Governance log" note="Record upgrades and rotations with the reason and the authorizer.">
        <p className="mb-2 text-xs text-slate-500">{governance.length} entries.</p>
      </Card>
      <RecordManager
        kind="CONTRACT_GOVERNANCE"
        title="governance entry"
        keyField="contractId"
        defaultStatus="PROPOSED"
        statuses={['PROPOSED', 'AUTHORIZED', 'ACTIVATED', 'REJECTED']}
        fields={[
          { name: 'contractId', label: 'Contract ID' },
          { name: 'contractVersion', label: 'Contract version' },
          { name: 'previousContract', label: 'Previous contract' },
          { name: 'deploymentTx', label: 'Deployment transaction' },
          { name: 'upgradeTx', label: 'Upgrade transaction' },
          { name: 'upgradeReason', label: 'Upgrade reason' },
          { name: 'authorizedBy', label: 'Authorized by' },
          { name: 'activatedAt', label: 'Activated at' },
        ]}
        summaryFields={['contractVersion', 'previousContract', 'upgradeReason', 'authorizedBy', 'activatedAt']}
      />
    </AdminPage>
  );
}
