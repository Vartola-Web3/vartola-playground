import { distributeByUnits, splitRecovery, splitRepayment, type ReservePolicy } from '@/lib/finance/waterfall-v2';
import type { SandboxRole, SandboxState } from './state';

// Interactive sandbox engine. Pure and deterministic: it never reads the clock or the network, and the same
// seed plus the same action list always produces the same state.

export type SandboxAction =
  | { type: 'SET_ACTOR'; role: SandboxRole }
  | { type: 'SUBMIT_APPLICATION' }
  | { type: 'UNDERWRITE_APPROVE' }
  | { type: 'OPEN_POOL' }
  | { type: 'INVEST'; investorId: string; amount: number }
  | { type: 'ATTEST_CONDITION'; conditionType: string }
  | { type: 'RELEASE_TO_SUPPLIER' }
  | { type: 'VERIFY_CHECK'; checkType: string }
  | { type: 'ACTIVATE_FACILITY' }
  | { type: 'ADVANCE_TIME'; days: number }
  | { type: 'PAY_INSTALLMENT' }
  | { type: 'SETTLE_EARLY' }
  | { type: 'MARK_DEFAULT' }
  | { type: 'RECOVER'; proceeds: number };

export type AvailableAction = {
  id: SandboxAction['type'];
  label: string;
  role: SandboxRole;
  kind: 'primary' | 'risk';
  enabled: boolean;
  hint?: string;
  action: SandboxAction;
};

const clone = (state: SandboxState): SandboxState => JSON.parse(JSON.stringify(state)) as SandboxState;
const addDays = (iso: string, days: number) => new Date(new Date(iso).getTime() + days * 86_400_000).toISOString();
const monthAfter = (iso: string, months: number) => {
  const date = new Date(iso);
  date.setMonth(date.getMonth() + months);
  return date.toISOString();
};

const principalOutstanding = (state: SandboxState) =>
  Math.max(0, state.facility.financeAmount - state.investors.reduce((sum, row) => sum + row.principalReturned, 0));

const reservePolicy = (state: SandboxState): ReservePolicy => ({
  reserveRateBps: state.facility.reserveRateBps,
  reserveTarget: state.facility.reserveTarget,
  permittedUses: ['SHORTFALL', 'RECOVERY_COST'],
});

function ledger(state: SandboxState, actor: SandboxRole, type: string, amount: number, direction: 'IN' | 'OUT', note: string) {
  state.ledger.push({ at: state.clock, actor, type, amount, direction, note });
}

function event(state: SandboxState, type: string, detail: string) {
  state.timeline.push({ at: state.clock, type, detail });
}

function requirePhase(state: SandboxState, allowed: SandboxState['phase'][]) {
  if (!allowed.includes(state.phase)) {
    throw new Error(`This action is not available at phase ${state.phase}`);
  }
}

