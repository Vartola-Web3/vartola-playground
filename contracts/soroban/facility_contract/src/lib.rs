#![no_std]
use finance_math::{
    income_component, net_amount, participation_units, platform_fee, principal_component, reserve_amount,
    settlement_amount, share_of,
};
use soroban_sdk::{contract, contractclient, contractimpl, contracttype, token, Address, Env, String, Symbol, Vec};

pub const ST_APPROVED: u32 = 1;
pub const ST_FUNDING: u32 = 2;
pub const ST_FUNDED: u32 = 3;
pub const ST_RELEASE_READY: u32 = 4;
pub const ST_RELEASED: u32 = 5;
pub const ST_ACTIVE: u32 = 6;
pub const ST_LATE: u32 = 7;
pub const ST_DEFAULTED: u32 = 8;
pub const ST_RECOVERY: u32 = 9;
pub const ST_REPAID: u32 = 10;
pub const ST_CLOSED: u32 = 11;
pub const ST_GRACE: u32 = 12;
pub const ST_DEFAULT_NOTICE: u32 = 13;
pub const ST_REPOSSESSION: u32 = 14;
pub const ST_ASSET_SALE: u32 = 15;

#[contractclient(name = "RegistryClient")]
pub trait RegistryIface {
    fn is_allowed_to_invest(env: Env, wallet: Address, amount: i128) -> bool;
    fn record_investment(env: Env, caller: Address, wallet: Address, amount: i128);
    fn reduce_investment(env: Env, caller: Address, wallet: Address, amount: i128);
    fn kyb_approved(env: Env, wallet: Address) -> bool;
}

#[contracttype]
#[derive(Clone)]
pub struct Facility {
    pub borrower: Address,
    pub borrower_hash: String,
    pub asset_hash: String,
    pub finance_amount: i128,
    pub sme_contribution: i128,
    pub funding_target: i128,
    pub term_months: u32,
    pub payment_schedule_hash: String,
    pub supplier: Address,
    pub fee_bps: u32,
    pub reserve_bps: u32,
    pub status: u32,
    pub funded_amount: i128,
    pub principal_outstanding: i128,
    pub total_participation_units: i128,
}

#[contracttype]
#[derive(Clone)]
pub struct Participation {
    pub units: i128,
    pub contributed: i128,
    pub pending_amount: i128,
    pub pending_units: i128,
    pub principal_received: i128,
    pub income_received: i128,
}

#[contracttype]
#[derive(Clone)]
pub struct Attestation {
    pub document_hash: String,
    pub document_type: String,
    pub entity_hash: String,
    pub verification_status: u32,
    pub attested_at: u64,
}

#[contracttype]
#[derive(Clone)]
pub struct Passport {
    pub serial_hash: String,
    pub facility_id: String,
    pub insurance_status: u32,
    pub registration_status: u32,
    pub delivery_status: u32,
    pub recovery_status: u32,
}

#[contracttype]
enum DataKey {
    Admin,
    Treasury,
    Pauser,
    Token,
    Registry,
    UnitValue,
    Paused,
    EnforceKyb,
    Facility(String),
    Position(String, Address),
    Investors(String),
    Op(String),
    Document(String),
    Passport(String),
}

#[contract]
pub struct FacilityContract;

