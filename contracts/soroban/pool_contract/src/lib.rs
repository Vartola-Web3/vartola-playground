#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, String};

#[contracttype]
#[derive(Clone)]
pub struct Pool {
    pub pool_id: String,
    pub pool_name: String,
    pub target_amount: i128,
    pub raised_amount: i128,
    pub min_investment: i128,
    pub target_return: u32,
    pub status: String,
    pub asset_focus: String,
    pub created_at: u64,
}

#[contracttype]
pub enum DataKey {
    Pool(String),
    PoolCount,
    Admin,
}

#[contract]
pub struct PoolContract;

#[contractimpl]
impl PoolContract {
    /// Initialize the contract
    pub fn initialize(env: Env, admin: Address) {
        admin.require_auth();
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::PoolCount, &0u32);
    }

    /// Create a new investment pool
    pub fn create_pool(
        env: Env,
        pool_id: String,
        pool_name: String,
        target_amount: i128,
        min_investment: i128,
        target_return: u32,
        asset_focus: String,
    ) -> Pool {
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        admin.require_auth();

        let pool = Pool {
            pool_id: pool_id.clone(),
            pool_name,
            target_amount,
            raised_amount: 0,
            min_investment,
            target_return,
            status: String::from_str(&env, "OPEN"),
            asset_focus,
            created_at: env.ledger().timestamp(),
        };

        env.storage()
            .persistent()
            .set(&DataKey::Pool(pool_id), &pool);

        let count: u32 = env.storage().instance().get(&DataKey::PoolCount).unwrap();
        env.storage()
            .instance()
            .set(&DataKey::PoolCount, &(count + 1));

        pool
    }

    /// Get pool by ID
    pub fn get_pool(env: Env, pool_id: String) -> Option<Pool> {
        env.storage().persistent().get(&DataKey::Pool(pool_id))
    }

    /// Update raised amount
    pub fn update_raised_amount(env: Env, pool_id: String, amount: i128) {
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        admin.require_auth();

        if let Some(mut pool) = env
            .storage()
            .persistent()
            .get::<DataKey, Pool>(&DataKey::Pool(pool_id.clone()))
        {
            pool.raised_amount += amount;
            
            if pool.raised_amount >= pool.target_amount {
                pool.status = String::from_str(&env, "FUNDED");
            }

            env.storage()
                .persistent()
                .set(&DataKey::Pool(pool_id), &pool);
        }
    }

    /// Close pool
    pub fn close_pool(env: Env, pool_id: String) {
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        admin.require_auth();

        if let Some(mut pool) = env
            .storage()
            .persistent()
            .get::<DataKey, Pool>(&DataKey::Pool(pool_id.clone()))
        {
            pool.status = String::from_str(&env, "CLOSED");
            env.storage()
                .persistent()
                .set(&DataKey::Pool(pool_id), &pool);
        }
    }

    /// Get pool count
    pub fn get_pool_count(env: Env) -> u32 {
        env.storage().instance().get(&DataKey::PoolCount).unwrap_or(0)
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::{testutils::Address as _, Address, Env, String};

    #[test]
    fn test_create_pool() {
        let env = Env::default();
        let contract_id = env.register_contract(None, PoolContract);
        let client = PoolContractClient::new(&env, &contract_id);

        let admin = Address::generate(&env);

        env.mock_all_auths();

        client.initialize(&admin);

        let pool = client.create_pool(
            &String::from_str(&env, "POOL-001"),
            &String::from_str(&env, "Logistics Pool"),
            &500_000_0000000i128,
            &25_000_0000000i128,
            &950u32,
            &String::from_str(&env, "UAE Trucks"),
        );

        assert_eq!(pool.pool_id, String::from_str(&env, "POOL-001"));
        assert_eq!(pool.raised_amount, 0);
        assert_eq!(client.get_pool_count(), 1);
    }

    #[test]
    fn test_update_raised_amount() {
        let env = Env::default();
        let contract_id = env.register_contract(None, PoolContract);
        let client = PoolContractClient::new(&env, &contract_id);

        let admin = Address::generate(&env);

        env.mock_all_auths();

        client.initialize(&admin);
        client.create_pool(
            &String::from_str(&env, "POOL-001"),
            &String::from_str(&env, "Test Pool"),
            &500_000_0000000i128,
            &25_000_0000000i128,
            &950u32,
            &String::from_str(&env, "Test"),
        );

        client.update_raised_amount(&String::from_str(&env, "POOL-001"), &100_000_0000000i128);

        let pool = client.get_pool(&String::from_str(&env, "POOL-001")).unwrap();
        assert_eq!(pool.raised_amount, 100_000_0000000i128);
    }
}
