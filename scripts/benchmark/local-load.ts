// LOCAL LOAD SIMULATION. This runs the platform's own processing logic in memory on synthetic data. It is NOT a
// Testnet benchmark: it makes no network calls, uses no database and says nothing about RPC latency, ledger close
// time or hosted API latency. Numbers vary by machine; the report records the machine and the run date.
import os from 'node:os';
import { performance } from 'node:perf_hooks';
import { computeExpectedLoss } from '../../lib/risk-engine/expected-loss';
import { concentrationBy, runScenario, SCENARIOS, type Exposure } from '../../lib/risk-engine/portfolio';
import { distributeByUnits, splitRepayment } from '../../lib/finance/waterfall-v2';
import { dedupeEvents, orderEvents, type IndexedEvent } from '../../lib/alpha/resilience';
import { compareFacility, summarize } from '../../lib/alpha/reconcile';

function time<T>(name: string, count: number, work: () => T) {
  const start = performance.now();
  const result = work();
  const ms = performance.now() - start;
  return { name, count, ms: Math.round(ms * 10) / 10, perSecond: Math.round(count / (ms / 1000)), result };
}

const rows: ReturnType<typeof time>[] = [];
const reserve = { reserveRateBps: 50, reserveTarget: 5_000, permittedUses: [] as never[] };

rows.push(time('Waterfall: repayments split', 50_000, () => {
  let principal = 0;
  for (let i = 0; i < 50_000; i += 1) principal += splitRepayment({ gross: 7_000, feeBps: 100, reserve, reserveBalance: 0, financeAmount: 150_000, termMonths: 24, paymentIndex: (i % 24) + 1, remainingPrincipal: 150_000 }).principal;
  return principal;
}));

const holders = Array.from({ length: 10_000 }, (_, i) => ({ id: `h${i}`, units: 1 + (i % 40) }));
rows.push(time('Distribution: 10,000 positions by units', 10_000, () => distributeByUnits(10_000_000, holders).distributed));

rows.push(time('Expected loss: 1,000 facilities', 1_000, () => {
  let total = 0;
  for (let i = 0; i < 1_000; i += 1) total += computeExpectedLoss({ grade: (['A', 'B', 'C', 'D'] as const)[i % 4], outstandingPrincipal: 50_000 + i, assetValue: 90_000, financeAmount: 100_000, liquidity: 'medium' }).expectedLoss;
  return total;
}));

const exposures: Exposure[] = Array.from({ length: 1_000 }, (_, i) => ({ facilityId: `f${i}`, facilityNo: `F${i}`, sme: `SME ${i % 120}`, supplier: `S${i % 15}`, assetClass: ['Truck', 'Van', 'Equipment'][i % 3], sector: 'Logistics', geography: ['Dubai', 'Abu Dhabi', 'Sharjah'][i % 3], grade: (['A', 'B', 'C', 'D'] as const)[i % 4], outstanding: 50_000 + i, assetValue: 90_000, status: 'ACTIVE', pd: 0.03, lgd: 0.3 }));
rows.push(time('Portfolio: concentration + 6 stress scenarios over 1,000 facilities', 1_000, () => {
  for (const field of ['sme', 'supplier', 'assetClass', 'sector', 'geography', 'grade'] as const) concentrationBy(exposures, field);
  return SCENARIOS.map((scenario) => runScenario(exposures, scenario).expectedLoss);
}));

const events: IndexedEvent[] = Array.from({ length: 100_000 }, (_, i) => ({ txHash: `tx${i % 80_000}`, eventType: 'RepaymentRecorded', entityId: `f${i % 1_000}`, ledger: 1_000_000 + ((i * 7919) % 100_000), id: String(i) }));
rows.push(time('Indexing: dedupe + order 100,000 events (20,000 duplicates)', 100_000, () => orderEvents(dedupeEvents(events)).length));

const unit = BigInt(10_000_000);
rows.push(time('Reconciliation: compare 1,000 facilities with 10 positions each', 1_000, () => {
  const findings = [];
  for (let i = 0; i < 1_000; i += 1) {
    const positions: Record<string, bigint> = {};
    const allocations = [];
    for (let p = 0; p < 10; p += 1) { positions[`W${i}-${p}`] = BigInt(10); allocations.push({ investorWallet: `W${i}-${p}`, units: 10 }); }
    findings.push(...compareFacility({ status: 6, fundedStroops: BigInt(1000) * unit, issuedUnits: BigInt(100), principalOutstandingStroops: BigInt(900) * unit, positions }, { id: `f${i}`, facilityNo: `F${i}`, status: 'ACTIVE', financeAmount: 1000, fundedAmount: 1000, participationUnits: 100, principalReturned: 100, allocations }));
  }
  return summarize(findings);
}));

console.log(JSON.stringify({
  kind: 'LOCAL LOAD SIMULATION (not a Testnet benchmark)',
  date: new Date().toISOString().slice(0, 10),
  machine: { cpu: os.cpus()[0]?.model, cores: os.cpus().length, node: process.version },
  results: rows.map((row) => ({ name: row.name, count: row.count, ms: row.ms, perSecond: row.perSecond, result: typeof row.result === 'number' || typeof row.result === 'string' ? row.result : undefined })),
}, null, 2));
