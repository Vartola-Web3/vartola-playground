#![no_std]
// Vartola facility contract, version 2 (Testnet).
//
// One contract holds the financial state of every facility: escrow, participation units, release conditions,
// the repayment waterfall, distributions, settlement, recovery, and attestations. Money moves only as
// investor -> escrow -> approved supplier, and back to investors through the distribution engine.
// Privileged actions are split across roles (administrator, pauser, treasury, underwriter, operations,
// compliance). Until a role wallet is set it falls back to the administrator, which is how a single Testnet
// key works. On Mainnet the administrator would be a multisig account.
use finance_math::{
    calculate_waterfall, income_component, participation_units, platform_fee, principal_component, recovery_split,
    reserve_amount, settlement_split, share_of,
};
use soroban_sdk::{contract, contractclient, contractimpl, contracttype, token, Address, BytesN, Env, String, Symbol, Vec};

// Facility lifecycle states.
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

// Escrow states. Every transition emits an event.
pub const ES_OPEN: u32 = 1;
pub const ES_PARTIAL: u32 = 2;
pub const ES_FULL: u32 = 3;
pub const ES_LOCKED: u32 = 4;
pub const ES_AUTHORIZED: u32 = 5;
pub const ES_RELEASED: u32 = 6;
pub const ES_REFUNDED: u32 = 7;
pub const ES_CLOSED: u32 = 8;

// Roles. ADMIN is the fallback for every role that has no wallet of its own.
pub const ROLE_ADMIN: u32 = 0;
pub const ROLE_PAUSER: u32 = 1;
pub const ROLE_TREASURY: u32 = 2;
pub const ROLE_UNDERWRITER: u32 = 3;
pub const ROLE_OPERATIONS: u32 = 4;
pub const ROLE_COMPLIANCE: u32 = 5;

// Release conditions. Condition 0 (funding complete) is set by the contract itself; the others are attested.
pub const COND_FUNDING: u32 = 0;
pub const COND_SME_CONTRIBUTION: u32 = 1;
pub const COND_SUPPLIER: u32 = 2;
pub const COND_INVOICE: u32 = 3;
pub const COND_AGREEMENT: u32 = 4;
pub const COND_INSURANCE: u32 = 5;
pub const COND_ASSET: u32 = 6;
pub const COND_COMPLIANCE: u32 = 7;
pub const COND_FINAL_APPROVAL: u32 = 8;
pub const ALL_CONDITIONS: u32 = (1 << 9) - 1;

// Position statuses.
pub const POS_RESERVED: u32 = 1;
pub const POS_FUNDED: u32 = 2;
pub const POS_ACTIVE: u32 = 3;
pub const POS_PARTIALLY_REPAID: u32 = 4;
pub const POS_SETTLED: u32 = 5;
pub const POS_RECOVERED: u32 = 6;
pub const POS_CLOSED: u32 = 7;

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
    pub unit_size: i128,
    pub units_target: i128,
    pub term_months: u32,
    pub payment_frequency_months: u32,
    pub payment_schedule_hash: String,
    pub supplier: Address,
    pub fee_bps: u32,
    pub reserve_bps: u32,
    pub status: u32,
    pub escrow_state: u32,
    pub funded_amount: i128,
    pub total_participation_units: i128,
    pub principal_outstanding: i128,
    pub principal_repaid: i128,
    pub income_paid: i128,
    pub fees_paid: i128,
    pub recovery_proceeds: i128,
    pub conditions_mask: u32,
    pub released: bool,
    pub settled: bool,
    pub terms_version: u32,
    pub version: u32,
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
    pub recovery_received: i128,
}

// Read model of one investor position. Positions are not transferable.
#[contracttype]
#[derive(Clone)]
pub struct PositionView {
    pub facility_id: String,
    pub wallet: Address,
    pub units: i128,
    pub committed: i128,
    pub deployed: i128,
    pub principal_returned: i128,
    pub income_received: i128,
    pub recovery_received: i128,
    pub outstanding_exposure: i128,
    pub status: u32,
}

#[contracttype]
#[derive(Clone)]
pub struct ConditionAttestation {
    pub evidence_hash: String,
    pub approver: Address,
    pub role: u32,
    pub attested_at: u64,
}

#[contracttype]
#[derive(Clone)]
pub struct RiskAttestation {
    pub input_hash: String,
    pub model_version: String,
    pub score: u32,
    pub grade: u32,
    pub attester: Address,
    pub attested_at: u64,
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
    pub sale_status: u32,
    pub activated: u32,
    pub delivery_date: u64,
}

// Economic terms of a facility. fee_bps and reserve_bps are facility parameters, not constants.
#[contracttype]
#[derive(Clone)]
pub struct Terms {
    pub term_months: u32,
    pub payment_frequency_months: u32,
    pub fee_bps: u32,
    pub reserve_bps: u32,
}

#[contracttype]
#[derive(Clone)]
pub struct PendingUpgrade {
    pub wasm_hash: BytesN<32>,
    pub ready_at: u64,
}

