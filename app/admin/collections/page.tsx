import { AdminPage, Card } from '@/components/ops/ui';
import { RecordManager } from '@/components/ops/record-manager';
import { COLLECTION_STAGES, RECOVERY_WORDING } from '@/lib/servicing/collections';
import { FAILURE_KINDS, FAILURE_OUTCOMES } from '@/lib/supplier/performance';

export const dynamic = 'force-dynamic';

export default function CollectionsPage() {
  return (
    <AdminPage title="Collections and recovery" intro="Servicing cases from payment due through recovery distribution. Time periods are facility parameters, not hard-coded legal periods. Every change is audit-logged and a stage can only move along an allowed path.">
      <Card title="Recovery wording">{RECOVERY_WORDING} Vartola never implies unlawful self-help repossession.</Card>
      <RecordManager
        kind="COLLECTION_CASE"
        title="collections case"
        keyField="facilityNo"
        defaultStatus="PAYMENT_DUE"
        statuses={[...COLLECTION_STAGES]}
        fields={[
          { name: 'facilityNo', label: 'Facility' },
          { name: 'borrower', label: 'Borrower / SME' },
          { name: 'amountDue', label: 'Amount due', type: 'number' },
          { name: 'daysPastDue', label: 'Days past due', type: 'number' },
          { name: 'owner', label: 'Case owner' },
          { name: 'latestContact', label: 'Latest contact' },
          { name: 'promiseToPay', label: 'Promise to pay (date / amount)' },
          { name: 'nextAction', label: 'Next action' },
          { name: 'assetRecoveryStatus', label: 'Asset recovery status' },
          { name: 'recoveryPartner', label: 'Recovery partner' },
          { name: 'recoveryExpenses', label: 'Recovery expenses', type: 'number' },
          { name: 'valuation', label: 'Valuation', type: 'number' },
          { name: 'offers', label: 'Sale offers' },
          { name: 'finalProceeds', label: 'Final proceeds', type: 'number' },
          { name: 'notes', label: 'Notes', type: 'textarea' },
        ]}
        summaryFields={['borrower', 'amountDue', 'daysPastDue', 'owner', 'nextAction', 'finalProceeds']}
      />
      <h2 className="text-lg font-semibold">Supplier failure cases</h2>
      <RecordManager
        kind="SUPPLIER_FAILURE"
        title="supplier failure"
        keyField="facilityNo"
        defaultStatus="OPEN"
        statuses={['OPEN', 'RESOLVED', 'CLOSED']}
        fields={[
          { name: 'facilityNo', label: 'Facility' },
          { name: 'supplier', label: 'Supplier' },
          { name: 'kind', label: 'Failure', type: 'select', options: [...FAILURE_KINDS] },
          { name: 'outcome', label: 'Outcome', type: 'select', options: [...FAILURE_OUTCOMES] },
          { name: 'authorizedBy', label: 'Authorized by (needed to amend terms)' },
          { name: 'notes', label: 'Notes', type: 'textarea' },
        ]}
        summaryFields={['supplier', 'kind', 'outcome', 'authorizedBy']}
      />
    </AdminPage>
  );
}
