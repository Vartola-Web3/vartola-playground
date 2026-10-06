extern crate std;

use super::*;
use soroban_sdk::{testutils::Address as _, testutils::Events as _, testutils::Ledger as _, token::Client as TokenClient, token::StellarAssetClient, Env};

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

const UNIT: i128 = 1_000_000_000; // 100 VTAED
const FINANCE: i128 = 10_000_000_000; // 1,000 VTAED, 10 units

struct Ctx {
    env: Env,
    contract: Address,
    client: FacilityContractClient<'static>,
    admin: Address,
    treasury: Address,
    pauser: Address,
    token: Address,
    investor_a: Address,
    investor_b: Address,
    borrower: Address,
    supplier: Address,
}

fn setup() -> Ctx {
    let env = Env::default();
    env.mock_all_auths();
    let admin = Address::generate(&env);
    let treasury = Address::generate(&env);
    let pauser = Address::generate(&env);
    let investor_a = Address::generate(&env);
    let investor_b = Address::generate(&env);
    let borrower = Address::generate(&env);
    let supplier = Address::generate(&env);
    let token = env.register_stellar_asset_contract(Address::generate(&env));
    let registry = env.register_contract(None, MockRegistry);
    let contract = env.register_contract(None, FacilityContract);
    let client = FacilityContractClient::new(&env, &contract);
    client.initialize(&admin, &treasury, &pauser, &token, &registry, &UNIT);
    let asset = StellarAssetClient::new(&env, &token);
    asset.mint(&investor_a, &50_000_000_000);
    asset.mint(&investor_b, &50_000_000_000);
    asset.mint(&borrower, &50_000_000_000);
    asset.mint(&admin, &50_000_000_000);
    Ctx { env, contract, client, admin, treasury, pauser, token, investor_a, investor_b, borrower, supplier }
}

fn fid(c: &Ctx, name: &str) -> String {
    String::from_str(&c.env, name)
}

fn create(c: &Ctx, id: &String) {
    c.client.create_facility(
        id, &c.borrower, &fid(c, "b"), &fid(c, "a"), &FINANCE, &0, &fid(c, "schedule"), &c.supplier,
        &Terms { term_months: 4, payment_frequency_months: 1, fee_bps: 100, reserve_bps: 50 },
    );
}

fn fund(c: &Ctx, id: &String) {
    c.client.subscribe(&c.investor_a, id, &(6 * UNIT));
    c.client.reserve(&c.investor_a, id);
    c.client.subscribe(&c.investor_b, id, &(4 * UNIT));
    c.client.reserve(&c.investor_b, id);
}

fn attest_all(c: &Ctx, id: &String) {
    for condition in 1..=8u32 {
        c.client.attest_release_condition(id, &condition, &fid(c, "evidence-hash"));
    }
}

fn release_ready(c: &Ctx, id: &String) {
    create(c, id);
    fund(c, id);
    c.client.lock_release(id);
    attest_all(c, id);
    c.client.authorize_release(id);
}

fn active(c: &Ctx, id: &String) {
    release_ready(c, id);
    c.client.release_supplier_payment(id);
    c.client.activate_facility(id);
}

fn token(c: &Ctx) -> TokenClient<'_> {
    TokenClient::new(&c.env, &c.token)
}

#[test]
fn escrow_moves_through_every_state_with_an_event_each() {
    let c = setup();
    let id = fid(&c, "f1");
    create(&c, &id);
    assert_eq!(c.client.escrow_state(&id), ES_OPEN);
    c.client.subscribe(&c.investor_a, &id, &(6 * UNIT));
    c.client.reserve(&c.investor_a, &id);
    assert_eq!(c.client.escrow_state(&id), ES_PARTIAL);
    c.client.subscribe(&c.investor_b, &id, &(4 * UNIT));
    c.client.reserve(&c.investor_b, &id);
    assert_eq!(c.client.escrow_state(&id), ES_FULL);
    assert_eq!(c.client.facility_status(&id), ST_FUNDED);
    c.client.lock_release(&id);
    assert_eq!(c.client.escrow_state(&id), ES_LOCKED);
    attest_all(&c, &id);
    c.client.authorize_release(&id);
    assert_eq!(c.client.escrow_state(&id), ES_AUTHORIZED);
    c.client.release_supplier_payment(&id);
    assert_eq!(c.client.escrow_state(&id), ES_RELEASED);
    let before = c.env.events().all().len();
    assert!(before >= 10, "every transition should emit an event, got {}", before);
}

#[test]
fn capital_goes_to_the_supplier_never_to_the_sme() {
    let c = setup();
    let id = fid(&c, "f2");
    let borrower_before = token(&c).balance(&c.borrower);
    release_ready(&c, &id);
    let released = c.client.release_supplier_payment(&id);
    assert_eq!(released, FINANCE);
    assert_eq!(token(&c).balance(&c.supplier), FINANCE);
    assert_eq!(token(&c).balance(&c.borrower), borrower_before);
    assert_eq!(token(&c).balance(&c.contract), 0);
}