#[contracttype]
enum DataKey {
    Admin,
    PendingAdmin,
    Treasury,
    Pauser,
    Role(u32),
    Token,
    Registry,
    UnitValue,
    Paused,
    EnforceKyb,
    ReleaseLimit,
    Released(u64),
    Version,
    UpgradeDelay,
    PendingUpgrade,
    Facility(String),
    Position(String, Address),
    Investors(String),
    Condition(String, u32),
    Risk(String),
    Quote(String),
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
        env.storage().instance().set(&DataKey::ReleaseLimit, &0i128);
        env.storage().instance().set(&DataKey::Version, &2u32);
        env.storage().instance().set(&DataKey::UpgradeDelay, &0u64);
    }

    // ---- governance: roles, admin rotation, limits, pause, upgrade -------------------------------------------

    // Sets the wallet for a role. Pauser and treasury are stored where the contract already reads them.
    pub fn set_role(env: Env, role: u32, wallet: Address) {
        require_admin(&env);
        match role {
            ROLE_ADMIN => panic!("use propose_admin"),
            ROLE_PAUSER => env.storage().instance().set(&DataKey::Pauser, &wallet),
            ROLE_TREASURY => env.storage().instance().set(&DataKey::Treasury, &wallet),
            ROLE_UNDERWRITER | ROLE_OPERATIONS | ROLE_COMPLIANCE => env.storage().instance().set(&DataKey::Role(role), &wallet),
            _ => panic!("role"),
        }
        emit_global(&env, "RoleChanged", role as i128);
    }

    // Removes a role wallet. The role falls back to the administrator.
    pub fn revoke_role(env: Env, role: u32) {
        require_admin(&env);
        let fallback = admin(&env);
        match role {
            ROLE_PAUSER => env.storage().instance().set(&DataKey::Pauser, &fallback),
            ROLE_TREASURY => env.storage().instance().set(&DataKey::Treasury, &fallback),
            ROLE_UNDERWRITER | ROLE_OPERATIONS | ROLE_COMPLIANCE => env.storage().instance().remove(&DataKey::Role(role)),
            _ => panic!("role"),
        }
        emit_global(&env, "RoleRevoked", role as i128);
    }

    pub fn role_address(env: Env, role: u32) -> Address {
        role_address(&env, role)
    }

    // Two-step rotation: the new administrator must accept, so a typo cannot lock the contract.
    pub fn propose_admin(env: Env, next: Address) {
        require_admin(&env);
        env.storage().instance().set(&DataKey::PendingAdmin, &next);
        emit_global(&env, "AdminProposed", 0);
    }

    pub fn accept_admin(env: Env) {
        let next: Address = env.storage().instance().get(&DataKey::PendingAdmin).unwrap_or_else(|| panic!("no proposal"));
        next.require_auth();
        env.storage().instance().set(&DataKey::Admin, &next);
        env.storage().instance().remove(&DataKey::PendingAdmin);
        emit_global(&env, "AdminChanged", 0);
    }

    // Maximum released to suppliers per day. 0 means no limit.
    pub fn set_release_limit(env: Env, per_day: i128) {
        require_admin(&env);
        if per_day < 0 {
            panic!("limit");
        }
        env.storage().instance().set(&DataKey::ReleaseLimit, &per_day);
        emit_global(&env, "ReleaseLimitSet", per_day);
    }

    pub fn pause(env: Env) {
        pauser(&env).require_auth();
        env.storage().instance().set(&DataKey::Paused, &true);
        emit_global(&env, "Paused", 1);
    }

    pub fn unpause(env: Env) {
        require_admin(&env);
        env.storage().instance().set(&DataKey::Paused, &false);
        emit_global(&env, "Unpaused", 0);
    }

    pub fn set_enforce_kyb(env: Env, enabled: bool) {
        require_admin(&env);
        env.storage().instance().set(&DataKey::EnforceKyb, &enabled);
    }

    pub fn contract_version(env: Env) -> u32 {
        env.storage().instance().get(&DataKey::Version).unwrap_or(1)
    }

    pub fn set_upgrade_delay(env: Env, seconds: u64) {
        require_admin(&env);
        env.storage().instance().set(&DataKey::UpgradeDelay, &seconds);
    }

    // Upgrade governance: schedule, wait for the delay, then execute. Both steps need the administrator.
    pub fn schedule_upgrade(env: Env, wasm_hash: BytesN<32>) {
        require_admin(&env);
        let delay: u64 = env.storage().instance().get(&DataKey::UpgradeDelay).unwrap_or(0);
        let pending = PendingUpgrade { wasm_hash, ready_at: env.ledger().timestamp() + delay };
        env.storage().instance().set(&DataKey::PendingUpgrade, &pending);
        emit_global(&env, "UpgradeScheduled", pending.ready_at as i128);
    }

    pub fn cancel_upgrade(env: Env) {
        require_admin(&env);
        env.storage().instance().remove(&DataKey::PendingUpgrade);
        emit_global(&env, "UpgradeCancelled", 0);
    }

    pub fn execute_upgrade(env: Env) {
        require_admin(&env);
        let pending: PendingUpgrade = env.storage().instance().get(&DataKey::PendingUpgrade).unwrap_or_else(|| panic!("no upgrade"));
        if env.ledger().timestamp() < pending.ready_at {
            panic!("timelock");
        }
        env.deployer().update_current_contract_wasm(pending.wasm_hash);
        let version: u32 = env.storage().instance().get(&DataKey::Version).unwrap_or(1);
        env.storage().instance().set(&DataKey::Version, &(version + 1));
        env.storage().instance().remove(&DataKey::PendingUpgrade);
        emit_global(&env, "ContractUpgraded", (version + 1) as i128);
    }

    // ---- facility, funding and escrow ------------------------------------------------------------------------

    pub fn create_facility(
        env: Env,
        facility_id: String,
        borrower: Address,
        borrower_hash: String,
        asset_hash: String,
        finance_amount: i128,
        sme_contribution: i128,
        payment_schedule_hash: String,
        supplier: Address,
        terms: Terms,
    ) {
        require_role(&env, ROLE_UNDERWRITER);
        require_open(&env);
        let unit = unit_value(&env);
        if finance_amount <= 0 || finance_amount % unit != 0 || terms.term_months == 0 || terms.payment_frequency_months == 0 || terms.fee_bps > 10_000 || terms.reserve_bps > 10_000 {
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
            unit_size: unit,
            units_target: finance_amount / unit,
            term_months: terms.term_months,
            payment_frequency_months: terms.payment_frequency_months,
            payment_schedule_hash,
            supplier,
            fee_bps: terms.fee_bps,
            reserve_bps: terms.reserve_bps,
            status: ST_APPROVED,
            escrow_state: ES_OPEN,
            funded_amount: 0,
            total_participation_units: 0,
            principal_outstanding: finance_amount,
            principal_repaid: 0,
            income_paid: 0,
            fees_paid: 0,
            recovery_proceeds: 0,
            conditions_mask: 0,
            released: false,
            settled: false,
            terms_version: 1,
            version: 0,
        };
        save(&env, &facility_id, &facility);
        emit(&env, "FacilityCreated", &facility_id, &[finance_amount, unit, terms.term_months as i128]);
        emit(&env, "EscrowOpened", &facility_id, &[ES_OPEN as i128]);
    }

    // Records the intent to invest. The registry decides whether the wallet may participate.
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
        if facility.escrow_state != ES_OPEN && facility.escrow_state != ES_PARTIAL {
            panic!("escrow");
        }
        let mut position = position_or_empty(&env, &facility_id, &investor);
        if facility.funded_amount + position.pending_amount + amount > facility.funding_target {
            panic!("capacity");
        }
        position.pending_amount += amount;
        position.pending_units += units;
        save_position(&env, &facility_id, &investor, &position);
        emit(&env, "InvestmentSubscribed", &facility_id, &[amount, units]);
        units
    }

    // Moves the investor's VTAED into the facility escrow and issues the Participation Units.
    pub fn reserve(env: Env, investor: Address, facility_id: String) -> i128 {
        investor.require_auth();
        require_open(&env);
        let mut position = load_position(&env, &facility_id, &investor);
        if position.pending_amount <= 0 {
            panic!("nothing to reserve");
        }
        let mut facility = load(&env, &facility_id);
        if facility.escrow_state != ES_OPEN && facility.escrow_state != ES_PARTIAL {
            panic!("escrow");
        }
        let amount = position.pending_amount;
        let units = position.pending_units;
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
        let mut became_partial = false;
        if facility.escrow_state == ES_OPEN {
            facility.escrow_state = ES_PARTIAL;
            became_partial = true;
        }
        let mut became_full = false;
        if facility.funded_amount >= facility.funding_target {
            facility.status = ST_FUNDED;
            facility.escrow_state = ES_FULL;
            facility.conditions_mask |= 1 << COND_FUNDING;
            became_full = true;
        }
        save_position(&env, &facility_id, &investor, &position);
        save(&env, &facility_id, &facility);
        remember_investor(&env, &facility_id, &investor);
        RegistryClient::new(&env, &registry(&env)).record_investment(&env.current_contract_address(), &investor, &amount);
        emit(&env, "InvestmentReserved", &facility_id, &[amount, units]);
        if became_partial {
            emit(&env, "EscrowPartiallyFunded", &facility_id, &[ES_PARTIAL as i128]);
        }
        if became_full {
            emit(&env, "FacilityFunded", &facility_id, &[facility.funded_amount]);
            emit(&env, "EscrowFullyFunded", &facility_id, &[ES_FULL as i128]);
        }
        amount
    }

    // Cancels an intent that has not been reserved yet. No money moves.
    pub fn cancel_reservation(env: Env, investor: Address, facility_id: String) {
        investor.require_auth();
        let mut position = load_position(&env, &facility_id, &investor);
        let amount = position.pending_amount;
        position.pending_amount = 0;
        position.pending_units = 0;
        save_position(&env, &facility_id, &investor, &position);
        emit(&env, "ReservationCancelled", &facility_id, &[amount]);
    }

    // Returns the investor's own reserved capital while funding is open or after funding was cancelled.
    pub fn refund(env: Env, investor: Address, facility_id: String) -> i128 {
        investor.require_auth();
        require_open(&env);
        let mut facility = load(&env, &facility_id);
        if facility.escrow_state != ES_OPEN && facility.escrow_state != ES_PARTIAL && facility.escrow_state != ES_REFUNDED {
            panic!("escrow");
        }
        let mut position = load_position(&env, &facility_id, &investor);
        let amount = position.contributed;
        if amount <= 0 {
            panic!("empty");
        }
        token_client(&env).transfer(&env.current_contract_address(), &investor, &amount);
        facility.funded_amount -= amount;
        facility.total_participation_units -= position.units;
        if facility.funded_amount == 0 && facility.escrow_state == ES_PARTIAL {
            facility.escrow_state = ES_OPEN;
            facility.status = ST_APPROVED;
        }
        position.contributed = 0;
        position.units = 0;
        save_position(&env, &facility_id, &investor, &position);
        save(&env, &facility_id, &facility);
        RegistryClient::new(&env, &registry(&env)).reduce_investment(&env.current_contract_address(), &investor, &amount);
        emit(&env, "InvestorRefunded", &facility_id, &[amount]);
        amount
    }

    // Stops a facility that will not be funded. Investors then refund themselves.
    pub fn cancel_funding(env: Env, facility_id: String) {
        require_admin(&env);
        let mut facility = load(&env, &facility_id);
        if facility.escrow_state != ES_OPEN && facility.escrow_state != ES_PARTIAL {
            panic!("escrow");
        }
        facility.escrow_state = ES_REFUNDED;
        facility.status = ST_CLOSED;
        save(&env, &facility_id, &facility);
        emit(&env, "FundingCancelled", &facility_id, &[facility.funded_amount]);
        emit(&env, "EscrowRefunded", &facility_id, &[ES_REFUNDED as i128]);
    }

    pub fn set_supplier(env: Env, facility_id: String, supplier: Address) {
        require_role(&env, ROLE_OPERATIONS);
        let mut facility = load(&env, &facility_id);
        if facility.escrow_state >= ES_AUTHORIZED {
            panic!("escrow");
        }
        facility.supplier = supplier;
        save(&env, &facility_id, &facility);
        emit(&env, "SupplierSet", &facility_id, &[]);
    }

    pub fn mark_fully_funded(env: Env, facility_id: String) {
        require_role(&env, ROLE_OPERATIONS);
        let mut facility = load(&env, &facility_id);
        if facility.funded_amount < facility.funding_target {
            panic!("short");
        }
        if facility.escrow_state != ES_PARTIAL && facility.escrow_state != ES_OPEN {
            panic!("escrow");
        }
        facility.status = ST_FUNDED;
        facility.escrow_state = ES_FULL;
        facility.conditions_mask |= 1 << COND_FUNDING;
        save(&env, &facility_id, &facility);
        emit(&env, "FacilityFunded", &facility_id, &[facility.funded_amount]);
        emit(&env, "EscrowFullyFunded", &facility_id, &[ES_FULL as i128]);
    }

    // Starts release processing. From here investors can no longer refund.
    pub fn lock_release(env: Env, facility_id: String) {
        require_role(&env, ROLE_OPERATIONS);
        require_open(&env);
        let mut facility = load(&env, &facility_id);
        if facility.escrow_state != ES_FULL {
            panic!("escrow");
        }
        facility.escrow_state = ES_LOCKED;
        save(&env, &facility_id, &facility);
        emit(&env, "EscrowReleaseLocked", &facility_id, &[ES_LOCKED as i128]);
    }

    // The responsible role records that a condition is met, with the hash of the evidence. The evidence stays
    // off-chain; only its hash, the approver, the role and the time are stored.
    pub fn attest_release_condition(env: Env, facility_id: String, condition: u32, evidence_hash: String) {
        let role = condition_role(condition);
        let approver = role_address(&env, role);
        approver.require_auth();
        require_open(&env);
        let mut facility = load(&env, &facility_id);
        if facility.escrow_state == ES_RELEASED || facility.escrow_state == ES_CLOSED || facility.escrow_state == ES_REFUNDED {
            panic!("escrow");
        }
        let row = ConditionAttestation { evidence_hash, approver, role, attested_at: env.ledger().timestamp() };
        env.storage().persistent().set(&DataKey::Condition(facility_id.clone(), condition), &row);
        facility.conditions_mask |= 1 << condition;
        save(&env, &facility_id, &facility);
        emit(&env, "ReleaseConditionAttested", &facility_id, &[condition as i128, role as i128]);
    }

    // Release needs a funded, locked escrow and every condition attested. The administrator authorizes; a
    // different role (treasury) executes, so no single key can both approve and spend.
    pub fn authorize_release(env: Env, facility_id: String) {
        require_admin(&env);
        require_open(&env);
        let mut facility = load(&env, &facility_id);
        if facility.escrow_state != ES_LOCKED {
            panic!("escrow");
        }
        if facility.conditions_mask & ALL_CONDITIONS != ALL_CONDITIONS {
            panic!("conditions");
        }
        facility.status = ST_RELEASE_READY;
        facility.escrow_state = ES_AUTHORIZED;
        save(&env, &facility_id, &facility);
        emit(&env, "ReleaseAuthorized", &facility_id, &[facility.conditions_mask as i128]);
        emit(&env, "EscrowReleaseAuthorized", &facility_id, &[ES_AUTHORIZED as i128]);
    }

    // Pays the approved supplier address from escrow, never the SME. Subject to the daily release limit.
    pub fn release_supplier_payment(env: Env, facility_id: String) -> i128 {
        require_role(&env, ROLE_TREASURY);
        require_open(&env);
        let mut facility = load(&env, &facility_id);
        if facility.escrow_state != ES_AUTHORIZED {
            panic!("escrow");
        }
        let amount = facility.funded_amount;
        let limit: i128 = env.storage().instance().get(&DataKey::ReleaseLimit).unwrap_or(0);
        let day = env.ledger().timestamp() / 86_400;
        let today: i128 = env.storage().persistent().get(&DataKey::Released(day)).unwrap_or(0);
        if limit > 0 && today + amount > limit {
            panic!("daily limit");
        }
        env.storage().persistent().set(&DataKey::Released(day), &(today + amount));
        token_client(&env).transfer(&env.current_contract_address(), &facility.supplier, &amount);
        facility.status = ST_RELEASED;
        facility.escrow_state = ES_RELEASED;
        facility.released = true;
        save(&env, &facility_id, &facility);
        emit(&env, "ReleaseExecuted", &facility_id, &[amount]);
        emit(&env, "EscrowReleased", &facility_id, &[ES_RELEASED as i128]);
        amount
    }

    pub fn activate_facility(env: Env, facility_id: String) {
        require_role(&env, ROLE_OPERATIONS);
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
        emit(&env, "FacilityActivated", &facility_id, &[]);
    }

    // ---- waterfall, repayment, distribution, settlement, recovery --------------------------------------------

    pub fn calculate_platform_fee(_env: Env, gross: i128, fee_bps: u32) -> i128 {
        platform_fee(gross, fee_bps)
    }

    pub fn calculate_reserve(_env: Env, gross: i128, reserve_bps: u32) -> i128 {
        reserve_amount(gross, reserve_bps)
    }

    pub fn calculate_principal(_env: Env, finance_amount: i128, term_months: u32, payment_index: u32, remaining: i128, net: i128) -> i128 {
        principal_component(finance_amount, term_months, payment_index, remaining, net)
    }

    pub fn calculate_income(_env: Env, net: i128, principal: i128) -> i128 {
        income_component(net, principal)
    }

    // The facility's waterfall for a payment: [fee, reserve, net, principal, income]. Repayment uses this exact math.
    pub fn calculate_waterfall(env: Env, facility_id: String, gross: i128, payment_index: u32) -> Vec<i128> {
        let facility = load(&env, &facility_id);
        let w = calculate_waterfall(gross, facility.fee_bps, facility.reserve_bps, facility.finance_amount, facility.term_months, payment_index, facility.principal_outstanding);
        Vec::from_array(&env, [w.fee, w.reserve, w.net, w.principal, w.income])
    }

    // Only the borrower repays. The payment is split by the waterfall and distributed to unit holders.
    pub fn record_repayment(env: Env, payer: Address, facility_id: String, gross: i128, payment_index: u32, idempotency: String) -> Vec<i128> {
        payer.require_auth();
        require_open(&env);
        consume_op(&env, &idempotency);
        let mut facility = load(&env, &facility_id);
        if payer != facility.borrower {
            panic!("payer");
        }
        if facility.status != ST_ACTIVE && facility.status != ST_LATE && facility.status != ST_GRACE {
            panic!("status");
        }
        if gross <= 0 {
            panic!("amount");
        }
        let w = calculate_waterfall(gross, facility.fee_bps, facility.reserve_bps, facility.finance_amount, facility.term_months, payment_index, facility.principal_outstanding);
        let token = token_client(&env);
        let here = env.current_contract_address();
        token.transfer(&payer, &here, &gross);
        let treasury = treasury(&env);
        if w.fee + w.reserve > 0 {
            token.transfer(&here, &treasury, &(w.fee + w.reserve));
        }
        emit(&env, "RepaymentRecorded", &facility_id, &[gross, w.principal, w.income, w.fee, w.reserve]);
        pay_investors(&env, &facility_id, w.principal, w.income, 0);
        facility.principal_outstanding -= w.principal;
        facility.principal_repaid += w.principal;
        facility.income_paid += w.income;
        facility.fees_paid += w.fee + w.reserve;
        if facility.principal_outstanding == 0 {
            facility.status = ST_CLOSED;
            facility.escrow_state = ES_CLOSED;
            save(&env, &facility_id, &facility);
            emit(&env, "FacilityClosed", &facility_id, &[]);
            emit(&env, "EscrowClosed", &facility_id, &[ES_CLOSED as i128]);
        } else {
            save(&env, &facility_id, &facility);
        }
        Vec::from_array(&env, [w.principal, w.income, w.fee, w.reserve])
    }

    // The settlement terms are set by operations, not by the payer, so nobody can close a facility cheaply.
    pub fn set_settlement_quote(env: Env, facility_id: String, accrued_income: i128, fee: i128, rebate: i128) {
        require_role(&env, ROLE_OPERATIONS);
        let _ = load(&env, &facility_id);
        if accrued_income < 0 || fee < 0 || rebate < 0 || rebate > accrued_income {
            panic!("quote");
        }
        env.storage().persistent().set(&DataKey::Quote(facility_id.clone()), &(accrued_income, fee, rebate));
        emit(&env, "SettlementQuoted", &facility_id, &[accrued_income, fee, rebate]);
    }

    pub fn quote_settlement(env: Env, facility_id: String, accrued_income: i128, fee: i128, rebate: i128) -> i128 {
        let facility = load(&env, &facility_id);
        if accrued_income < 0 || fee < 0 || rebate < 0 || rebate > accrued_income {
            panic!("quote");
        }
        settlement_split(facility.principal_outstanding, accrued_income, fee, rebate).due
    }

    pub fn settle(env: Env, payer: Address, facility_id: String, idempotency: String) -> i128 {
        payer.require_auth();
        require_open(&env);
        consume_op(&env, &idempotency);
        let mut facility = load(&env, &facility_id);
        if facility.status != ST_ACTIVE && facility.status != ST_LATE && facility.status != ST_GRACE {
            panic!("status");
        }
        let (accrued_income, fee, rebate): (i128, i128, i128) = env
            .storage()
            .persistent()
            .get(&DataKey::Quote(facility_id.clone()))
            .unwrap_or_else(|| panic!("no quote"));
        env.storage().persistent().remove(&DataKey::Quote(facility_id.clone()));
        let split = settlement_split(facility.principal_outstanding, accrued_income, fee, rebate);
        let token = token_client(&env);
        let here = env.current_contract_address();
        token.transfer(&payer, &here, &split.due);
        if split.fee > 0 {
            token.transfer(&here, &treasury(&env), &split.fee);
        }
        emit(&env, "SettlementExecuted", &facility_id, &[split.due, split.principal, split.income, split.fee]);
        pay_investors(&env, &facility_id, split.principal, split.income, 0);
        facility.principal_repaid += split.principal;
        facility.income_paid += split.income;
        facility.fees_paid += split.fee;
        facility.principal_outstanding = 0;
        facility.settled = true;
        facility.status = ST_CLOSED;
        facility.escrow_state = ES_CLOSED;
        save(&env, &facility_id, &facility);
        emit(&env, "FacilityClosed", &facility_id, &[]);
        emit(&env, "EscrowClosed", &facility_id, &[ES_CLOSED as i128]);
        split.due
    }

    pub fn advance_status(env: Env, facility_id: String, next: u32) {
        require_role(&env, ROLE_OPERATIONS);
        let mut facility = load(&env, &facility_id);
        if !transition_allowed(facility.status, next) {
            panic!("transition");
        }
        facility.status = next;
        save(&env, &facility_id, &facility);
        let name = match next {
            ST_LATE => "FacilityLate",
            ST_GRACE => "FacilityGrace",
            ST_DEFAULT_NOTICE => "DefaultNoticeIssued",
            ST_DEFAULTED => "FacilityDefaulted",
            ST_REPOSSESSION => "RepossessionStarted",
            ST_ASSET_SALE => "AssetSaleStarted",
            ST_RECOVERY => "RecoveryStarted",
            ST_ACTIVE => "FacilityRestored",
            _ => "FacilityStatus",
        };
        emit(&env, name, &facility_id, &[next as i128]);
    }

    // Sale proceeds pay recovery costs, then outstanding principal pro rata to units. Any residual goes to the
    // treasury to be handled under the agreement. The payer must be the operations wallet (or the administrator).
    pub fn record_recovery(env: Env, payer: Address, facility_id: String, sale_proceeds: i128, recovery_costs: i128, idempotency: String) -> i128 {
        if payer != role_address(&env, ROLE_OPERATIONS) && payer != admin(&env) {
            panic!("payer");
        }
        payer.require_auth();
        require_open(&env);
        consume_op(&env, &idempotency);
        let mut facility = load(&env, &facility_id);
        if facility.status != ST_DEFAULTED && facility.status != ST_RECOVERY && facility.status != ST_REPOSSESSION && facility.status != ST_ASSET_SALE {
            panic!("status");
        }
        if sale_proceeds < 0 || recovery_costs < 0 || recovery_costs > sale_proceeds {
            panic!("proceeds");
        }
        let split = recovery_split(sale_proceeds, recovery_costs, facility.principal_outstanding);
        let token = token_client(&env);
        let here = env.current_contract_address();
        token.transfer(&payer, &here, &sale_proceeds);
        let treasury = treasury(&env);
        if split.costs + split.residual > 0 {
            token.transfer(&here, &treasury, &(split.costs + split.residual));
        }
        emit(&env, "RecoveryRecorded", &facility_id, &[sale_proceeds, split.costs, split.principal, split.residual]);
        pay_investors(&env, &facility_id, 0, 0, split.principal);
        facility.principal_outstanding -= split.principal;
        facility.recovery_proceeds += split.principal;
        facility.status = ST_CLOSED;
        facility.escrow_state = ES_CLOSED;
        save(&env, &facility_id, &facility);
        emit(&env, "FacilityClosed", &facility_id, &[]);
        emit(&env, "EscrowClosed", &facility_id, &[ES_CLOSED as i128]);
        split.principal
    }

    // ---- attestations ----------------------------------------------------------------------------------------

    pub fn attest_document(env: Env, document_hash: String, document_type: String, entity_hash: String, verification_status: u32) {
        require_role(&env, ROLE_OPERATIONS);
        let row = Attestation { document_hash: document_hash.clone(), document_type, entity_hash: entity_hash.clone(), verification_status, attested_at: env.ledger().timestamp() };
        env.storage().persistent().set(&DataKey::Document(document_hash), &row);
        emit(&env, "DocumentAttested", &entity_hash, &[verification_status as i128]);
    }

    // Anchors the hash of the inputs, the model version, and the result of a risk assessment, so a score cannot be
    // changed later without the difference being visible. The underlying financial data stays off-chain.
    pub fn attest_risk(env: Env, facility_id: String, input_hash: String, model_version: String, score: u32, grade: u32) {
        let attester = role_address(&env, ROLE_UNDERWRITER);
        attester.require_auth();
        let _ = load(&env, &facility_id);
        if score > 100 || grade > 4 {
            panic!("risk");
        }
        let row = RiskAttestation { input_hash, model_version, score, grade, attester, attested_at: env.ledger().timestamp() };
        env.storage().persistent().set(&DataKey::Risk(facility_id.clone()), &row);
        emit(&env, "RiskAttested", &facility_id, &[score as i128, grade as i128]);
    }

    pub fn upsert_passport(env: Env, asset_id: String, serial_hash: String, facility_id: String, insurance_status: u32, registration_status: u32, delivery_status: u32, recovery_status: u32) {
        require_role(&env, ROLE_OPERATIONS);
        let key = DataKey::Passport(asset_id.clone());
        let existing: Option<Passport> = env.storage().persistent().get(&key);
        let created = existing.is_none();
        let previous = existing.unwrap_or(Passport {
            serial_hash: serial_hash.clone(),
            facility_id: facility_id.clone(),
            insurance_status: 0,
            registration_status: 0,
            delivery_status: 0,
            recovery_status: 0,
            sale_status: 0,
            activated: 0,
            delivery_date: 0,
        });
        let row = Passport { serial_hash, facility_id, insurance_status, registration_status, delivery_status, recovery_status, ..previous };
        env.storage().persistent().set(&key, &row);
        emit(&env, if created { "AssetCreated" } else { "AssetUpdated" }, &asset_id, &[]);
    }

    // Field: 1 insurance, 2 registration, 3 delivery, 4 activation, 5 recovery, 6 sale or disposal.
    pub fn set_asset_status(env: Env, asset_id: String, field: u32, value: u32) {
        require_role(&env, ROLE_OPERATIONS);
        let key = DataKey::Passport(asset_id.clone());
        let mut passport: Passport = env.storage().persistent().get(&key).unwrap_or_else(|| panic!("asset"));
        let name = match field {
            1 => {
                passport.insurance_status = value;
                "InsuranceVerified"
            }
            2 => {
                passport.registration_status = value;
                "RegistrationVerified"
            }
            3 => {
                passport.delivery_status = value;
                if value == 1 {
                    passport.delivery_date = env.ledger().timestamp();
                }
                "AssetDelivered"
            }
            4 => {
                passport.activated = value;
                "AssetActivated"
            }
            5 => {
                passport.recovery_status = value;
                "AssetRecovered"
            }
            6 => {
                passport.sale_status = value;
                "AssetDisposed"
            }
            _ => panic!("field"),
        };
        env.storage().persistent().set(&key, &passport);
        emit(&env, name, &asset_id, &[value as i128]);
    }

    // ---- views -----------------------------------------------------------------------------------------------

    pub fn token_address(env: Env) -> Address {
        env.storage().instance().get(&DataKey::Token).unwrap()
    }

    pub fn facility(env: Env, facility_id: String) -> Facility {
        load(&env, &facility_id)
    }

    pub fn facility_status(env: Env, facility_id: String) -> u32 {
        load(&env, &facility_id).status
    }

    pub fn escrow_state(env: Env, facility_id: String) -> u32 {
        load(&env, &facility_id).escrow_state
    }

    pub fn facility_version(env: Env, facility_id: String) -> u32 {
        load(&env, &facility_id).version
    }

    pub fn conditions_mask(env: Env, facility_id: String) -> u32 {
        load(&env, &facility_id).conditions_mask
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

    pub fn position(env: Env, facility_id: String, investor: Address) -> PositionView {
        let facility = load(&env, &facility_id);
        let p = load_position(&env, &facility_id, &investor);
        let closed = facility.status == ST_CLOSED || facility.status == ST_REPAID;
        PositionView {
            facility_id,
            wallet: investor,
            units: p.units,
            committed: p.contributed,
            deployed: if facility.released { p.contributed } else { 0 },
            principal_returned: p.principal_received,
            income_received: p.income_received,
            recovery_received: p.recovery_received,
            outstanding_exposure: if closed { 0 } else { (p.contributed - p.principal_received - p.recovery_received).max(0) },
            status: position_status(&facility, &p),
        }
    }

    pub fn release_condition(env: Env, facility_id: String, condition: u32) -> Option<ConditionAttestation> {
        env.storage().persistent().get(&DataKey::Condition(facility_id, condition))
    }

    pub fn risk_attestation(env: Env, facility_id: String) -> Option<RiskAttestation> {
        env.storage().persistent().get(&DataKey::Risk(facility_id))
    }

    pub fn passport(env: Env, asset_id: String) -> Option<Passport> {
        env.storage().persistent().get(&DataKey::Passport(asset_id))
    }
}

