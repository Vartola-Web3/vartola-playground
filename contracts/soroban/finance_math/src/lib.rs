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
}
