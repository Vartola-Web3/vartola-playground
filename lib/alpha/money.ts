const ZERO = BigInt(0);
const BPS_BASE = BigInt(10000);

export const STROOPS = BigInt(10000000);
export const UNIT_VTAED = 100;
export const UNIT_STROOPS = BigInt(UNIT_VTAED) * STROOPS;

export function vtaedToStroops(amount: number): bigint {
  const negative = amount < 0;
  const [whole, frac = ''] = Math.abs(amount).toFixed(7).split('.');
  const value = BigInt(whole) * STROOPS + BigInt((frac + '0000000').slice(0, 7));
  return negative ? -value : value;
}

export function stroopsToVtaed(value: bigint): number {
  const negative = value < ZERO;
  const abs = negative ? -value : value;
  const whole = abs / STROOPS;
  const frac = (abs % STROOPS).toString().padStart(7, '0').replace(/0+$/, '');
  const text = frac ? `${whole.toString()}.${frac}` : whole.toString();
  return Number(negative ? `-${text}` : text);
}

export function assertUnitMultiple(amount: number) {
  const stroops = vtaedToStroops(amount);
  if (stroops <= ZERO || stroops % UNIT_STROOPS !== ZERO) {
    throw new Error(`Alpha investments must be a multiple of ${UNIT_VTAED} VTAED`);
  }
  return stroops;
}

export function participationUnits(amount: number) {
  return Number(vtaedToStroops(amount) / UNIT_STROOPS);
}

export function platformFee(gross: bigint, bps: number) {
  return (gross * BigInt(bps)) / BPS_BASE;
}

export function reserveAmount(gross: bigint, bps: number) {
  return (gross * BigInt(bps)) / BPS_BASE;
}

export function netAmount(gross: bigint, feeBps: number, reserveBps: number) {
  return gross - platformFee(gross, feeBps) - reserveAmount(gross, reserveBps);
}

export function principalComponent(finance: bigint, termMonths: number, paymentIndex: number, remaining: bigint, net: bigint) {
  if (termMonths <= 0 || remaining <= ZERO || net <= ZERO) return ZERO;
  const equal = finance / BigInt(termMonths);
  const due = paymentIndex >= termMonths ? remaining : (equal < remaining ? equal : remaining);
  return due < net ? (due < remaining ? due : remaining) : (net < remaining ? net : remaining);
}

export function incomeComponent(net: bigint, principal: bigint) {
  const value = net - principal;
  return value > ZERO ? value : ZERO;
}

export function settlementAmount(principal: bigint, accrued: bigint, fee: bigint, rebate: bigint) {
  return principal + accrued + fee - rebate;
}

export function bps(rate: number) {
  return Math.max(0, Math.round(rate * 10000));
}

export function distributeByUnits(rows: { units: bigint }[], principal: bigint, income: bigint) {
  const total = rows.reduce((sum, row) => sum + row.units, ZERO);
  let paidPrincipal = ZERO;
  let paidIncome = ZERO;
  return rows.map((row, index) => {
    const last = index === rows.length - 1;
    const principalShare = last || total === ZERO ? principal - paidPrincipal : (principal * row.units) / total;
    const incomeShare = last || total === ZERO ? income - paidIncome : (income * row.units) / total;
    paidPrincipal += principalShare;
    paidIncome += incomeShare;
    return { principal: principalShare, income: incomeShare };
  });
}
