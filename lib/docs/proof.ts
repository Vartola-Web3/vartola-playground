import { TESTNET, txUrl } from './testnet';

// Groups the recorded Testnet events of a reference facility into the lifecycle stages shown on /proof. Only events
// that exist in the recorded deployment are listed. Timestamps are not stored in the record, so each row links to
// the explorer, which shows the exact ledger close time.

export const STAGES = [
  { key: 'CREATED', label: 'Facility created', effect: 'Facility and its terms registered on the facility contract; risk assessment hash attested.', events: ['FacilityCreated', 'RiskAttested'] },
  { key: 'PARTICIPATION', label: 'Investor participation', effect: 'Investors reserve or subscribe; Participation Units are issued by the contract.', events: ['InvestmentSubscribed', 'InvestmentReserved', 'EscrowOpened'] },
  { key: 'FUNDED', label: 'Fully funded', effect: 'Funding reaches the facility amount; escrow is fully funded.', events: ['EscrowPartiallyFunded', 'FacilityFunded', 'EscrowFullyFunded'] },
  { key: 'LOCKED', label: 'Escrow locked', effect: 'Release is locked until every condition is attested.', events: ['EscrowReleaseLocked'] },
  { key: 'CONDITIONS', label: 'Release conditions', effect: 'Each condition is attested on-chain by its responsible role, with only the evidence hash.', events: ['ReleaseConditionAttested'] },
  { key: 'AUTHORIZED', label: 'Release authorized', effect: 'The administrator authorizes release to the approved supplier. The SME never receives capital.', events: ['ReleaseAuthorized', 'EscrowReleaseAuthorized'] },
  { key: 'SUPPLIER_PAID', label: 'Supplier paid', effect: 'The treasury role pays the approved supplier, within the daily release limit.', events: ['ReleaseExecuted', 'EscrowReleased'] },
  { key: 'DELIVERED', label: 'Asset delivered', effect: 'Asset passport anchored and asset status moves through delivered, registered and insured.', events: ['AssetPassportAnchored', 'AssetStatusChanged'] },
  { key: 'ACTIVE', label: 'Facility active', effect: 'Facility is activated and repayments begin.', events: ['FacilityActivated'] },
  { key: 'REPAYMENT', label: 'Repayment', effect: 'Repayment is split by the waterfall into principal and income.', events: ['RepaymentRecorded'] },
  { key: 'DISTRIBUTION', label: 'Distribution', effect: 'Principal and income are distributed to holders by Participation Units.', events: ['DistributionCalculated', 'DistributionExecuted'] },
  { key: 'SETTLEMENT_RECOVERY', label: 'Settlement or recovery', effect: 'Early settlement, or grace, late, default, asset sale and recovery, then closure.', events: ['SettlementQuoted', 'SettlementExecuted', 'FacilityClosed', 'EscrowClosed', 'FacilityGrace', 'FacilityLate', 'DefaultNoticeIssued', 'FacilityDefaulted', 'RepossessionStarted', 'AssetSaleStarted', 'RecoveryRecorded'] },
] as const;

export function stageOf(eventType: string) {
  if (eventType.startsWith('FacilityStatus:')) return 'SETTLEMENT_RECOVERY';
  return STAGES.find((stage) => (stage.events as readonly string[]).includes(eventType))?.key ?? null;
}

export function facilityLifecycle(facilityNo: string) {
  const facility = TESTNET.facilities.find((row) => row.facilityNo === facilityNo);
  if (!facility) return null;
  const stages = STAGES.map((stage) => {
    const events = facility.events.filter((event) => stageOf(event.eventType) === stage.key);
    return { ...stage, reached: events.length > 0, events: events.map((event) => ({ ...event, explorerUrl: txUrl(event.txHash) })) };
  });
  return { facility, contractId: TESTNET.deployment.facilityContractId, stages, eventCount: facility.events.length, unclassified: facility.events.filter((event) => stageOf(event.eventType) === null).map((event) => event.eventType) };
}
