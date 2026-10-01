#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, String};

#[contracttype]
#[derive(Clone)]
pub struct Subscription {
    pub investor: Address,
    pub pool_id: String,
    pub amount: i128,
    pub shares: i128,
    pub status: String,
    pub subscribed_at: u64,
}

#[contracttype]
pub enum DataKey {
    Subscription(Address, String),
    InvestorSubscriptions(Address),
    PoolSubscriptions(String),
    Admin,
    PoolContract,
}

#[contract]
pub struct SubscriptionContract;

#[contractimpl]
impl SubscriptionContract {
    /// Initialize contract
    pub fn initialize(env: Env, admin: Address, pool_contract: Address) {
        admin.require_auth();
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage()
            .instance()
            .set(&DataKey::PoolContract, &pool_contract);
    }

    /// Subscribe to a pool
    pub fn subscribe(
        env: Env,
        investor: Address,
        pool_id: String,
        amount: i128,
        shares: i128,
    ) -> Subscription {
        investor.require_auth();

        let subscription = Subscription {
            investor: investor.clone(),
            pool_id: pool_id.clone(),
            amount,
            shares,
            status: String::from_str(&env, "ACTIVE"),
            subscribed_at: env.ledger().timestamp(),
        };

        env.storage().persistent().set(
            &DataKey::Subscription(investor.clone(), pool_id.clone()),
            &subscription,
        );

        subscription
    }

    /// Get subscription
    pub fn get_subscription(
        env: Env,
        investor: Address,
        pool_id: String,
    ) -> Option<Subscription> {
        env.storage()
            .persistent()
            .get(&DataKey::Subscription(investor, pool_id))
    }

    /// Cancel subscription
    pub fn cancel_subscription(env: Env, investor: Address, pool_id: String) {
        investor.require_auth();

        if let Some(mut subscription) = env.storage().persistent().get::<DataKey, Subscription>(
            &DataKey::Subscription(investor.clone(), pool_id.clone()),
        ) {
            subscription.status = String::from_str(&env, "CANCELLED");
            env.storage().persistent().set(
                &DataKey::Subscription(investor, pool_id),
                &subscription,
            );
        }
    }

    /// Update subscription status
    pub fn update_status(
        env: Env,
        investor: Address,
        pool_id: String,
        new_status: String,
    ) {
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        admin.require_auth();

        if let Some(mut subscription) = env.storage().persistent().get::<DataKey, Subscription>(
            &DataKey::Subscription(investor.clone(), pool_id.clone()),
        ) {
            subscription.status = new_status;
            env.storage().persistent().set(
                &DataKey::Subscription(investor, pool_id),
                &subscription,
            );
        }
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::{testutils::Address as _, Address, Env, String};

    #[test]
    fn test_subscribe() {
        let env = Env::default();
        let contract_id = env.register_contract(None, SubscriptionContract);
        let client = SubscriptionContractClient::new(&env, &contract_id);

        let admin = Address::generate(&env);
        let pool_contract = Address::generate(&env);
        let investor = Address::generate(&env);

        env.mock_all_auths();

        client.initialize(&admin, &pool_contract);

        let subscription = client.subscribe(
            &investor,
            &String::from_str(&env, "POOL-001"),
            &100_000_0000000i128,
            &20_0000000i128,
        );

        assert_eq!(subscription.investor, investor);
        assert_eq!(subscription.amount, 100_000_0000000i128);
        assert_eq!(
            subscription.status,
            String::from_str(&env, "ACTIVE")
        );
    }
}
