#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, String, Vec};

#[contracttype]
#[derive(Clone)]
pub struct Distribution {
    pub facility_id: String,
    pub payment_amount: i128,
    pub distributed_at: u64,
    pub status: String,
}

#[contracttype]
#[derive(Clone)]
pub struct InvestorShare {
    pub investor: Address,
    pub share_amount: i128,
}

#[contracttype]
pub enum DataKey {
    Distribution(String, u64),
    DistributionCount(String),
    Admin,
    FacilityContract,
    SubscriptionContract,
}

#[contract]
pub struct PaymentDistributor;

#[contractimpl]
impl PaymentDistributor {
    /// Initialize contract
    pub fn initialize(
        env: Env,
        admin: Address,
        facility_contract: Address,
        subscription_contract: Address,
    ) {
        admin.require_auth();
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage()
            .instance()
            .set(&DataKey::FacilityContract, &facility_contract);
        env.storage()
            .instance()
            .set(&DataKey::SubscriptionContract, &subscription_contract);
    }

    /// Distribute payment to investors
    pub fn distribute_payment(
        env: Env,
        facility_id: String,
        payment_amount: i128,
        investor_shares: Vec<InvestorShare>,
    ) -> Distribution {
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        admin.require_auth();

        let timestamp = env.ledger().timestamp();

        let distribution = Distribution {
            facility_id: facility_id.clone(),
            payment_amount,
            distributed_at: timestamp,
            status: String::from_str(&env, "COMPLETED"),
        };

        env.storage().persistent().set(
            &DataKey::Distribution(facility_id.clone(), timestamp),
            &distribution,
        );

        let count: u32 = env
            .storage()
            .persistent()
            .get(&DataKey::DistributionCount(facility_id.clone()))
            .unwrap_or(0);
        env.storage().persistent().set(
            &DataKey::DistributionCount(facility_id),
            &(count + 1),
        );

        distribution
    }

    /// Get distribution
    pub fn get_distribution(
        env: Env,
        facility_id: String,
        timestamp: u64,
    ) -> Option<Distribution> {
        env.storage()
            .persistent()
            .get(&DataKey::Distribution(facility_id, timestamp))
    }

    /// Get distribution count for facility
    pub fn get_distribution_count(env: Env, facility_id: String) -> u32 {
        env.storage()
            .persistent()
            .get(&DataKey::DistributionCount(facility_id))
            .unwrap_or(0)
    }

    /// Calculate investor share
    pub fn calculate_share(
        _env: Env,
        total_payment: i128,
        investor_amount: i128,
        pool_total: i128,
    ) -> i128 {
        if pool_total == 0 {
            return 0;
        }
        (total_payment * investor_amount) / pool_total
    }

    pub fn calculate_platform_fee(_env: Env, gross: i128, fee_bps: u32) -> i128 {
        finance_math::platform_fee(gross, fee_bps)
    }

    pub fn calculate_reserve(_env: Env, gross: i128, reserve_bps: u32) -> i128 {
        finance_math::reserve_amount(gross, reserve_bps)
    }

    pub fn calculate_principal(
        _env: Env,
        finance_amount: i128,
        term_months: u32,
        payment_index: u32,
        remaining: i128,
        net: i128,
    ) -> i128 {
        finance_math::principal_component(finance_amount, term_months, payment_index, remaining, net)
    }

    pub fn calculate_income(_env: Env, net: i128, principal: i128) -> i128 {
        finance_math::income_component(net, principal)
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::{testutils::Address as _, vec, Address, Env, String};

    #[test]
    fn test_distribute_payment() {
        let env = Env::default();
        let contract_id = env.register_contract(None, PaymentDistributor);
        let client = PaymentDistributorClient::new(&env, &contract_id);

        let admin = Address::generate(&env);
        let facility_contract = Address::generate(&env);
        let subscription_contract = Address::generate(&env);

        env.mock_all_auths();

        client.initialize(&admin, &facility_contract, &subscription_contract);

        let investor1 = Address::generate(&env);
        let investor2 = Address::generate(&env);

        let shares = vec![
            &env,
            InvestorShare {
                investor: investor1,
                share_amount: 4_000_0000000i128,
            },
            InvestorShare {
                investor: investor2,
                share_amount: 3_000_0000000i128,
            },
        ];

        let distribution = client.distribute_payment(
            &String::from_str(&env, "FAC-001"),
            &7_000_0000000i128,
            &shares,
        );

        assert_eq!(distribution.payment_amount, 7_000_0000000i128);
        assert_eq!(
            distribution.status,
            String::from_str(&env, "COMPLETED")
        );
        assert_eq!(
            client.get_distribution_count(&String::from_str(&env, "FAC-001")),
            1
        );
    }

    #[test]
    fn test_calculate_share() {
        let env = Env::default();
        let contract_id = env.register_contract(None, PaymentDistributor);
        let client = PaymentDistributorClient::new(&env, &contract_id);

        let share = client.calculate_share(
            &7_000_0000000i128,
            &100_000_0000000i128,
            &500_000_0000000i128,
        );

        assert_eq!(share, 1_400_0000000i128);
    }
}