fn condition_role(condition: u32) -> u32 {
    match condition {
        COND_SME_CONTRIBUTION | COND_SUPPLIER | COND_INVOICE | COND_AGREEMENT | COND_INSURANCE | COND_ASSET => ROLE_OPERATIONS,
        COND_COMPLIANCE => ROLE_COMPLIANCE,
        COND_FINAL_APPROVAL => ROLE_UNDERWRITER,
        _ => panic!("condition"),
    }
}

fn position_status(facility: &Facility, p: &Participation) -> u32 {
    let closed = facility.status == ST_CLOSED || facility.status == ST_REPAID;
    if closed {
        if p.recovery_received > 0 {
            return POS_RECOVERED;
        }
        if facility.settled {
            return POS_SETTLED;
        }
        return POS_CLOSED;
    }
    match facility.status {
        ST_APPROVED | ST_FUNDING => POS_RESERVED,
        ST_FUNDED | ST_RELEASE_READY | ST_RELEASED => POS_FUNDED,
        _ => {
            if p.principal_received > 0 {
                POS_PARTIALLY_REPAID
            } else {
                POS_ACTIVE
            }
        }
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

// Distribution engine. Deterministic and per facility: each unit holder gets its share of the principal, income
// and recovery amounts, the last holder takes the rounding remainder, and cumulative totals are stored.
fn pay_investors(env: &Env, facility_id: &String, principal: i128, income: i128, recovery: i128) {
    let list: Vec<Address> = env.storage().persistent().get(&DataKey::Investors(facility_id.clone())).unwrap_or(Vec::new(env));
    let total = load(env, facility_id).total_participation_units;
    let len = list.len();
    if len == 0 || (principal <= 0 && income <= 0 && recovery <= 0) {
        return;
    }
    emit(env, "DistributionCalculated", facility_id, &[principal, income, recovery, total]);
    let token = token_client(env);
    let here = env.current_contract_address();
    let (mut paid_p, mut paid_i, mut paid_r) = (0i128, 0i128, 0i128);
    let mut index = 0u32;
    for investor in list.iter() {
        let mut position = load_position(env, facility_id, &investor);
        let last = index + 1 == len;
        let p = if last { principal - paid_p } else { share_of(principal, position.units, total) };
        let i = if last { income - paid_i } else { share_of(income, position.units, total) };
        let r = if last { recovery - paid_r } else { share_of(recovery, position.units, total) };
        let amount = p + i + r;
        if amount > 0 {
            token.transfer(&here, &investor, &amount);
        }
        position.principal_received += p;
        position.income_received += i;
        position.recovery_received += r;
        save_position(env, facility_id, &investor, &position);
        paid_p += p;
        paid_i += i;
        paid_r += r;
        index += 1;
    }
    emit(env, "DistributionExecuted", facility_id, &[paid_p, paid_i, paid_r, len as i128]);
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

// Every event carries the entity id as its second topic and numbers as data, so an indexer needs no extra reads.
fn emit(env: &Env, name: &str, id: &String, data: &[i128]) {
    let mut values: Vec<i128> = Vec::new(env);
    for value in data {
        values.push_back(*value);
    }
    env.events().publish((Symbol::new(env, name), id.clone()), values);
}

fn emit_global(env: &Env, name: &str, value: i128) {
    env.events().publish((Symbol::new(env, name), Symbol::new(env, "contract")), value);
}

fn require_admin(env: &Env) {
    admin(env).require_auth();
}

fn require_role(env: &Env, role: u32) {
    role_address(env, role).require_auth();
}

fn role_address(env: &Env, role: u32) -> Address {
    match role {
        ROLE_ADMIN => admin(env),
        ROLE_PAUSER => pauser(env),
        ROLE_TREASURY => treasury(env),
        _ => env.storage().instance().get(&DataKey::Role(role)).unwrap_or_else(|| admin(env)),
    }
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
    env.storage().persistent().get(&DataKey::Facility(facility_id.clone())).unwrap_or_else(|| panic!("facility"))
}

// Every save advances the facility version, which reconciliation uses to spot stale projections.
fn save(env: &Env, facility_id: &String, facility: &Facility) {
    let mut next = facility.clone();
    next.version += 1;
    env.storage().persistent().set(&DataKey::Facility(facility_id.clone()), &next);
}

fn position_or_empty(env: &Env, facility_id: &String, investor: &Address) -> Participation {
    env.storage()
        .persistent()
        .get(&DataKey::Position(facility_id.clone(), investor.clone()))
        .unwrap_or(Participation { units: 0, contributed: 0, pending_amount: 0, pending_units: 0, principal_received: 0, income_received: 0, recovery_received: 0 })
}

fn load_position(env: &Env, facility_id: &String, investor: &Address) -> Participation {
    env.storage().persistent().get(&DataKey::Position(facility_id.clone(), investor.clone())).unwrap_or_else(|| panic!("position"))
}

fn save_position(env: &Env, facility_id: &String, investor: &Address, position: &Participation) {
    env.storage().persistent().set(&DataKey::Position(facility_id.clone(), investor.clone()), position);
}

#[cfg(test)]
mod test;
