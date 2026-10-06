# Incident response plan

Status: INTERNAL / PRE-AUDIT DRAFT. Not yet exercised in a drill.

## Severity

- SEV1: possible loss or misdirection of funds, key compromise, contract exploit.
- SEV2: reconciliation FAILED, indexer down beyond one hour, document exposure.
- SEV3: degraded provider, single failed job, non-financial bug.

## First hour

1. Detect: reconciliation FAILED, operations health alert, user report, security disclosure.
2. Contain: for SEV1 the pauser pauses the facility contract. Pause cannot move funds. Disable affected admin sessions and rotate suspected keys.
3. Preserve: keep logs, audit entries, chain events and the database snapshot. Do not rewrite or delete records.
4. Assess: use the reconciliation findings and chain events to decide what changed and what is affected.
5. Communicate: name an incident lead; inform the owner; prepare a factual statement.

## Recovery

- Fix the cause, verify with reconciliation HEALTHY, unpause only by the contract admin role with a recorded reason.
- Re-index from the persistent cursor if the read model is behind. The chain is never edited.

## After

Written post-incident review within five working days: timeline, cause, impact, fixes, follow-up tasks. Update this plan and the threat model.

## Contacts and escalation

To be completed before any pilot with external participants: incident lead, deputy, legal counsel, regulator or partner notification duties (to be confirmed with counsel).