export function applyAction(current: SandboxState, action: SandboxAction): SandboxState {
  const state = clone(current);
  switch (action.type) {
    case 'SET_ACTOR': {
      state.actor = action.role;
      return state;
    }

    case 'SUBMIT_APPLICATION': {
      requirePhase(state, ['APPLICATION']);
      state.phase = 'UNDER_REVIEW';
      event(state, 'ApplicationSubmitted', `${state.sme.name} applied for ${state.facility.financeAmount}`);
      return state;
    }

    case 'UNDERWRITE_APPROVE': {
      requirePhase(state, ['UNDER_REVIEW']);
      state.phase = 'APPROVED';
      event(state, 'FacilityApproved', `Approved at tier A`);
      return state;
    }

    case 'OPEN_POOL': {
      requirePhase(state, ['APPROVED']);
      state.pool.status = 'OPEN';
      state.phase = 'POOL_OPEN';
      event(state, 'PoolOpened', `Target ${state.pool.target}`);
      return state;
    }

    case 'INVEST': {
      requirePhase(state, ['POOL_OPEN', 'FUNDING']);
      const investor = state.investors.find((row) => row.id === action.investorId);
      if (!investor) throw new Error('Unknown investor');
      if (investor.wallet.available < action.amount) throw new Error('Insufficient wallet balance');
      investor.wallet.available -= action.amount;
      investor.wallet.reserved += action.amount;
      state.pool.raised += action.amount;
      ledger(state, 'INVESTOR', 'INVESTMENT_RESERVE', action.amount, 'OUT', `${investor.name} reserved ${action.amount}`);
      if (state.pool.raised >= state.pool.target) {
        state.phase = 'RELEASE_READY';
        state.pool.status = 'ACTIVE';
        event(state, 'FullyFunded', `Raised ${state.pool.raised} of ${state.pool.target}`);
      } else if (state.phase === 'POOL_OPEN') {
        state.phase = 'FUNDING';
      }
      return state;
    }

    case 'ATTEST_CONDITION': {
      requirePhase(state, ['RELEASE_READY']);
      const condition = state.conditions.find((row) => row.type === action.conditionType);
      if (!condition) throw new Error('Unknown condition');
      condition.status = 'VERIFIED';
      event(state, 'ConditionAttested', `${condition.label} verified`);
      return state;
    }

    case 'RELEASE_TO_SUPPLIER': {
      requirePhase(state, ['RELEASE_READY']);
      if (state.conditions.some((row) => row.status !== 'VERIFIED')) throw new Error('Release conditions are incomplete');
      state.supplier.wallet.available += state.facility.financeAmount;
      for (const investor of state.investors) {
        investor.wallet.reserved -= investor.units * state.facility.unitValue;
        investor.wallet.deployed += investor.units * state.facility.unitValue;
      }
      state.phase = 'DELIVERY_PENDING';
      ledger(state, 'OPERATIONS', 'RELEASE_FUNDS', state.facility.financeAmount, 'OUT', 'Released to the supplier');
      event(state, 'ReleaseAuthorized', `${state.facility.financeAmount} released to ${state.supplier.name}`);
      return state;
    }

    case 'VERIFY_CHECK': {
      requirePhase(state, ['DELIVERY_PENDING']);
      const check = state.checks.find((row) => row.type === action.checkType);
      if (!check) throw new Error('Unknown delivery check');
      check.status = 'VERIFIED';
      event(state, 'DeliveryCheck', `${check.label} verified`);
      return state;
    }

    case 'ACTIVATE_FACILITY': {
      requirePhase(state, ['DELIVERY_PENDING']);
      if (state.checks.some((row) => row.status !== 'VERIFIED')) throw new Error('Delivery checks are incomplete');
      state.phase = 'ACTIVE';
      state.payments = Array.from({ length: state.facility.termMonths }, (_, index) => ({
        no: index + 1,
        dueDate: monthAfter(state.clock, index + 1),
        amount: state.facility.monthlyPayment,
        principal: 0,
        income: 0,
        fee: 0,
        reserve: 0,
        status: 'SCHEDULED' as const,
      }));
      event(state, 'FacilityActivated', `Income starts for ${state.facility.termMonths} months`);
      return state;
    }

    case 'ADVANCE_TIME': {
      state.clock = addDays(state.clock, action.days);
      return state;
    }

    case 'PAY_INSTALLMENT': {
      requirePhase(state, ['ACTIVE']);
      const scheduled = state.payments.find((row) => row.status === 'SCHEDULED');
      if (!scheduled) throw new Error('No unpaid installment is available');
      const split = splitRepayment({
        gross: scheduled.amount,
        feeBps: state.facility.feeBps,
        reserve: reservePolicy(state),
        reserveBalance: state.reserveBalance,
        financeAmount: state.facility.financeAmount,
        termMonths: state.facility.termMonths,
        paymentIndex: scheduled.no,
        remainingPrincipal: principalOutstanding(state),
      });
      if (state.sme.wallet.available < scheduled.amount) throw new Error('The SME wallet cannot cover this installment');

      state.sme.wallet.available -= scheduled.amount;
      state.reserveBalance += split.reserve;

      const principalShares = distributeByUnits(split.principal, state.investors);
      const incomeShares = distributeByUnits(split.income, state.investors);
      for (const investor of state.investors) {
        const principal = principalShares.shares.find((row) => row.id === investor.id)?.amount ?? 0;
        const income = incomeShares.shares.find((row) => row.id === investor.id)?.amount ?? 0;
        investor.wallet.available += principal + income;
        investor.wallet.deployed = Math.max(0, investor.wallet.deployed - principal);
        investor.principalReturned += principal;
        investor.incomeReceived += income;
        state.distributions.push({ paymentNo: scheduled.no, investorId: investor.id, principal, income });
      }

      scheduled.status = 'PAID';
      scheduled.principal = split.principal;
      scheduled.income = split.income;
      scheduled.fee = split.fee;
      scheduled.reserve = split.reserve;
      ledger(state, 'SME', 'INSTALLMENT_PAYMENT', scheduled.amount, 'OUT', `Installment ${scheduled.no}`);
      event(state, 'RepaymentRecorded', `Installment ${scheduled.no}: principal ${split.principal}, income ${split.income}`);

      if (state.payments.every((row) => row.status === 'PAID')) {
        state.phase = 'COMPLETED';
        state.pool.status = 'COMPLETED';
        event(state, 'FacilityCompleted', 'Every installment paid');
      }
      return state;
    }

    case 'SETTLE_EARLY': {
      requirePhase(state, ['ACTIVE']);
      if (state.flags.settled) throw new Error('The facility is already settled');
      const principal = principalOutstanding(state);
      const fee = Math.floor((principal * state.facility.feeBps) / 10_000);
      const due = principal + fee;
      if (state.sme.wallet.available < due) throw new Error('The SME wallet cannot cover the settlement');
      state.sme.wallet.available -= due;
      const shares = distributeByUnits(principal, state.investors);
      for (const investor of state.investors) {
        const amount = shares.shares.find((row) => row.id === investor.id)?.amount ?? 0;
        investor.wallet.available += amount;
        investor.wallet.deployed = Math.max(0, investor.wallet.deployed - amount);
        investor.principalReturned += amount;
      }
      state.flags.settled = true;
      state.phase = 'SETTLED';
      ledger(state, 'SME', 'EARLY_SETTLEMENT', due, 'OUT', 'Settled the outstanding principal');
      event(state, 'FacilitySettled', `Settled ${due} (principal ${principal} + fee ${fee})`);
      return state;
    }

    case 'MARK_DEFAULT': {
      requirePhase(state, ['ACTIVE']);
      state.flags.defaulted = true;
      state.phase = 'DEFAULTED';
      event(state, 'FacilityDefaulted', 'A missed cure window');
      return state;
    }

    case 'RECOVER': {
      requirePhase(state, ['DEFAULTED']);
      const recovery = splitRecovery({
        grossProceeds: action.proceeds,
        servicingCost: 0,
        recoveryCost: 0,
        principalOutstanding: principalOutstanding(state),
        accruedIncome: 0,
        reserveBalance: state.reserveBalance,
        reserveMayCoverShortfall: false,
      });
      const shares = distributeByUnits(recovery.investorDistribution, state.investors);
      for (const investor of state.investors) {
        const amount = shares.shares.find((row) => row.id === investor.id)?.amount ?? 0;
        investor.wallet.available += amount;
        investor.recoveryReceived += amount;
        state.recovery.push({ investorId: investor.id, amount });
      }
      state.flags.recovered = true;
      state.phase = 'RECOVERED';
      event(state, 'RecoveryDistributed', `Proceeds ${action.proceeds}; distributed ${recovery.investorDistribution}; shortfall ${recovery.shortfall}`);
      return state;
    }

    default: {
      const exhaustive: never = action;
      throw new Error(`Unsupported action: ${JSON.stringify(exhaustive)}`);
    }
  }
}

