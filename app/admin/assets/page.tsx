import { AdminPage, Badge, Card, Table, aed, statusTone } from '@/components/ops/ui';
import { RecordManager } from '@/components/ops/record-manager';
import { prisma } from '@/lib/db';
import { assetHealth, verificationPanel, ASSET_LIFECYCLE, type AssetServicing, type Check } from '@/lib/servicing/asset-health';

export const dynamic = 'force-dynamic';

export default async function AssetsPage() {
  const passports = await prisma.assetPassport.findMany({ include: { facility: { select: { facilityNo: true } } }, orderBy: { createdAt: 'desc' }, take: 100 }).catch(() => []);
  const rows = passports.map((passport) => {
    const verified = (status: string) => ['VERIFIED', 'ACTIVE', 'DELIVERED'].includes(status);
    const checks: Check[] = [
      { name: 'VIN verified', verified: Boolean(passport.serialHash), source: passport.chainTxHash ? 'ON-CHAIN ATTESTATION' : 'MANUAL' },
      { name: 'Invoice verified', verified: false, source: null },
      { name: 'Supplier verified', verified: Boolean(passport.supplierName), source: 'MANUAL' },
      { name: 'Delivery verified', verified: verified(passport.deliveryStatus), source: 'MANUAL' },
      { name: 'Registration verified', verified: verified(passport.registrationStatus), source: 'MANUAL' },
      { name: 'Insurance verified', verified: verified(passport.insuranceStatus), source: 'MANUAL' },
    ];
    const servicing: AssetServicing = {
      stage: passport.recoveryStatus !== 'NONE' ? 'RECOVERY' : passport.deliveryStatus === 'DELIVERED' || passport.deliveryStatus === 'VERIFIED' ? 'ACTIVE' : 'PURCHASED',
      registrationExpiry: null,
      insuranceExpiry: null,
      nextMaintenanceDue: null,
      lastMaintenanceAt: null,
      maintenanceCount: 0,
      downtimeDays: 0,
      usage: null,
      condition: 'UNKNOWN',
      purchaseValue: passport.purchaseValue ?? null,
      latestValuation: passport.valuation ?? null,
      valuationSource: passport.valuation ? 'ADMIN INPUT' : null,
      ageYears: passport.year ? new Date().getFullYear() - passport.year : null,
      usefulLifeYears: 8,
      accident: false,
      recoveryStatus: passport.recoveryStatus === 'NONE' ? 'NONE' : 'INITIATED',
      documentsComplete: checks.filter((check) => check.verified).length / checks.length,
    };
    return { passport, health: assetHealth(servicing), panel: verificationPanel(checks), servicing };
  });
  return (
    <AdminPage title="Asset servicing" intro="Productive assets stay serviced after funding: registration, insurance, maintenance, valuation, recovery and disposal. The health score is an internal indicator, not a regulated valuation. Unknown expiry dates reduce the score instead of being assumed.">
      <Card title="Lifecycle stages">
        <div className="flex flex-wrap gap-2 text-xs">{ASSET_LIFECYCLE.map((stage) => <span key={stage} className="rounded-full bg-slate-100 px-3 py-1">{stage}</span>)}</div>
      </Card>
      <Card title="Asset passports and health">
        <Table
          head={['Asset', 'Facility', 'Type', 'Purchase value', 'Valuation', 'Verification', 'Health', 'Recovery']}
          rows={rows.map(({ passport, health, panel }) => [
            passport.assetId,
            passport.facility.facilityNo,
            `${passport.manufacturer} ${passport.model}`.trim() || passport.assetType || '—',
            passport.purchaseValue ? aed(passport.purchaseValue) : '—',
            passport.valuation ? aed(passport.valuation) : '—',
            panel.label,
            <Badge key={passport.id} tone={statusTone(health.label)}>{health.label} {health.score}</Badge>,
            passport.recoveryStatus,
          ])}
          empty="No asset passports yet."
        />
      </Card>
      <h2 className="text-lg font-semibold">Servicing events</h2>
      <RecordManager
        kind="ASSET_SERVICING"
        title="servicing event"
        keyField="assetId"
        defaultStatus="LOGGED"
        statuses={['LOGGED', 'SCHEDULED', 'COMPLETED']}
        fields={[
          { name: 'assetId', label: 'Asset ID' },
          { name: 'event', label: 'Event', type: 'select', options: ['MAINTENANCE', 'REVALUATION', 'RENEWAL', 'REGISTRATION_EXPIRY', 'INSURANCE_EXPIRY', 'DOWNTIME', 'USAGE_READING', 'CONDITION_CHECK'] },
          { name: 'date', label: 'Date' },
          { name: 'valuation', label: 'Valuation', type: 'number' },
          { name: 'valuationSource', label: 'Valuation source' },
          { name: 'usage', label: 'Odometer / usage', type: 'number' },
          { name: 'notes', label: 'Notes', type: 'textarea' },
        ]}
        summaryFields={['event', 'date', 'valuation', 'valuationSource', 'usage', 'notes']}
      />
      <h2 className="text-lg font-semibold">Insurance events</h2>
      <RecordManager
        kind="INSURANCE_CLAIM"
        title="insurance claim"
        keyField="claimReference"
        defaultStatus="REPORTED"
        statuses={['REPORTED', 'CLAIM_FILED', 'ASSESSED', 'PROCEEDS_RECEIVED', 'CLOSED']}
        fields={[
          { name: 'claimReference', label: 'Claim reference' },
          { name: 'facilityNo', label: 'Facility' },
          { name: 'type', label: 'Event', type: 'select', options: ['ACCIDENT', 'THEFT', 'TOTAL_LOSS', 'PARTIAL_DAMAGE', 'OTHER'] },
          { name: 'insurer', label: 'Insurer' },
          { name: 'claimAmount', label: 'Claim amount', type: 'number' },
          { name: 'deductible', label: 'Deductible', type: 'number' },
          { name: 'receivedProceeds', label: 'Received proceeds', type: 'number' },
          { name: 'facilityImpact', label: 'Facility impact', type: 'textarea' },
        ]}
        summaryFields={['facilityNo', 'type', 'insurer', 'claimAmount', 'deductible', 'receivedProceeds']}
      />
      <p className="text-xs text-slate-500">Allocation of insurance proceeds is not automated: it follows the facility terms once they permit it.</p>
    </AdminPage>
  );
}