#[contractimpl]
impl FacilityContract {
    pub fn initialize(
        env: Env,
        admin: Address,
        treasury: Address,
        pauser: Address,
        token: Address,
        registry: Address,
        unit_value: i128,
    ) {
        if env.storage().instance().has(&DataKey::Admin) {
            panic!("already initialized");
        }
        admin.require_auth();
        if unit_value <= 0 {
            panic!("unit");
        }
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::Treasury, &treasury);
        env.storage().instance().set(&DataKey::Pauser, &pauser);
        env.storage().instance().set(&DataKey::Token, &token);
        env.storage().instance().set(&DataKey::Registry, &registry);
        env.storage().instance().set(&DataKey::UnitValue, &unit_value);
        env.storage().instance().set(&DataKey::Paused, &false);
        env.storage().instance().set(&DataKey::EnforceKyb, &true);
    }

    pub fn set_admin(env: Env, admin: Address) {
        require_admin(&env);
        env.storage().instance().set(&DataKey::Admin, &admin);
    }

    pub fn set_treasury(env: Env, treasury: Address) {
        require_admin(&env);
        env.storage().instance().set(&DataKey::Treasury, &treasury);
    }

    pub fn set_pauser(env: Env, pauser: Address) {
        require_admin(&env);
        env.storage().instance().set(&DataKey::Pauser, &pauser);
    }

    pub fn pause(env: Env) {
        pauser(&env).require_auth();
        env.storage().instance().set(&DataKey::Paused, &true);
    }

    pub fn unpause(env: Env) {
        require_admin(&env);
        env.storage().instance().set(&DataKey::Paused, &false);
    }

    pub fn set_enforce_kyb(env: Env, enabled: bool) {
        require_admin(&env);
        env.storage().instance().set(&DataKey::EnforceKyb, &enabled);
    }

    pub fn create_facility(
        env: Env,
        facility_id: String,
        borrower: Address,
        borrower_hash: String,
        asset_hash: String,
        finance_amount: i128,
        sme_contribution: i128,
        term_months: u32,
        payment_schedule_hash: String,
        supplier: Address,
        rates: u32,
    ) {
        require_admin(&env);
        require_open(&env);
        let fee_bps = rates & 0xffff;
        let reserve_bps = rates >> 16;
        let unit = unit_value(&env);
        if finance_amount <= 0 || finance_amount % unit != 0 || term_months == 0 {
            panic!("terms");
        }
        if env.storage().persistent().has(&DataKey::Facility(facility_id.clone())) {
            panic!("exists");
        }
        let facility = Facility {
            borrower,
            borrower_hash,
            asset_hash,
            finance_amount,
            sme_contribution,
            funding_target: finance_amount,
            term_months,
            payment_schedule_hash,
            supplier,
            fee_bps,
            reserve_bps,
            status: ST_APPROVED,
            funded_amount: 0,
            principal_outstanding: finance_amount,
            total_participation_units: 0,
        };
        env.storage().persistent().set(&DataKey::Facility(facility_id.clone()), &facility);
        emit(&env, "FacilityCreated", &facility_id);
    }

    pub fn subscribe(env: Env, investor: Address, facility_id: String, amount: i128) -> i128 {
        investor.require_auth();
        require_open(&env);
        let unit = unit_value(&env);
        if amount <= 0 || amount % unit != 0 {
            panic!("amount");
        }
        let units = participation_units(amount, unit);
        let registry = registry(&env);
        if !RegistryClient::new(&env, &registry).is_allowed_to_invest(&investor, &amount) {
            panic!("registry");
        }
        let facility = load(&env, &facility_id);
        if facility.status != ST_APPROVED && facility.status != ST_FUNDING {
            panic!("status");
        }
        let mut position = position_or_empty(&env, &facility_id, &investor);
        if facility.funded_amount + position.pending_amount + amount > facility.funding_target {
            panic!("capacity");
        }
        position.pending_amount += amount;
        position.pending_units += units;
        save_position(&env, &facility_id, &investor, &position);
        let _ = facility;
        emit(&env, "InvestmentSubscribed", &facility_id);
        units
    }

    pub fn reserve(env: Env, investor: Address, facility_id: String) -> i128 {
        investor.require_auth();
        require_open(&env);
        let mut position = load_position(&env, &facility_id, &investor);
        if position.pending_amount <= 0 {
            panic!("nothing to reserve");
        }
        let amount = position.pending_amount;
        let units = position.pending_units;
        let mut facility = load(&env, &facility_id);
        token_client(&env).transfer(&investor, &env.current_contract_address(), &amount);
        position.contributed += amount;
        position.units += units;
        position.pending_amount = 0;
        position.pending_units = 0;
        facility.funded_amount += amount;
        facility.total_participation_units += units;
        if facility.status == ST_APPROVED {
            facility.status = ST_FUNDING;
        }
        if facility.funded_amount >= facility.funding_target {
            facility.status = ST_FUNDED;
            emit(&env, "FacilityFunded", &facility_id);
        }
        save_position(&env, &facility_id, &investor, &position);
        save(&env, &facility_id, &facility);
        remember_investor(&env, &facility_id, &investor);
        RegistryClient::new(&env, &registry(&env)).record_investment(&env.current_contract_address(), &investor, &amount);
        amount
    }

    pub fn cancel_subscription(env: Env, investor: Address, facility_id: String) {
        investor.require_auth();
        let mut position = load_position(&env, &facility_id, &investor);
        position.pending_amount = 0;
        position.pending_units = 0;
        save_position(&env, &facility_id, &investor, &position);
    }

    pub fn refund(env: Env, investor: Address, facility_id: String) -> i128 {
        investor.require_auth();
        require_open(&env);
        let mut facility = load(&env, &facility_id);
        if facility.status != ST_FUNDING && facility.status != ST_APPROVED {
            panic!("status");
        }
        let mut position = load_position(&env, &facility_id, &investor);
        let amount = position.contributed;
        if amount <= 0 {
            panic!("empty");
        }
        token_client(&env).transfer(&env.current_contract_address(), &investor, &amount);
        facility.funded_amount -= amount;
        facility.total_participation_units -= position.units;
        if facility.funded_amount == 0 {
            facility.status = ST_APPROVED;
        }
        position.contributed = 0;
        position.units = 0;
        save_position(&env, &facility_id, &investor, &position);
        save(&env, &facility_id, &facility);
        RegistryClient::new(&env, &registry(&env)).reduce_investment(&env.current_contract_address(), &investor, &amount);
        amount
    }

    pub fn set_supplier(env: Env, facility_id: String, supplier: Address) {
        require_admin(&env);
        let mut facility = load(&env, &facility_id);
        if facility.status == ST_RELEASED || facility.status == ST_ACTIVE || facility.status == ST_CLOSED {
            panic!("status");
        }
        facility.supplier = supplier;
        save(&env, &facility_id, &facility);
    }

    pub fn mark_funded(env: Env, facility_id: String) {
        require_admin(&env);
        let mut facility = load(&env, &facility_id);
        if facility.funded_amount < facility.funding_target {
            panic!("short");
        }
        facility.status = ST_FUNDED;
        save(&env, &facility_id, &facility);
        emit(&env, "FacilityFunded", &facility_id);
    }

    pub fn authorize_release(env: Env, facility_id: String) {
        require_admin(&env);
        require_open(&env);
        let mut facility = load(&env, &facility_id);
        if facility.status != ST_FUNDED {
            panic!("status");
        }
        facility.status = ST_RELEASE_READY;
        save(&env, &facility_id, &facility);
        emit(&env, "ReleaseAuthorized", &facility_id);
    }

    pub fn release_to_supplier(env: Env, facility_id: String) -> i128 {
        require_admin(&env);
        require_open(&env);
        let mut facility = load(&env, &facility_id);
        if facility.status != ST_RELEASE_READY {
            panic!("status");
        }
        let amount = facility.funded_amount;
        token_client(&env).transfer(&env.current_contract_address(), &facility.supplier, &amount);
        facility.status = ST_RELEASED;
        save(&env, &facility_id, &facility);
        emit(&env, "FundsReleased", &facility_id);
        amount
    }

    pub fn activate_facility(env: Env, facility_id: String) {
        require_admin(&env);
        require_open(&env);
        let mut facility = load(&env, &facility_id);
        if facility.status != ST_RELEASED {
            panic!("status");
        }
        let enforce: bool = env.storage().instance().get(&DataKey::EnforceKyb).unwrap_or(true);
        if enforce && !RegistryClient::new(&env, &registry(&env)).kyb_approved(&facility.borrower) {
            panic!("kyb");
        }
        facility.status = ST_ACTIVE;
        save(&env, &facility_id, &facility);
        emit(&env, "FacilityActivated", &facility_id);
    }

    pub fn calculate_platform_fee(_env: Env, gross: i128, fee_bps: u32) -> i128 {
        platform_fee(gross, fee_bps)
    }

    pub fn calculate_reserve(_env: Env, gross: i128, reserve_bps: u32) -> i128 {
        reserve_amount(gross, reserve_bps)
    }

    pub fn calculate_principal(
        _env: Env,
        finance_amount: i128,
        term_months: u32,
        payment_index: u32,
        remaining: i128,
        net: i128,
    ) -> i128 {
        principal_component(finance_amount, term_months, payment_index, remaining, net)
    }

    pub fn calculate_income(_env: Env, net: i128, principal: i128) -> i128 {
        income_component(net, principal)
    }

    pub fn record_repayment(
        env: Env,
        payer: Address,
        facility_id: String,
        gross: i128,
        payment_index: u32,
        idempotency: String,
    ) -> Vec<i128> {
        payer.require_auth();
        require_open(&env);
        consume_op(&env, &idempotency);
        let mut facility = load(&env, &facility_id);
        if facility.status != ST_ACTIVE && facility.status != ST_LATE && facility.status != ST_GRACE {
            panic!("status");
        }
        if gross <= 0 {
            panic!("amount");
        }
        token_client(&env).transfer(&payer, &env.current_contract_address(), &gross);
        let fee = platform_fee(gross, facility.fee_bps);
        let reserve = reserve_amount(gross, facility.reserve_bps);
        let net = net_amount(gross, facility.fee_bps, facility.reserve_bps);
        let mut principal = principal_component(
            facility.finance_amount,
            facility.term_months,
            payment_index,
            facility.principal_outstanding,
            net,
        );
        if principal > facility.principal_outstanding {
            principal = facility.principal_outstanding;
        }
        let income = income_component(net, principal);
        let treasury = treasury(&env);
        let token = token_client(&env);
        let here = env.current_contract_address();
        if fee > 0 {
            token.transfer(&here, &treasury, &fee);
        }
        if reserve > 0 {
            token.transfer(&here, &treasury, &reserve);
        }
        pay_investors(&env, &facility_id, principal, income);
        facility.principal_outstanding -= principal;
        if facility.principal_outstanding == 0 {
            facility.status = ST_CLOSED;
            emit(&env, "FacilityClosed", &facility_id);
        }
        save(&env, &facility_id, &facility);
        emit(&env, "RepaymentRecorded", &facility_id);
        emit(&env, "DistributionExecuted", &facility_id);
        Vec::from_array(&env, [principal, income, fee, reserve])
    }

    pub fn quote_settlement(env: Env, facility_id: String, accrued_income: i128, fee: i128, rebate: i128) -> i128 {
        let facility = load(&env, &facility_id);
        if accrued_income < 0 || fee < 0 || rebate < 0 || rebate > accrued_income {
            panic!("quote");
        }
        settlement_amount(facility.principal_outstanding, accrued_income, fee, rebate)
    }

    pub fn settle(
        env: Env,
        payer: Address,
        facility_id: String,
        accrued_income: i128,
        fee: i128,
        rebate: i128,
        idempotency: String,
    ) -> i128 {
        payer.require_auth();
        require_open(&env);
        consume_op(&env, &idempotency);
        let mut facility = load(&env, &facility_id);
        if facility.status != ST_ACTIVE && facility.status != ST_LATE && facility.status != ST_GRACE {
            panic!("status");
        }
        if accrued_income < 0 || fee < 0 || rebate < 0 || rebate > accrued_income {
            panic!("quote");
        }
        let due = settlement_amount(facility.principal_outstanding, accrued_income, fee, rebate);
        token_client(&env).transfer(&payer, &env.current_contract_address(), &due);
        let treasury = treasury(&env);
        if fee > 0 {
            token_client(&env).transfer(&env.current_contract_address(), &treasury, &fee);
        }
        let income = accrued_income - rebate;
        let principal = facility.principal_outstanding;
        pay_investors(&env, &facility_id, principal, income);
        facility.principal_outstanding = 0;
        facility.status = ST_CLOSED;
        save(&env, &facility_id, &facility);
        emit(&env, "FacilityClosed", &facility_id);
        due
    }

    pub fn advance_status(env: Env, facility_id: String, next: u32) {
        require_admin(&env);
        let mut facility = load(&env, &facility_id);
        if !transition_allowed(facility.status, next) {
            panic!("transition");
        }
        facility.status = next;
        save(&env, &facility_id, &facility);
        let name = match next {
            ST_LATE => "FacilityLate",
            ST_DEFAULTED => "FacilityDefaulted",
            _ => "FacilityStatus",
        };
        emit(&env, name, &facility_id);
    }

    pub fn record_recovery(
        env: Env,
        payer: Address,
        facility_id: String,
        sale_proceeds: i128,
        recovery_costs: i128,
        idempotency: String,
    ) -> i128 {
        require_admin(&env);
        payer.require_auth();
        require_open(&env);
        consume_op(&env, &idempotency);
        let mut facility = load(&env, &facility_id);
        if facility.status != ST_DEFAULTED
            && facility.status != ST_RECOVERY
            && facility.status != ST_REPOSSESSION
            && facility.status != ST_ASSET_SALE
        {
            panic!("status");
        }
        if sale_proceeds < 0 || recovery_costs < 0 || recovery_costs > sale_proceeds {
            panic!("proceeds");
        }
        token_client(&env).transfer(&payer, &env.current_contract_address(), &sale_proceeds);
        let treasury = treasury(&env);
        if recovery_costs > 0 {
            token_client(&env).transfer(&env.current_contract_address(), &treasury, &recovery_costs);
        }
        let net = sale_proceeds - recovery_costs;
        let principal = net.min(facility.principal_outstanding);
        let residual = net - principal;
        pay_investors(&env, &facility_id, principal, 0);
        if residual > 0 {
            token_client(&env).transfer(&env.current_contract_address(), &treasury, &residual);
        }
        facility.principal_outstanding -= principal;
        facility.status = ST_CLOSED;
        save(&env, &facility_id, &facility);
        emit(&env, "RecoveryRecorded", &facility_id);
        emit(&env, "FacilityClosed", &facility_id);
        principal
    }

    pub fn attest_document(
        env: Env,
        document_hash: String,
        document_type: String,
        entity_hash: String,
        verification_status: u32,
    ) {
        require_admin(&env);
        let row = Attestation {
            document_hash: document_hash.clone(),
            document_type,
            entity_hash,
            verification_status,
            attested_at: env.ledger().timestamp(),
        };
        env.storage().persistent().set(&DataKey::Document(document_hash), &row);
    }

    pub fn upsert_passport(
        env: Env,
        asset_id: String,
        serial_hash: String,
        facility_id: String,
        insurance_status: u32,
        registration_status: u32,
        delivery_status: u32,
        recovery_status: u32,
    ) {
        require_admin(&env);
        let row = Passport { serial_hash, facility_id, insurance_status, registration_status, delivery_status, recovery_status };
        env.storage().persistent().set(&DataKey::Passport(asset_id), &row);
    }

    pub fn facility_status(env: Env, facility_id: String) -> u32 {
        load(&env, &facility_id).status
    }

    pub fn funded_amount(env: Env, facility_id: String) -> i128 {
        load(&env, &facility_id).funded_amount
    }

    pub fn issued_units(env: Env, facility_id: String) -> i128 {
        load(&env, &facility_id).total_participation_units
    }

    pub fn principal_outstanding(env: Env, facility_id: String) -> i128 {
        load(&env, &facility_id).principal_outstanding
    }

    pub fn position_units(env: Env, facility_id: String, investor: Address) -> i128 {
        load_position(&env, &facility_id, &investor).units
    }
}

