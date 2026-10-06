import { AdminPage, Card, Stat, aed } from '@/components/ops/ui';
import { RecordManager } from '@/components/ops/record-manager';
import { listRecords } from '@/lib/ops/records';
import { ENTITY_TYPES, STAGES, pilotKpis, pipelineCounts, type PilotEntry } from '@/lib/ops/pilots';

export const dynamic = 'force-dynamic';

export default async function PilotsPage() {
  const rows = await listRecords<Partial<PilotEntry>>('PILOT').catch(() => []);
  const entries: PilotEntry[] = rows.map((row) => ({
    id: row.id,
    name: String(row.data.name || row.key),
    type: (row.data.type || 'SME') as PilotEntry['type'],
    stage: row.status as PilotEntry['stage'],
    prospectiveVolume: Number(row.data.prospectiveVolume || 0),
    assetsRequested: Number(row.data.assetsRequested || 0),
    onboarded: String(row.data.onboarded) === 'yes',
    pilotFacility: String(row.data.pilotFacility) === 'yes',
    notes: String(row.data.notes || ''),
  }));
  const kpi = pilotKpis(entries);
  return (
    <AdminPage title="Pilot pipeline" intro="Only what an administrator enters appears here. Nothing is pre-populated, and an empty pipeline shows zero. A signed LOI is recorded only when it exists.">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="SMEs contacted" value={kpi.smesContacted} />
        <Stat label="SMEs interested" value={kpi.smesInterested} />
        <Stat label="LOIs signed" value={kpi.lois} />
        <Stat label="Prospective facility volume" value={aed(kpi.prospectiveVolume)} />
        <Stat label="Assets requested" value={kpi.assetsRequested} />
        <Stat label="Suppliers onboarded" value={kpi.suppliersOnboarded} />
        <Stat label="Pilot facilities" value={kpi.pilotFacilities} />
        <Stat label="Partner discussions" value={kpi.partnerDiscussions} />
      </div>
      <Card title="Pipeline by stage">
        <div className="flex flex-wrap gap-2 text-xs">{pipelineCounts(entries).map((row) => <span key={row.stage} className="rounded-full bg-slate-100 px-3 py-1">{row.stage.replaceAll('_', ' ')}: {row.count}</span>)}</div>
      </Card>
      <RecordManager
        kind="PILOT"
        title="pilot entry"
        keyField="name"
        defaultStatus="IDENTIFIED"
        statuses={[...STAGES]}
        fields={[
          { name: 'name', label: 'Name' },
          { name: 'type', label: 'Type', type: 'select', options: [...ENTITY_TYPES] },
          { name: 'prospectiveVolume', label: 'Prospective facility volume', type: 'number' },
          { name: 'assetsRequested', label: 'Assets requested', type: 'number' },
          { name: 'onboarded', label: 'Onboarded (yes/no)' },
          { name: 'pilotFacility', label: 'Pilot facility (yes/no)' },
          { name: 'notes', label: 'Notes', type: 'textarea' },
        ]}
        summaryFields={['type', 'prospectiveVolume', 'assetsRequested', 'notes']}
      />
    </AdminPage>
  );
}