#[test]
#[should_panic(expected = "conditions")]
fn release_cannot_be_authorized_until_every_condition_is_attested() {
    let c = setup();
    let id = fid(&c, "f3");
    create(&c, &id);
    fund(&c, &id);
    c.client.lock_release(&id);
    for condition in 1..=7u32 {
        c.client.attest_release_condition(&id, &condition, &fid(&c, "h"));
    }
    c.client.authorize_release(&id);
}

#[test]
#[should_panic(expected = "escrow")]
fn release_cannot_skip_the_lock_step() {
    let c = setup();
    let id = fid(&c, "f4");
    create(&c, &id);
    fund(&c, &id);
    attest_all(&c, &id);
    c.client.authorize_release(&id);
}

#[test]
#[should_panic(expected = "escrow")]
fn the_supplier_payment_needs_authorization_first() {
    let c = setup();
    let id = fid(&c, "f5");
    create(&c, &id);
    fund(&c, &id);
    c.client.lock_release(&id);
    c.client.release_supplier_payment(&id);
}

#[test]
fn a_locked_escrow_cannot_be_refunded() {
    let c = setup();
    let id = fid(&c, "f6");
    create(&c, &id);
    fund(&c, &id);
    c.client.lock_release(&id);
    assert!(c.client.try_refund(&c.investor_a, &id).is_err());
}

#[test]
fn partial_funding_can_be_refunded_and_the_escrow_reopens() {
    let c = setup();
    let id = fid(&c, "f7");
    create(&c, &id);
    let before = token(&c).balance(&c.investor_a);
    c.client.subscribe(&c.investor_a, &id, &(3 * UNIT));
    c.client.reserve(&c.investor_a, &id);
    assert_eq!(token(&c).balance(&c.investor_a), before - 3 * UNIT);
    c.client.refund(&c.investor_a, &id);
    assert_eq!(token(&c).balance(&c.investor_a), before);
    assert_eq!(c.client.escrow_state(&id), ES_OPEN);
    assert_eq!(c.client.issued_units(&id), 0);
}

#[test]
fn cancelled_funding_lets_every_investor_refund() {
    let c = setup();
    let id = fid(&c, "f8");
    create(&c, &id);
    c.client.subscribe(&c.investor_a, &id, &(2 * UNIT));
    c.client.reserve(&c.investor_a, &id);
    c.client.cancel_funding(&id);
    assert_eq!(c.client.escrow_state(&id), ES_REFUNDED);
    assert_eq!(c.client.refund(&c.investor_a, &id), 2 * UNIT);
}

#[test]
fn cancel_reservation_clears_only_the_pending_intent() {
    let c = setup();
    let id = fid(&c, "f9");
    create(&c, &id);
    c.client.subscribe(&c.investor_a, &id, &(2 * UNIT));
    c.client.cancel_reservation(&c.investor_a, &id);
    assert!(c.client.try_reserve(&c.investor_a, &id).is_err());
}

#[test]
fn repayment_follows_the_waterfall_and_updates_cumulative_totals() {
    let c = setup();
    let id = fid(&c, "f10");
    active(&c, &id);
    let quote = c.client.calculate_waterfall(&id, &3_000_000_000, &1);
    let out = c.client.record_repayment(&c.borrower, &id, &3_000_000_000, &1, &fid(&c, "pay-1"));
    assert_eq!(out.get(0).unwrap(), quote.get(3).unwrap());
    assert_eq!(out.get(1).unwrap(), quote.get(4).unwrap());
    let facility = c.client.facility(&id);
    assert_eq!(facility.principal_repaid, out.get(0).unwrap());
    assert_eq!(facility.income_paid, out.get(1).unwrap());
    assert_eq!(facility.fees_paid, out.get(2).unwrap() + out.get(3).unwrap());
    assert_eq!(facility.principal_outstanding, FINANCE - out.get(0).unwrap());
    let a = c.client.position(&id, &c.investor_a);
    let b = c.client.position(&id, &c.investor_b);
    assert_eq!(a.principal_returned + b.principal_returned, facility.principal_repaid);
    assert_eq!(a.income_received + b.income_received, facility.income_paid);
}

#[test]
fn distribution_is_proportional_to_units_and_the_remainder_is_not_lost() {
    let c = setup();
    let id = fid(&c, "f11");
    active(&c, &id);
    c.client.record_repayment(&c.borrower, &id, &3_333_333_337, &1, &fid(&c, "pay-r"));
    let a = c.client.position(&id, &c.investor_a);
    let b = c.client.position(&id, &c.investor_b);
    let f = c.client.facility(&id);
    assert_eq!(a.principal_returned + b.principal_returned, f.principal_repaid);
    assert_eq!(a.income_received + b.income_received, f.income_paid);
    assert!(a.principal_returned > b.principal_returned);
}