fn transition_allowed(current: u32, next: u32) -> bool {
    matches!(
        (current, next),
        (ST_ACTIVE, ST_GRACE)
            | (ST_ACTIVE, ST_LATE)
            | (ST_GRACE, ST_LATE)
            | (ST_GRACE, ST_ACTIVE)
            | (ST_LATE, ST_DEFAULT_NOTICE)
            | (ST_LATE, ST_ACTIVE)
            | (ST_DEFAULT_NOTICE, ST_DEFAULTED)
            | (ST_DEFAULTED, ST_REPOSSESSION)
            | (ST_DEFAULTED, ST_RECOVERY)
            | (ST_REPOSSESSION, ST_ASSET_SALE)
            | (ST_ASSET_SALE, ST_RECOVERY)
            | (ST_RECOVERY, ST_CLOSED)
    )
}

fn pay_investors(env: &Env, facility_id: &String, principal: i128, income: i128) {
    let list: Vec<Address> = env.storage().persistent().get(&DataKey::Investors(facility_id.clone())).unwrap_or(Vec::new(env));
    let total = load(env, facility_id).total_participation_units;
    let len = list.len();
    if len == 0 || (principal <= 0 && income <= 0) {
        return;
    }
    let token = token_client(env);
    let here = env.current_contract_address();
    let mut paid_p = 0i128;
    let mut paid_i = 0i128;
    let mut index = 0u32;
    for investor in list.iter() {
        let mut position = load_position(env, facility_id, &investor);
        let last = index + 1 == len;
        let p = if last { principal - paid_p } else { share_of(principal, position.units, total) };
        let i = if last { income - paid_i } else { share_of(income, position.units, total) };
        let amount = p + i;
        if amount > 0 {
            token.transfer(&here, &investor, &amount);
        }
        position.principal_received += p;
        position.income_received += i;
        save_position(env, facility_id, &investor, &position);
        paid_p += p;
        paid_i += i;
        index += 1;
    }
}

