import { prisma } from '@/lib/db';
import { isAlphaMode } from '@/lib/config/app-mode';
import { portfolioRisk, treasurySummary } from '@/lib/ops/portfolio-data';
import { getIndexerState, getLastReconciliation, indexerHealth } from '@/lib/alpha/ops-state';
import { TESTNET, txUrl } from '@/lib/docs/testnet';

// Institutional reports as printable HTML (use the browser's Save as PDF) or JSON. Every report states when it was
// generated, the environment, the data source and the Testnet disclaimer, and lists chain references where relevant.

export const REPORT_TYPES = ['facility', 'investor-position', 'portfolio-risk', 'treasury-reconciliation', 'asset-passport', 'recovery', 'system-health'] as const;
export type ReportType = (typeof REPORT_TYPES)[number];

export type Section = { heading: string; rows: [string, string][] };
export type Report = { title: string; type: ReportType; generatedAt: string; environment: string; source: string; disclaimer: string; sections: Section[] };

const DISCLAIMER = 'Stellar Testnet only. VTAED has no monetary value and is not redeemable. Values are simulated. Internal Vartola estimates are not regulated ratings, audits or legal title.';
const money = (value: number | null | undefined) => (value === null || value === undefined ? 'n/a' : value.toLocaleString('en-US', { maximumFractionDigits: 2 }) + ' VTAED');

function base(type: ReportType, title: string, source: string, sections: Section[]): Report {
  return { title, type, generatedAt: new Date().toISOString(), environment: isAlphaMode() ? 'ALPHA (Stellar Testnet)' : 'DEMO (simulated)', source, disclaimer: DISCLAIMER, sections };
}

