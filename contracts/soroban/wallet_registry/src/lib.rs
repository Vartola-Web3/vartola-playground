#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, String};

pub const ROLE_INVESTOR: u32 = 1;
pub const STATUS_ACTIVE: u32 = 1;
pub const STATUS_SUSPENDED: u32 = 2;
const UAE: u32 = 784;

#[contracttype]
#[derive(Clone)]
pub struct WalletRecord {
    pub user_id_hash: String,
    pub role: u32,
    pub kyc_approved: bool,
    pub kyb_approved: bool,
    pub jurisdiction_code: u32,
    pub investment_limit: i128,
    pub account_status: u32,
    pub invested_amount: i128,
}

#[contracttype]
enum DataKey {
    Admin,
    FacilityContract,
    EnforceKyc,
    JurisdictionCount,
    Wallet(Address),
    Jurisdiction(u32),
}

#[contract]
pub struct WalletRegistry;

#[contractimpl]
impl WalletRegistry {
    pub fn initialize(env: Env, admin: Address) {
        if env.storage().instance().has(&DataKey::Admin) {
            panic!("already initialized");
        }
        admin.require_auth();
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::EnforceKyc, &true);
        env.storage().instance().set(&DataKey::JurisdictionCount, &1u32);
        env.storage().persistent().set(&DataKey::Jurisdiction(UAE), &true);
    }

    pub fn register_wallet(
        env: Env,
        wallet: Address,
        user_id_hash: String,
        role: u32,
        jurisdiction_code: u32,
        investment_limit: i128,
    ) {
        admin(&env).require_auth();
        let record = WalletRecord {
            user_id_hash,
            role,
            kyc_approved: false,
            kyb_approved: false,
            jurisdiction_code,
            investment_limit,
            account_status: STATUS_ACTIVE,
            invested_amount: 0,
        };
        env.storage().persistent().set(&DataKey::Wallet(wallet.clone()), &record);
        env.events().publish((sym(&env, "WalletRegistered"), wallet), role);
    }

    pub fn set_kyc_status(env: Env, wallet: Address, approved: bool) {
        admin(&env).require_auth();
        let mut record = load(&env, &wallet);
        record.kyc_approved = approved;
        save(&env, &wallet, &record);
    }

    pub fn set_kyb_status(env: Env, wallet: Address, approved: bool) {
        admin(&env).require_auth();
        let mut record = load(&env, &wallet);
        record.kyb_approved = approved;
        save(&env, &wallet, &record);
    }

    pub fn set_investment_limit(env: Env, wallet: Address, limit: i128) {
        admin(&env).require_auth();
        let mut record = load(&env, &wallet);
        record.investment_limit = limit;
        save(&env, &wallet, &record);
    }

    pub fn suspend_wallet(env: Env, wallet: Address) {
        admin(&env).require_auth();
        let mut record = load(&env, &wallet);
        record.account_status = STATUS_SUSPENDED;
        save(&env, &wallet, &record);
    }

    pub fn restore_wallet(env: Env, wallet: Address) {
        admin(&env).require_auth();
        let mut record = load(&env, &wallet);
        record.account_status = STATUS_ACTIVE;
        save(&env, &wallet, &record);
    }

    pub fn set_facility_contract(env: Env, facility: Address) {
        admin(&env).require_auth();
        env.storage().instance().set(&DataKey::FacilityContract, &facility);
    }

    pub fn set_enforce_kyc(env: Env, enabled: bool) {
        admin(&env).require_auth();
        env.storage().instance().set(&DataKey::EnforceKyc, &enabled);
    }

    pub fn set_allowed_jurisdiction(env: Env, code: u32, allowed: bool) {
        admin(&env).require_auth();
        let current: bool = env.storage().persistent().get(&DataKey::Jurisdiction(code)).unwrap_or(false);
        let mut count: u32 = env.storage().instance().get(&DataKey::JurisdictionCount).unwrap_or(0);
        if allowed && !current {
            count = count.saturating_add(1);
        }
        if !allowed && current {
            count = count.saturating_sub(1);
        }
        env.storage().persistent().set(&DataKey::Jurisdiction(code), &allowed);
        env.storage().instance().set(&DataKey::JurisdictionCount, &count);
    }

    pub fn is_allowed_to_invest(env: Env, wallet: Address, amount: i128) -> bool {
        let Some(record) = env.storage().persistent().get::<_, WalletRecord>(&DataKey::Wallet(wallet)) else {
            return false;
        };
        if record.account_status != STATUS_ACTIVE || record.role != ROLE_INVESTOR || amount <= 0 {
            return false;
        }
        let enforce: bool = env.storage().instance().get(&DataKey::EnforceKyc).unwrap_or(true);
        if enforce && !record.kyc_approved {
            return false;
        }
        let count: u32 = env.storage().instance().get(&DataKey::JurisdictionCount).unwrap_or(0);
        if count > 0 {
            let allowed: bool = env.storage().persistent().get(&DataKey::Jurisdiction(record.jurisdiction_code)).unwrap_or(false);
            if !allowed {
                return false;
            }
        }
        record.invested_amount.saturating_add(amount) <= record.investment_limit
    }

    pub fn record_investment(env: Env, caller: Address, wallet: Address, amount: i128) {
        caller.require_auth();
        let expected: Address = env.storage().instance().get(&DataKey::FacilityContract).unwrap();
        if caller != expected {
            panic!("caller");
        }
        let mut record = load(&env, &wallet);
        record.invested_amount = record.invested_amount.saturating_add(amount);
        save(&env, &wallet, &record);
    }

    pub fn reduce_investment(env: Env, caller: Address, wallet: Address, amount: i128) {
        caller.require_auth();
        let expected: Address = env.storage().instance().get(&DataKey::FacilityContract).unwrap();
        if caller != expected {
            panic!("caller");
        }
        let mut record = load(&env, &wallet);
        record.invested_amount = record.invested_amount.saturating_sub(amount).max(0);
        save(&env, &wallet, &record);
    }

    pub fn kyc_approved(env: Env, wallet: Address) -> bool {
        load(&env, &wallet).kyc_approved
    }

    pub fn kyb_approved(env: Env, wallet: Address) -> bool {
        load(&env, &wallet).kyb_approved
    }
}

