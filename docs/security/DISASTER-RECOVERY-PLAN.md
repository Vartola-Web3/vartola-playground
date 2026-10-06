# Disaster recovery plan

Status: INTERNAL / PRE-AUDIT DRAFT. Recovery has not been tested end to end.

## What survives without the application

Facility state, Participation Units, escrow and distributions live in the Soroban contracts. Anyone can read them from any Soroban RPC and the Stellar explorer. If the application is unavailable, financial rights are not changed by that outage; what is lost is the ability to operate through the application interface until it is restored.

## Components and recovery

| Component | Backup | Recovery |
| --- | --- | --- |
| Soroban contracts | Contract IDs and deployment record in the repository | Nothing to restore; read from the chain |
| Application | Git repository and Vercel deployments | Redeploy a known commit |
| PostgreSQL read model | Provider point-in-time recovery plus periodic encrypted export | Restore, then re-index events and reconcile |
| Indexer cursor | Stored in settings and rebuilt from ledger zero if lost | Safe re-index; idempotent |
| Firebase journal | Append-only; provider backup | Not required for financial truth |
| Documents | Private bucket with versioning and cross-region copy (target) | Restore objects, verify SHA-256 |
| Configuration and secrets | Documented variable list, secret store backup under dual control | Recreate environment |

## Procedure

1. Declare the incident and freeze privileged actions.
2. Redeploy the last good commit.
3. Restore the database to the last good point or recreate it from chain events.
4. Run the indexer, then reconciliation. Proceed only when HEALTHY.
5. Resume operations and record the recovery in the audit log.

## Targets (to be agreed and tested)

Recovery point objective and recovery time objective are not yet committed. They will be set and tested before any pilot with external participants.