export async function buildReport(type: ReportType, subject?: string): Promise<Report | null> {
  if (type === 'portfolio-risk') {
    const risk = await portfolioRisk();
    return base(type, 'Portfolio Risk Report', 'Prisma read model; internal expected-loss model vartola-el-v1', [
      { heading: 'Summary', rows: [['Outstanding principal', money(risk.exposure)], ['Expected loss', money(risk.expectedLoss)], ['Loss rate', (risk.lossRate * 100).toFixed(2) + '%'], ['Weighted grade', risk.weightedGrade ?? 'n/a'], ['Late exposure', money(risk.lateExposure)], ['Default exposure', money(risk.defaultExposure)]] },
      { heading: 'Facilities', rows: risk.rows.map((row): [string, string] => [row.facilityNo, `${row.sme} · grade ${row.grade} · outstanding ${money(row.outstanding)} · EL ${money(row.el.expectedLoss)}`]) },
    ]);
  }
  if (type === 'treasury-reconciliation') {
    const [t, last] = await Promise.all([treasurySummary(), getLastReconciliation().catch(() => null)]);
    return base(type, 'Treasury and Reconciliation Report', 'Prisma read model, last stored reconciliation', [
      { heading: 'Treasury', rows: Object.entries(t).map(([key, value]): [string, string] => [key, typeof value === 'number' && !key.toLowerCase().includes('facilities') ? money(value) : String(value)]) },
      { heading: 'Reconciliation', rows: last ? [['Status', last.status], ['Checked at', last.checkedAt], ['Facilities', String(last.facilities)], ['Findings', String(last.findings)], ['Trigger', last.trigger]] : [['Status', 'No reconciliation recorded']] },
    ]);
  }
  if (type === 'system-health') {
    const [indexer, last] = await Promise.all([getIndexerState().catch(() => null), getLastReconciliation().catch(() => null)]);
    return base(type, 'System Health Report', 'Operations state', [
      { heading: 'Indexer', rows: indexer ? [['Health', indexerHealth(indexer)], ['Last indexed ledger', String(indexer.lastIndexedLedger)], ['Total indexed events', String(indexer.totalIndexed)], ['Consecutive failures', String(indexer.consecutiveFailures)], ['Pending retries', String(indexer.pendingRetries)]] : [['Health', 'NOT STARTED']] },
      { heading: 'Reconciliation', rows: [['Last status', last?.status || 'NOT RUN'], ['Checked at', last?.checkedAt || 'never']] },
    ]);
  }
  if (type === 'asset-passport') {
    const passports = await prisma.assetPassport.findMany({ where: subject ? { facility: { OR: [{ id: subject }, { facilityNo: subject }] } } : {}, include: { facility: { select: { facilityNo: true } } }, take: 100 });
    return base(type, 'Asset Passport Report', 'Prisma read model; serial numbers are stored only as hashes', [
      { heading: 'Assets', rows: passports.map((row): [string, string] => [row.assetId, `${row.facility.facilityNo} · ${row.manufacturer} ${row.model} · delivery ${row.deliveryStatus} · insurance ${row.insuranceStatus} · registration ${row.registrationStatus} · recovery ${row.recoveryStatus} · serial hash ${row.serialHash.slice(0, 12)}…${row.chainTxHash ? ' · tx ' + row.chainTxHash : ''}`]) },
    ]);
  }
  if (type === 'recovery') {
    const recoveries = await prisma.facilityRecovery.findMany({ include: { facility: { select: { facilityNo: true } } }, orderBy: { createdAt: 'desc' }, take: 100 });
    return base(type, 'Recovery Report', 'Prisma read model with chain references', [
      { heading: 'Recoveries', rows: recoveries.map((row): [string, string] => [row.facility.facilityNo, `net proceeds ${money(row.netProceeds)} · ${row.chainStatus || 'n/a'}${row.txHash ? ' · ' + txUrl(row.txHash) : ''}`]) },
    ]);
  }
  const facility = subject ? await prisma.facility.findFirst({ where: { OR: [{ id: subject }, { facilityNo: subject }] }, include: { application: { include: { company: true } }, payments: true, allocations: true } }) : null;
  if (type === 'facility') {
    if (!facility) return null;
    const events = await prisma.chainEvent.findMany({ where: { entityId: facility.id }, orderBy: { createdAt: 'asc' }, take: 100 });
    return base(type, `Facility Report ${facility.facilityNo}`, 'Prisma read model and indexed chain events', [
      { heading: 'Facility', rows: [['Status', facility.status], ['Finance amount', money(facility.financeAmount)], ['Funded', money(facility.fundedAmount)], ['Term (months)', String(facility.term)], ['Chain status', facility.chainStatus || 'n/a'], ['Units', String(facility.participationUnits)]] },
      { heading: 'Chain references', rows: events.map((event): [string, string] => [event.eventType, `ledger ${event.ledger} · ${txUrl(event.txHash)}`]) },
      { heading: 'Recorded Testnet contracts', rows: [['Facility contract', TESTNET.deployment.facilityContractId], ['Registry', TESTNET.deployment.registryContractId]] },
    ]);
  }
  if (type === 'investor-position') {
    if (!facility) return null;
    return base(type, `Investor Position Report ${facility.facilityNo}`, 'Prisma allocations (no personal data)', [
      { heading: 'Positions', rows: facility.allocations.map((row, index): [string, string] => [`Position ${index + 1}`, `units ${row.participationUnits} · committed ${money(row.allocatedAmount)} · deployed ${money(row.deployedAmount)} · principal returned ${money(row.principalReturned)} · income ${money(row.leaseIncomeReceived)} · recovery ${money(row.recoveryReceived)} · ${row.status}`]) },
    ]);
  }
  return null;
}

const escape = (value: string) => value.replace(/[&<>"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[char] as string);

export function renderHtml(report: Report) {
  const sections = report.sections.map((section) => `<h2>${escape(section.heading)}</h2><table>${section.rows.map(([key, value]) => `<tr><th>${escape(key)}</th><td>${escape(value)}</td></tr>`).join('') || '<tr><td>No data</td></tr>'}</table>`).join('');
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>${escape(report.title)}</title><style>body{font-family:system-ui,sans-serif;max-width:860px;margin:2rem auto;padding:0 1rem;color:#111}h1{font-size:1.5rem}h2{font-size:1.1rem;margin-top:1.5rem}table{border-collapse:collapse;width:100%;font-size:.85rem}th,td{border-bottom:1px solid #ddd;padding:.35rem .5rem;text-align:left;vertical-align:top;word-break:break-word}th{width:32%;font-weight:600}.meta{color:#555;font-size:.8rem}.warn{margin-top:1.5rem;padding:.75rem;background:#f4f4f4;font-size:.8rem}@media print{.noprint{display:none}}</style></head><body><p class="noprint"><button onclick="window.print()">Print or save as PDF</button></p><h1>${escape(report.title)}</h1><p class="meta">Generated ${escape(report.generatedAt)} · Environment ${escape(report.environment)} · Source ${escape(report.source)}</p>${sections}<p class="warn">${escape(report.disclaimer)}</p></body></html>`;
}