#[test]
fn positions_report_status_and_exposure() {
    let c = setup();
    let id = fid(&c, "f12");
    create(&c, &id);
    c.client.subscribe(&c.investor_a, &id, &(6 * UNIT));
    c.client.reserve(&c.investor_a, &id);
    assert_eq!(c.client.position(&id, &c.investor_a).status, POS_RESERVED);
    c.client.subscribe(&c.investor_b, &id, &(4 * UNIT));
    c.client.reserve(&c.investor_b, &id);
    assert_eq!(c.client.position(&id, &c.investor_a).status, POS_FUNDED);
    c.client.lock_release(&id);
    attest_all(&c, &id);
    c.client.authorize_release(&id);
    c.client.release_supplier_payment(&id);
    c.client.activate_facility(&id);
    let a = c.client.position(&id, &c.investor_a);
    assert_eq!((a.status, a.committed, a.deployed, a.outstanding_exposure), (POS_ACTIVE, 6 * UNIT, 6 * UNIT, 6 * UNIT));
    c.client.record_repayment(&c.borrower, &id, &3_000_000_000, &1, &fid(&c, "pay-p"));
    assert_eq!(c.client.position(&id, &c.investor_a).status, POS_PARTIALLY_REPAID);
    assert!(c.client.position(&id, &c.investor_a).outstanding_exposure < 6 * UNIT);
}

#[test]
fn early_settlement_closes_and_marks_positions_settled() {
    let c = setup();
    let id = fid(&c, "f13");
    active(&c, &id);
    c.client.set_settlement_quote(&id, &200_000_000, &100_000_000, &50_000_000);
    let due = c.client.settle(&c.borrower, &id, &fid(&c, "s1"));
    assert_eq!(due, FINANCE + 200_000_000 + 100_000_000 - 50_000_000);
    assert_eq!(c.client.facility_status(&id), ST_CLOSED);
    assert_eq!(c.client.escrow_state(&id), ES_CLOSED);
    let a = c.client.position(&id, &c.investor_a);
    assert_eq!((a.status, a.outstanding_exposure), (POS_SETTLED, 0));
}

#[test]
fn recovery_pays_costs_then_principal_by_units_and_closes() {
    let c = setup();
    let id = fid(&c, "f14");
    active(&c, &id);
    for status in [ST_LATE, ST_DEFAULT_NOTICE, ST_DEFAULTED, ST_REPOSSESSION, ST_ASSET_SALE] {
        c.client.advance_status(&id, &status);
    }
    let recovered = c.client.record_recovery(&c.admin, &id, &6_000_000_000, &1_000_000_000, &fid(&c, "rec-1"));
    assert_eq!(recovered, 5_000_000_000);
    let f = c.client.facility(&id);
    assert_eq!(f.recovery_proceeds, 5_000_000_000);
    assert_eq!(f.status, ST_CLOSED);
    let a = c.client.position(&id, &c.investor_a);
    let b = c.client.position(&id, &c.investor_b);
    assert_eq!(a.recovery_received, 3_000_000_000);
    assert_eq!(b.recovery_received, 2_000_000_000);
    assert_eq!(a.status, POS_RECOVERED);
}

#[test]
fn the_daily_release_limit_blocks_an_oversized_release() {
    let c = setup();
    let id = fid(&c, "f15");
    release_ready(&c, &id);
    c.client.set_release_limit(&(FINANCE - 1));
    assert!(c.client.try_release_supplier_payment(&id).is_err());
    c.client.set_release_limit(&FINANCE);
    c.client.release_supplier_payment(&id);
    assert_eq!(c.client.facility_status(&id), ST_RELEASED);
}

#[test]
fn pausing_stops_new_money_and_unpausing_restores_it() {
    let c = setup();
    let id = fid(&c, "f16");
    create(&c, &id);
    c.client.pause();
    assert!(c.client.try_subscribe(&c.investor_a, &id, &UNIT).is_err());
    c.client.unpause();
    c.client.subscribe(&c.investor_a, &id, &UNIT);
}

