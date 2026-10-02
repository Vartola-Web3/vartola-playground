export const RELEASE_CONDITIONS = [
  ['FULLY_FUNDED', 'Fully funded'],
  ['SME_CONTRIBUTION', 'SME contribution received'],
  ['LEASE_SIGNED', 'Lease agreement signed'],
  ['INVOICE', 'Supplier invoice verified'],
  ['VEHICLE', 'Vehicle verified'],
  ['INSURANCE', 'Insurance confirmed'],
  ['COMPLIANCE', 'Compliance approved'],
  ['UNDERWRITING', 'Final underwriting approval'],
] as const;

export const ACTIVATION_CHECKS = [
  ['DELIVERED', 'Asset delivered'],
  ['INSPECTED', 'Asset inspected'],
  ['VIN', 'Identifier verified'],
  ['REGISTERED', 'Registration confirmed'],
  ['INSURANCE_ACTIVE', 'Insurance active'],
  ['ACCEPTED', 'Customer acceptance'],
] as const;

export function isReady(funded: number, required: number, conditions: { isRequired: boolean; status: string }[]) {
  if (required <= 0 || funded + 0.001 < required) return false;
  return conditions.filter((item) => item.isRequired).every((item) => item.status === 'VERIFIED' || item.status === 'WAIVED');
}

export function splitPayment(gross: number, feeRate: number, reserveRate: number) {
  const serviceFee = Math.round(gross * feeRate * 100) / 100;
  const reserve = Math.round(gross * reserveRate * 100) / 100;
  const net = Math.max(gross - serviceFee - reserve, 0);
  const principal = Math.round(net * 0.7 * 100) / 100;
  const leaseIncome = Math.round((net - principal) * 100) / 100;
  return { serviceFee, reserve, principal, leaseIncome, net };
}

export function allocateShares(
  rows: { id: string; deployedAmount: number }[],
  principal: number,
  leaseIncome: number
) {
  const base = rows.reduce((sum, row) => sum + row.deployedAmount, 0);
  if (base <= 0) return [];
  return rows.map((row) => {
    const share = row.deployedAmount / base;
    return {
      id: row.id,
      principal: Math.round(principal * share * 100) / 100,
      leaseIncome: Math.round(leaseIncome * share * 100) / 100,
    };
  });
}