fn remember_investor(env: &Env, facility_id: &String, investor: &Address) {
    let key = DataKey::Investors(facility_id.clone());
    let mut list: Vec<Address> = env.storage().persistent().get(&key).unwrap_or(Vec::new(env));
    for item in list.iter() {
        if item == *investor {
            return;
        }
    }
    list.push_back(investor.clone());
    env.storage().persistent().set(&key, &list);
}

fn consume_op(env: &Env, key: &String) {
    let storage_key = DataKey::Op(key.clone());
    if env.storage().persistent().has(&storage_key) {
        panic!("duplicate");
    }
    env.storage().persistent().set(&storage_key, &true);
}

fn emit(env: &Env, name: &str, facility_id: &String) {
    env.events().publish((Symbol::new(env, name), facility_id.clone()), facility_id.clone());
}

fn require_admin(env: &Env) {
    admin(env).require_auth();
}

fn require_open(env: &Env) {
    let paused: bool = env.storage().instance().get(&DataKey::Paused).unwrap_or(false);
    if paused {
        panic!("paused");
    }
}

fn admin(env: &Env) -> Address {
    env.storage().instance().get(&DataKey::Admin).unwrap()
}

fn treasury(env: &Env) -> Address {
    env.storage().instance().get(&DataKey::Treasury).unwrap()
}