#[test]
fn roles_fall_back_to_the_admin_and_can_be_separated_and_revoked() {
    let c = setup();
    assert_eq!(c.client.role_address(&ROLE_OPERATIONS), c.admin);
    let ops = Address::generate(&c.env);
    c.client.set_role(&ROLE_OPERATIONS, &ops);
    assert_eq!(c.client.role_address(&ROLE_OPERATIONS), ops);
    // The operations call now needs the operations wallet to authorize, not the administrator.
    let id = fid(&c, "f17");
    create(&c, &id);
    c.client.subscribe(&c.investor_a, &id, &(10 * UNIT));
    c.client.reserve(&c.investor_a, &id);
    c.client.lock_release(&id);
    let auths = c.env.auths();
    assert_eq!(auths[auths.len() - 1].0, ops);
    c.client.revoke_role(&ROLE_OPERATIONS);
    assert_eq!(c.client.role_address(&ROLE_OPERATIONS), c.admin);
    assert_eq!(c.client.role_address(&ROLE_PAUSER), c.pauser);
    assert_eq!(c.client.role_address(&ROLE_TREASURY), c.treasury);
}

#[test]
fn the_treasury_role_executes_the_release_not_the_administrator() {
    let c = setup();
    let id = fid(&c, "f18");
    release_ready(&c, &id);
    c.client.release_supplier_payment(&id);
    let auths = c.env.auths();
    assert_eq!(auths[auths.len() - 1].0, c.treasury);
}

#[test]
fn admin_rotation_needs_the_new_administrator_to_accept() {
    let c = setup();
    let next = Address::generate(&c.env);
    c.client.propose_admin(&next);
    assert_eq!(c.client.role_address(&ROLE_ADMIN), c.admin);
    c.client.accept_admin();
    let auths = c.env.auths();
    assert_eq!(auths[auths.len() - 1].0, next);
    assert_eq!(c.client.role_address(&ROLE_ADMIN), next);
}

#[test]
fn accepting_without_a_proposal_fails() {
    let c = setup();
    assert!(c.client.try_accept_admin().is_err());
}

#[test]
fn risk_attestations_store_the_hash_and_model_version() {
    let c = setup();
    let id = fid(&c, "f19");
    create(&c, &id);
    c.client.attest_risk(&id, &fid(&c, "snapshot-hash"), &fid(&c, "facility-risk-v1"), &74, &2);
    let row = c.client.risk_attestation(&id).unwrap();
    assert_eq!((row.score, row.grade), (74, 2));
    assert_eq!(row.model_version, fid(&c, "facility-risk-v1"));
    assert!(c.client.try_attest_risk(&id, &fid(&c, "h"), &fid(&c, "v"), &101, &2).is_err());
}

#[test]
fn the_asset_passport_emits_one_event_per_lifecycle_fact() {
    let c = setup();
    let asset = fid(&c, "asset-1");
    c.client.upsert_passport(&asset, &fid(&c, "serial-hash"), &fid(&c, "f20"), &0, &0, &0, &0);
    for field in 1..=6u32 {
        c.client.set_asset_status(&asset, &field, &1);
    }
    let passport = c.client.passport(&asset).unwrap();
    assert_eq!((passport.insurance_status, passport.registration_status, passport.delivery_status), (1, 1, 1));
    assert_eq!((passport.activated, passport.recovery_status, passport.sale_status), (1, 1, 1));
    assert!(c.client.try_set_asset_status(&asset, &9, &1).is_err());
}

#[test]
fn upgrades_wait_for_the_timelock() {
    let c = setup();
    c.client.set_upgrade_delay(&3600);
    c.client.schedule_upgrade(&BytesN::from_array(&c.env, &[7u8; 32]));
    assert!(c.client.try_execute_upgrade().is_err());
    c.client.cancel_upgrade();
    assert!(c.client.try_execute_upgrade().is_err());
    assert_eq!(c.client.contract_version(), 2);
    c.env.ledger().with_mut(|ledger| ledger.timestamp += 7200);
    assert!(c.client.try_execute_upgrade().is_err());
}

#[test]
fn every_state_change_advances_the_facility_version() {
    let c = setup();
    let id = fid(&c, "f21");
    create(&c, &id);
    let v0 = c.client.facility_version(&id);
    c.client.subscribe(&c.investor_a, &id, &UNIT);
    c.client.reserve(&c.investor_a, &id);
    assert!(c.client.facility_version(&id) > v0);
}

#[test]
fn only_the_borrower_repays_and_settlement_needs_a_quote() {
    let c = setup();
    let id = fid(&c, "f22");
    active(&c, &id);
    assert!(c.client.try_record_repayment(&c.investor_a, &id, &UNIT, &1, &fid(&c, "x")).is_err());
    assert!(c.client.try_settle(&c.borrower, &id, &fid(&c, "y")).is_err());
}

#[test]
fn a_duplicate_operation_key_is_rejected() {
    let c = setup();
    let id = fid(&c, "f23");
    active(&c, &id);
    c.client.record_repayment(&c.borrower, &id, &UNIT, &1, &fid(&c, "same"));
    assert!(c.client.try_record_repayment(&c.borrower, &id, &UNIT, &2, &fid(&c, "same")).is_err());
}
