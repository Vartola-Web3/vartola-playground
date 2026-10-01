#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, String, Vec};

#[contracttype]
#[derive(Clone)]
pub struct Facility {
    pub facility_id: String,
    pub company: Address,
    pub asset_value: i128,
    pub finance_amount: i128,
    pub term_months: u32,
    pub monthly_payment: i128,
    pub pool_id: String,
    pub status: String,
    pub created_at: u64,
}

#[contracttype]
pub enum DataKey {
    Facility(String),
    FacilityCount,
    Admin,
}

#[contract]
pub struct FacilityContract;

#[contractimpl]
impl FacilityContract {
    /// Initialize the contract with admin
    pub fn initialize(env: Env, admin: Address) {
        admin.require_auth();
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::FacilityCount, &0u32);
    }

    /// Create a new facility
    pub fn create_facility(
        env: Env,
        facility_id: String,
        company: Address,
        asset_value: i128,
        finance_amount: i128,
        term_months: u32,
        monthly_payment: i128,
        pool_id: String,
    ) -> Facility {
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        admin.require_auth();

        company.require_auth();

        let facility = Facility {
            facility_id: facility_id.clone(),
            company,
            asset_value,
            finance_amount,
            term_months,
            monthly_payment,
            pool_id,
            status: String::from_str(&env, "ACTIVE"),
            created_at: env.ledger().timestamp(),
        };

        env.storage()
            .persistent()
            .set(&DataKey::Facility(facility_id), &facility);

        let count: u32 = env.storage().instance().get(&DataKey::FacilityCount).unwrap();
        env.storage()
            .instance()
            .set(&DataKey::FacilityCount, &(count + 1));

        facility
    }

    /// Get facility by ID
    pub fn get_facility(env: Env, facility_id: String) -> Option<Facility> {
        env.storage()
            .persistent()
            .get(&DataKey::Facility(facility_id))
    }

    /// Update facility status
    pub fn update_status(env: Env, facility_id: String, new_status: String) {
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        admin.require_auth();

        if let Some(mut facility) = env
            .storage()
            .persistent()
            .get::<DataKey, Facility>(&DataKey::Facility(facility_id.clone()))
        {
            facility.status = new_status;
            env.storage()
                .persistent()
                .set(&DataKey::Facility(facility_id), &facility);
        }
    }

    /// Get total facility count
    pub fn get_facility_count(env: Env) -> u32 {
        env.storage().instance().get(&DataKey::FacilityCount).unwrap_or(0)
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::{testutils::Address as _, Address, Env, String};

    #[test]
    fn test_create_facility() {
        let env = Env::default();
        let contract_id = env.register_contract(None, FacilityContract);
        let client = FacilityContractClient::new(&env, &contract_id);

        let admin = Address::generate(&env);
        let company = Address::generate(&env);

        env.mock_all_auths();

        client.initialize(&admin);

        let facility = client.create_facility(
            &String::from_str(&env, "FAC-001"),
            &company,
            &300_000_0000000i128,
            &225_000_0000000i128,
            &36u32,
            &7_020_0000000i128,
            &String::from_str(&env, "POOL-001"),
        );

        assert_eq!(facility.facility_id, String::from_str(&env, "FAC-001"));
        assert_eq!(facility.company, company);
        assert_eq!(facility.term_months, 36);
        assert_eq!(client.get_facility_count(), 1);
    }
}
