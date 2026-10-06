import { AdminPage, Card } from '@/components/ops/ui';
import { REPORT_TYPES } from '@/lib/ops/reports';

export const dynamic = 'force-dynamic';

const PER_FACILITY = ['facility', 'investor-position', 'asset-passport'];

export default function ReportsPage() {
  return (
    <AdminPage title="Institutional reports" intro="Each report is generated on request with its timestamp, environment, data source and the Testnet disclaimer. Open one, then print or save it as PDF. Add ?format=json for a machine-readable copy.">
      <Card title="Reports">
        <ul className="space-y-2">
          {REPORT_TYPES.map((type) => (
            <li key={type} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-100 p-3">
              <span className="font-medium">{type.replaceAll('-', ' ')}</span>
              {PER_FACILITY.includes(type) ? (
                <span className="text-xs text-slate-500">Open <code>/api/admin/reports/{type}?facility=FACILITY_NUMBER</code></span>
              ) : (
                <a className="rounded-full bg-emerald-600 px-4 py-1.5 text-sm text-white" href={`/api/admin/reports/${type}`} target="_blank" rel="noreferrer">Open report</a>
              )}
            </li>
          ))}
        </ul>
      </Card>
    </AdminPage>
  );
}
