import { AdminPage, Card, Table } from '@/components/ops/ui';
import { LINEAGE } from '@/lib/ops/lineage';

export const dynamic = 'force-dynamic';

export default function LineagePage() {
  return (
    <AdminPage title="Data lineage" intro="Where each important financial field comes from, how it is produced and which version rules it. Source types: CONTRACT, INDEXED EVENT, CALCULATED, ADMIN INPUT, PROVIDER, DOCUMENT.">
      <Card title="Field lineage">
        <Table head={['Field', 'Source', 'Produced by', 'Version / reference']} rows={LINEAGE.map((row) => [row.field, row.source, row.producedBy, row.reference])} />
      </Card>
    </AdminPage>
  );
}