export function nextActions(state: SandboxState): AvailableAction[] {
  const actions: AvailableAction[] = [];
  const add = (entry: AvailableAction) => {
    if (entry.role === state.actor) actions.push(entry);
  };
  const money = (value: number) => value.toLocaleString('en-US');
  const allVerified = (rows: { status: string }[]) => rows.every((row) => row.status === 'VERIFIED');

  switch (state.phase) {
    case 'APPLICATION':
      add({ id: 'SUBMIT_APPLICATION', label: 'Submit the financing application', role: 'SME', kind: 'primary', enabled: true, action: { type: 'SUBMIT_APPLICATION' } });
      break;
    case 'UNDER_REVIEW':
      add({ id: 'UNDERWRITE_APPROVE', label: 'Approve the facility', role: 'UNDERWRITER', kind: 'primary', enabled: true, action: { type: 'UNDERWRITE_APPROVE' } });
      break;
    case 'APPROVED':
      add({ id: 'OPEN_POOL', label: 'Open the investment pool', role: 'OPERATIONS', kind: 'primary', enabled: true, action: { type: 'OPEN_POOL' } });
      break;
    case 'POOL_OPEN':
    case 'FUNDING':
      for (const investor of state.investors) {
        if (investor.wallet.available > 0) {
          add({ id: 'INVEST', label: `${investor.name} reserves ${money(investor.wallet.available)}`, role: 'INVESTOR', kind: 'primary', enabled: true, action: { type: 'INVEST', investorId: investor.id, amount: investor.wallet.available } });
        }
      }
      break;
    case 'RELEASE_READY':
      for (const condition of state.conditions) {
        if (condition.status !== 'VERIFIED') {
          add({ id: 'ATTEST_CONDITION', label: `Attest: ${condition.label}`, role: 'OPERATIONS', kind: 'primary', enabled: true, action: { type: 'ATTEST_CONDITION', conditionType: condition.type } });
        }
      }
      add({ id: 'RELEASE_TO_SUPPLIER', label: 'Release funds to the supplier', role: 'OPERATIONS', kind: 'primary', enabled: allVerified(state.conditions), hint: allVerified(state.conditions) ? undefined : 'Attest every release condition first', action: { type: 'RELEASE_TO_SUPPLIER' } });
      break;
    case 'DELIVERY_PENDING':
      for (const check of state.checks) {
        if (check.status !== 'VERIFIED') {
          add({ id: 'VERIFY_CHECK', label: `Verify: ${check.label}`, role: 'OPERATIONS', kind: 'primary', enabled: true, action: { type: 'VERIFY_CHECK', checkType: check.type } });
        }
      }
      add({ id: 'ACTIVATE_FACILITY', label: 'Activate the facility', role: 'OPERATIONS', kind: 'primary', enabled: allVerified(state.checks), hint: allVerified(state.checks) ? undefined : 'Verify every delivery check first', action: { type: 'ACTIVATE_FACILITY' } });
      break;
    case 'ACTIVE':
      add({ id: 'PAY_INSTALLMENT', label: 'Pay the next installment', role: 'SME', kind: 'primary', enabled: true, action: { type: 'PAY_INSTALLMENT' } });
      add({ id: 'SETTLE_EARLY', label: 'Settle the outstanding principal early', role: 'SME', kind: 'primary', enabled: true, action: { type: 'SETTLE_EARLY' } });
      add({ id: 'MARK_DEFAULT', label: 'Mark the facility in default', role: 'OPERATIONS', kind: 'risk', enabled: true, action: { type: 'MARK_DEFAULT' } });
      break;
    case 'DEFAULTED':
      add({ id: 'RECOVER', label: 'Record recovery proceeds (90,000)', role: 'OPERATIONS', kind: 'risk', enabled: true, action: { type: 'RECOVER', proceeds: 90_000 } });
      break;
    default:
      break;
  }

  return actions;
}