fn pauser(env: &Env) -> Address {
    env.storage().instance().get(&DataKey::Pauser).unwrap()
}

fn registry(env: &Env) -> Address {
    env.storage().instance().get(&DataKey::Registry).unwrap()
}

fn unit_value(env: &Env) -> i128 {
    env.storage().instance().get(&DataKey::UnitValue).unwrap()
}

fn token_client(env: &Env) -> token::Client<'_> {
    let id: Address = env.storage().instance().get(&DataKey::Token).unwrap();
    token::Client::new(env, &id)
}

fn load(env: &Env, facility_id: &String) -> Facility {
    env.storage().persistent().get(&DataKey::Facility(facility_id.clone())).unwrap()
}

fn save(env: &Env, facility_id: &String, facility: &Facility) {
    env.storage().persistent().set(&DataKey::Facility(facility_id.clone()), facility);
}

fn position_or_empty(env: &Env, facility_id: &String, investor: &Address) -> Participation {
    env.storage()
        .persistent()
        .get(&DataKey::Position(facility_id.clone(), investor.clone()))
        .unwrap_or(Participation {
            units: 0,
            contributed: 0,
            pending_amount: 0,
            pending_units: 0,
            principal_received: 0,
            income_received: 0,
        })
}

fn load_position(env: &Env, facility_id: &String, investor: &Address) -> Participation {
    env.storage().persistent().get(&DataKey::Position(facility_id.clone(), investor.clone())).unwrap()
}

