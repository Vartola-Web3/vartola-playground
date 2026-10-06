# Contract upgrade policy

Status: INTERNAL / PRE-AUDIT DRAFT.

## Principles

- Upgrades are rare, reviewed, announced and traceable. Superseded versions stay on record (see `/admin/contracts`).
- Every upgrade has a written reason, an authorizer, the previous contract, the deployment and upgrade transactions and an activation time.
- Financial state is never migrated by editing history. New facilities use the new contract; existing facilities follow their documented path.

## Process

1. Propose: change description, risk assessment, test evidence, rollback plan.
2. Review: second reviewer, security checklist, contract and invariant tests, reconciliation against Testnet.
3. Authorize: contract admin and platform owner (multisig threshold on Mainnet). The on-chain timelock delay must elapse.
4. Deploy and verify: record IDs and hashes, run the reference facility suite, run reconciliation.
5. Activate and announce. Record the governance entry.

## Mainnet additions

Independent audit of the diff, multisig approval, and a defined emergency pause path. No upgrade without them.

## History

v1 and v2 were replaced on Testnet before any real use (authorization review, then role separation and explicit escrow). v3 is current.
