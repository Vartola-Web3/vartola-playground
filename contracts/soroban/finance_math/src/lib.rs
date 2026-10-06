#![no_std]

pub fn platform_fee(gross: i128, bps: u32) -> i128 {
    gross.saturating_mul(bps as i128) / 10_000
}

pub fn reserve_amount(gross: i128, bps: u32) -> i128 {
    gross.saturating_mul(bps as i128) / 10_000
}

pub fn net_amount(gross: i128, fee_bps: u32, reserve_bps: u32) -> i128 {
    let fee = platform_fee(gross, fee_bps);
    let reserve = reserve_amount(gross, reserve_bps);
    gross.saturating_sub(fee).saturating_sub(reserve)
}

/// Equal principal each period. The final period takes whatever principal remains.
pub fn principal_component(
    finance_amount: i128,
    term_months: u32,
    payment_index: u32,
    remaining: i128,
    net: i128,
) -> i128 {
    if term_months == 0 || remaining <= 0 || net <= 0 {
        return 0;
    }
    let equal = finance_amount / (term_months as i128);
    let due = if payment_index >= term_months { remaining } else { equal.min(remaining) };
    due.min(net).min(remaining)
}

pub fn income_component(net: i128, principal: i128) -> i128 {
    net.saturating_sub(principal).max(0)
}

pub fn share_of(amount: i128, units: i128, total_units: i128) -> i128 {
    if total_units <= 0 || units <= 0 || amount <= 0 {
        return 0;
    }
    amount.saturating_mul(units) / total_units
}

pub fn settlement_amount(principal: i128, accrued_income: i128, fee: i128, rebate: i128) -> i128 {
    principal.saturating_add(accrued_income).saturating_add(fee).saturating_sub(rebate)
}

pub fn participation_units(amount: i128, unit_value: i128) -> i128 {
    if unit_value <= 0 {
        return 0;
    }
    amount / unit_value
}

/// One payment split into its parts. The same function is used for repayment, settlement and recovery so the
/// arithmetic cannot drift between them. Fee and reserve rates are facility parameters, not constants.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct Waterfall {
    pub fee: i128,
    pub reserve: i128,
    pub net: i128,
    pub principal: i128,
    pub income: i128,
}

pub fn calculate_waterfall(
    gross: i128,
    fee_bps: u32,
    reserve_bps: u32,
    finance_amount: i128,
    term_months: u32,
    payment_index: u32,
    remaining_principal: i128,
) -> Waterfall {
    let fee = platform_fee(gross, fee_bps);
    let reserve = reserve_amount(gross, reserve_bps);
    let net = net_amount(gross, fee_bps, reserve_bps);
    let principal = principal_component(finance_amount, term_months, payment_index, remaining_principal, net).min(remaining_principal.max(0));
    let income = income_component(net, principal);
    Waterfall { fee, reserve, net, principal, income }
}

/// Early settlement: what the payer owes and how it is allocated. Principal and income go to investors, the fee
/// to the treasury.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct SettlementSplit {
    pub due: i128,
    pub principal: i128,
    pub income: i128,
    pub fee: i128,
}

pub fn settlement_split(principal_outstanding: i128, accrued_income: i128, fee: i128, rebate: i128) -> SettlementSplit {
    SettlementSplit {
        due: settlement_amount(principal_outstanding, accrued_income, fee, rebate),
        principal: principal_outstanding,
        income: accrued_income.saturating_sub(rebate).max(0),
        fee,
    }
}

/// Recovery: sale proceeds less permitted costs go to outstanding principal first. Anything above the principal
/// is residual and is handled according to the agreement.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct RecoverySplit {
    pub costs: i128,
    pub principal: i128,
    pub residual: i128,
}

pub fn recovery_split(sale_proceeds: i128, recovery_costs: i128, principal_outstanding: i128) -> RecoverySplit {
    let costs = recovery_costs.max(0).min(sale_proceeds.max(0));
    let net = sale_proceeds.max(0) - costs;
    let principal = net.min(principal_outstanding.max(0));
    RecoverySplit { costs, principal, residual: net - principal }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn splits_a_standard_installment() {
        let gross = 7_000_000_000i128; // 700 VTAED
        let net = net_amount(gross, 100, 50);
        assert_eq!(platform_fee(gross, 100), 70_000_000);
        assert_eq!(reserve_amount(gross, 50), 35_000_000);
        let principal = principal_component(150_000_000_000, 24, 1, 150_000_000_000, net);
        assert_eq!(principal, 6_250_000_000); // 625 VTAED
        assert!(income_component(net, principal) > 0);
    }

    #[test]
    fn units_are_amount_over_unit_value() {
        assert_eq!(participation_units(250_000_000_000, 1_000_000_000), 250);
    }

    #[test]
    fn settlement_adds_income_and_fee_and_subtracts_rebate() {
        assert_eq!(settlement_amount(1_000, 200, 50, 20), 1_230);
    }

    #[test]
    fn waterfall_matches_the_component_functions() {
        let w = calculate_waterfall(7_000_000_000, 100, 50, 150_000_000_000, 24, 1, 150_000_000_000);
        assert_eq!(w.fee, 70_000_000);
        assert_eq!(w.reserve, 35_000_000);
        assert_eq!(w.net, 6_895_000_000);
        assert_eq!(w.principal, 6_250_000_000);
        assert_eq!(w.income, 645_000_000);
        assert_eq!(w.fee + w.reserve + w.principal + w.income, 7_000_000_000);
    }

    #[test]
    fn waterfall_never_repays_more_principal_than_is_outstanding() {
        let w = calculate_waterfall(7_000_000_000, 0, 0, 150_000_000_000, 24, 24, 1_000_000_000);
        assert_eq!(w.principal, 1_000_000_000);
        assert_eq!(w.income, 6_000_000_000);
    }

    #[test]
    fn waterfall_handles_zero_and_negative_inputs() {
        let w = calculate_waterfall(0, 100, 50, 150_000_000_000, 24, 1, 150_000_000_000);
        assert_eq!((w.fee, w.reserve, w.net, w.principal, w.income), (0, 0, 0, 0, 0));
        let done = calculate_waterfall(1_000, 0, 0, 1_000, 1, 1, 0);
        assert_eq!(done.principal, 0);
    }

    #[test]
    fn settlement_split_allocates_principal_income_and_fee() {
        let s = settlement_split(25_000_000_000, 500_000_000, 250_000_000, 100_000_000);
        assert_eq!(s.due, 25_650_000_000);
        assert_eq!((s.principal, s.income, s.fee), (25_000_000_000, 400_000_000, 250_000_000));
        assert_eq!(s.principal + s.income + s.fee, s.due);
    }

    #[test]
    fn recovery_pays_costs_then_principal_then_residual() {
        let r = recovery_split(20_000_000_000, 2_000_000_000, 25_000_000_000);
        assert_eq!((r.costs, r.principal, r.residual), (2_000_000_000, 18_000_000_000, 0));
        let surplus = recovery_split(30_000_000_000, 1_000_000_000, 25_000_000_000);
        assert_eq!((surplus.principal, surplus.residual), (25_000_000_000, 4_000_000_000));
        let costly = recovery_split(1_000, 5_000, 10_000);
        assert_eq!((costly.costs, costly.principal, costly.residual), (1_000, 0, 0));
    }
}