fn save_position(env: &Env, facility_id: &String, investor: &Address, position: &Participation) {
    env.storage().persistent().set(&DataKey::Position(facility_id.clone(), investor.clone()), position);
}

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::{testutils::Address as _, token::StellarAssetClient, Env};

    #[contract]
    pub struct MockRegistry;

    #[contractimpl]
    impl MockRegistry {
        pub fn is_allowed_to_invest(_env: Env, _wallet: Address, _amount: i128) -> bool {
            true
        }
        pub fn record_investment(_env: Env, _caller: Address, _wallet: Address, _amount: i128) {}
        pub fn reduce_investment(_env: Env, _caller: Address, _wallet: Address, _amount: i128) {}
        pub fn kyb_approved(_env: Env, _wallet: Address) -> bool {
            true
        }
    }

    fn setup() -> (Env, Address, FacilityContractClient<'static>, Address, Address, Address) {
        let env = Env::default();
        env.mock_all_auths();
        let admin = Address::generate(&env);
        let treasury = Address::generate(&env);
        let investor = Address::generate(&env);
        let borrower = Address::generate(&env);
        let supplier = Address::generate(&env);
        let token_admin = Address::generate(&env);
        let token_id = env.register_stellar_asset_contract(token_admin);
        let registry_id = env.register_contract(None, MockRegistry);
        let contract_id = env.register_contract(None, FacilityContract);
        let client = FacilityContractClient::new(&env, &contract_id);
        client.initialize(&admin, &treasury, &admin, &token_id, &registry_id, &1_000_000_000);
        let asset = StellarAssetClient::new(&env, &token_id);
        asset.mint(&investor, &50_000_000_000);
        asset.mint(&borrower, &20_000_000_000);
        (env, contract_id, client, investor, borrower, supplier)
    }

    #[test]
    fn subscribe_reserves_units_and_funds_escrow() {
        let (env, _, client, investor, borrower, supplier) = setup();
        let id = String::from_str(&env, "fac-1");
        client.create_facility(
            &id,
            &borrower,
            &String::from_str(&env, "borrower"),
            &String::from_str(&env, "asset"),
            &10_000_000_000,
            &0,
            &4,
            &String::from_str(&env, "schedule"),
            &supplier,
            &0,
        );
        let units = client.subscribe(&investor, &id, &10_000_000_000);
        assert_eq!(units, 10);
        client.reserve(&investor, &id);
        assert_eq!(client.facility_status(&id), ST_FUNDED);
        assert_eq!(client.issued_units(&id), 10);
        assert_eq!(client.position_units(&id, &investor), 10);
    }
}
