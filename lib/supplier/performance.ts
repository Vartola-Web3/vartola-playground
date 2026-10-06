// Internal supplier performance score. Computed only from recorded deliveries and disputes. With too little data it
// reports NOT ENOUGH DATA instead of inventing a score.

export type SupplierRecord = {
  deliveries: number;
  onTimeDeliveries: number;
  priceVariancePct: number[]; // quoted vs final, absolute percent per delivery
  documentIssues: number;
  disputes: number;
  conditionIssues: number;
  warrantyClaims: number;
};

export const MIN_SAMPLE = 3;

export function supplierScore(record: SupplierRecord) {
  if (record.deliveries < MIN_SAMPLE) {
    return { status: 'NOT ENOUGH DATA' as const, score: null, confidence: 'NONE' as const, sampleSize: record.deliveries, minimumSample: MIN_SAMPLE };
  }
  const n = record.deliveries;
  const timeliness = (record.onTimeDeliveries / n) * 100;
  const avgVariance = record.priceVariancePct.length ? record.priceVariancePct.reduce((a, b) => a + b, 0) / record.priceVariancePct.length : 0;
  const price = Math.max(0, 100 - avgVariance * 5);
  const documents = Math.max(0, 100 - (record.documentIssues / n) * 100);
  const disputes = Math.max(0, 100 - (record.disputes / n) * 200);
  const condition = Math.max(0, 100 - (record.conditionIssues / n) * 150);
  const warranty = Math.max(0, 100 - (record.warrantyClaims / n) * 100);
  const score = Math.round(timeliness * 0.25 + price * 0.15 + documents * 0.2 + disputes * 0.2 + condition * 0.1 + warranty * 0.1);
  const confidence = n >= 20 ? 'HIGH' : n >= 8 ? 'MEDIUM' : 'LOW';
  return { status: 'SCORED' as const, score, confidence: confidence as 'HIGH' | 'MEDIUM' | 'LOW', sampleSize: n, minimumSample: MIN_SAMPLE };
}

// Actions a supplier user is never allowed to take. Enforced in the supplier service and checked by a test.
export const SUPPLIER_FORBIDDEN = ['APPROVE_RELEASE', 'CHANGE_FACILITY_TERMS', 'BYPASS_UNDERWRITING', 'BYPASS_COMPLIANCE'] as const;
export const SUPPLIER_ALLOWED = ['SUBMIT_QUOTATION', 'UPLOAD_INVOICE', 'ALLOCATE_VIN', 'CONFIRM_AVAILABILITY', 'SUBMIT_DELIVERY_EVIDENCE', 'SUBMIT_WARRANTY', 'SUBMIT_SERVICE_AGREEMENT', 'VIEW_RELEASE_STATUS'] as const;
export const supplierMayDo = (action: string) => (SUPPLIER_ALLOWED as readonly string[]).includes(action);

// Supplier failure outcomes. No silent financial term change: an amendment needs explicit authorization.
export const FAILURE_KINDS = ['DELAY', 'CANCELLATION', 'WRONG_ASSET', 'PRICE_CHANGE', 'FAILED_DELIVERY'] as const;
export const FAILURE_OUTCOMES = ['REPLACE_SUPPLIER', 'REFUND_ESCROW', 'AMEND_FACILITY', 'CANCEL_FACILITY'] as const;
export function resolveFailure(outcome: (typeof FAILURE_OUTCOMES)[number], authorizedBy: string | null) {
  if (outcome === 'AMEND_FACILITY' && !authorizedBy) throw new Error('Amending facility terms requires explicit authorization');
  return { outcome, authorizedBy, financialTermsChanged: outcome === 'AMEND_FACILITY' };
}