fn admin(env: &Env) -> Address {
    env.storage().instance().get(&DataKey::Admin).unwrap()
}

fn load(env: &Env, wallet: &Address) -> WalletRecord {
    env.storage().persistent().get(&DataKey::Wallet(wallet.clone())).unwrap()
}

fn save(env: &Env, wallet: &Address, record: &WalletRecord) {
    env.storage().persistent().set(&DataKey::Wallet(wallet.clone()), record);
}

fn sym(env: &Env, name: &str) -> soroban_sdk::Symbol {
    soroban_sdk::Symbol::new(env, name)
}

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::{testutils::Address as _, Env};

    #[test]
    fn rejects_unverified_and_accepts_kyc_investor() {
        let env = Env::default();
        env.mock_all_auths();
        let admin = Address::generate(&env);
        let id = env.register_contract(None, WalletRegistry);
        let client = WalletRegistryClient::new(&env, &id);
        client.initialize(&admin);
        let investor = Address::generate(&env);
        client.register_wallet(&investor, &soroban_sdk::String::from_str(&env, "hash"), &ROLE_INVESTOR, &784, &1_000_000_000);
        assert!(!client.is_allowed_to_invest(&investor, &100));
        client.set_kyc_status(&investor, &true);
        assert!(client.is_allowed_to_invest(&investor, &100));
        client.suspend_wallet(&investor);
        assert!(!client.is_allowed_to_invest(&investor, &100));
        client.restore_wallet(&investor);
        assert!(client.is_allowed_to_invest(&investor, &100));
    }

    fn registry() -> (Env, WalletRegistryClient<'static>, Address) {
        let env = Env::default();
        env.mock_all_auths();
        let admin = Address::generate(&env);
        let id = env.register_contract(None, WalletRegistry);
        let client = WalletRegistryClient::new(&env, &id);
        client.initialize(&admin);
        (env, client, admin)
    }

    #[test]
    fn unregistered_wallet_is_not_allowed() {
        let (env, client, _) = registry();
        assert!(!client.is_allowed_to_invest(&Address::generate(&env), &100));
    }

    #[test]
    fn investment_above_the_limit_is_rejected() {
        let (env, client, _) = registry();
        let investor = Address::generate(&env);
        client.register_wallet(&investor, &soroban_sdk::String::from_str(&env, "h"), &ROLE_INVESTOR, &784, &1_000);
        client.set_kyc_status(&investor, &true);
        assert!(client.is_allowed_to_invest(&investor, &1_000));
        assert!(!client.is_allowed_to_invest(&investor, &1_001));
    }

    #[test]
    fn blocked_jurisdiction_is_rejected() {
        let (env, client, _) = registry();
        let investor = Address::generate(&env);
        client.register_wallet(&investor, &soroban_sdk::String::from_str(&env, "h"), &ROLE_INVESTOR, &826, &1_000);
        client.set_kyc_status(&investor, &true);
        assert!(!client.is_allowed_to_invest(&investor, &100));
        client.set_allowed_jurisdiction(&826, &true);
        assert!(client.is_allowed_to_invest(&investor, &100));
    }

    #[test]
    fn an_sme_wallet_cannot_invest() {
        let (env, client, _) = registry();
        let sme = Address::generate(&env);
        client.register_wallet(&sme, &soroban_sdk::String::from_str(&env, "h"), &2, &784, &1_000);
        client.set_kyc_status(&sme, &true);
        assert!(!client.is_allowed_to_invest(&sme, &100));
    }
}
