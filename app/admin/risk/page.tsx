import { AdminPage, Badge, Card, Stat, Table, TESTNET_BANNER, aed, pct } from '@/components/ops/ui';
import { portfolioRisk } from '@/lib/ops/portfolio-data';
import { DEFAULT_LIMITS, SCENARIOS, concentrationBy, runScenario, topExposures, upcomingBreaches } from '@/lib/risk-engine/portfolio';
import { DEFAULT_ASSUMPTIONS, EXPECTED_LOSS_MODEL_VERSION, EXPECTED_LOSS_NOTICE } from '@/lib/risk-engine/expected-loss';

export const dynamic = 'force-dynamic';

const DIMENSIONS = [['sme', 'SME'], ['supplier', 'Supplier'], ['assetClass', 'Asset class'], ['sector', 'Sector'], ['geography', 'Geography'], ['grade', 'Risk grade']] as const;

export default async function RiskPage() {
  const risk = await portfolioRisk();
  const rows = risk.rows;
  return (
    <AdminPage title="Portfolio risk" intro={`${TESTNET_BANNER} Mode: ${risk.mode}.`}>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Outstanding principal" value={aed(risk.exposure)} />
        <Stat label="Expected loss" value={aed(risk.expectedLoss)} hint={`${pct(risk.lossRate)} of exposure · ${EXPECTED_LOSS_MODEL_VERSION}`} />
        <Stat label="Weighted risk grade" value={risk.weightedGrade ?? 'No exposure'} />
        <Stat label="Facilities in exposure" value={String(rows.length)} />
        <Stat label="Late exposure" value={aed(risk.lateExposure)} />
        <Stat label="Default exposure" value={aed(risk.defaultExposure)} />
        <Stat label="Recovery exposure" value={aed(risk.recoveryExposure)} />
        <Stat label="High-risk facilities" value={String(risk.highRisk.length)} hint={risk.highRisk.join(', ') || 'None'} />
      </div>
      <p className="text-xs text-slate-500">{EXPECTED_LOSS_NOTICE} EL = PD × LGD × EAD.</p>

      <div className="grid gap-4 lg:grid-cols-2">
        {DIMENSIONS.map(([field, label]) => (
          <Card key={field} title={`Concentration by ${label.toLowerCase()}`} note={`Limit ${Math.round(DEFAULT_LIMITS[field] * 100)}% of outstanding principal`}>
            <Table
              head={[label, 'Exposure', 'Share', '']}
              rows={concentrationBy(rows, field).map((row) => [
                row.key,
                aed(row.exposure),
                <div key={row.key} className="flex items-center gap-2"><div className="h-2 w-24 rounded bg-slate-100"><div className={`h-2 rounded ${row.breach ? 'bg-red-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min(100, row.share * 100)}%` }} /></div>{pct(row.share)}</div>,
                row.breach ? <Badge key="b" tone="bad">BREACH</Badge> : null,
              ])}
            />
          </Card>
        ))}
      </div>

      <Card title="Top exposures">
        <Table
          head={['Facility', 'SME', 'Grade', 'Outstanding', 'PD', 'LGD', 'Expected loss']}
          rows={topExposures(rows).map((row) => {
            const full = rows.find((item) => item.facilityId === row.facilityId)!;
            return [row.facilityNo, row.sme, row.grade, aed(row.outstanding), pct(full.el.pd), pct(full.el.lgd), aed(full.el.expectedLoss)];
          })}
        />
      </Card>

      <Card title="Upcoming concentration breaches" note="Groups above 80% of their limit.">
        <Table head={['Dimension', 'Group', 'Share', 'Limit']} rows={upcomingBreaches(rows).map((row) => [row.dimension, row.key, pct(row.share), pct(row.limit)])} empty="None, or too few facilities for a meaningful concentration." />
      </Card>

      <Card title="Stress scenarios" note="SCENARIO ANALYSIS, NOT A FORECAST. Same expected-loss assumptions with shocks applied.">
        <Table
          head={['Scenario', 'Exposure', 'Expected loss', 'Loss rate', 'Expected recovery', 'Delayed exposure']}
          rows={SCENARIOS.map((scenario) => {
            const result = runScenario(rows, scenario);
            return [result.name, aed(result.exposure), aed(result.expectedLoss), pct(result.lossRate), aed(result.expectedRecovery), aed(result.delayedExposure)];
          })}
        />
      </Card>

      <Card title="Model assumptions (configurable, versioned)">
        <p>
          PD by grade: {Object.entries(DEFAULT_ASSUMPTIONS.pdByGrade).map(([grade, value]) => `${grade} ${pct(value)}`).join(' · ')}. Recovery rate by liquidity: {Object.entries(DEFAULT_ASSUMPTIONS.recoveryRateByLiquidity).map(([key, value]) => `${key} ${pct(value)}`).join(' · ')}. Recovery cost {pct(DEFAULT_ASSUMPTIONS.recoveryCostRate)}. These are internal assumptions, not bureau data.
        </p>
      </Card>
    </AdminPage>
  );
}
