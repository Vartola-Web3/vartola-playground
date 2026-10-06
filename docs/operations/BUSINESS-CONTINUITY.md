# Business continuity

Status: INTERNAL / PRE-AUDIT DRAFT. Designed, partly implemented, not yet tested end to end.

## The key question

**What happens to an active facility if Vartola's application is temporarily unavailable?**

- Facility state, funding, escrow, Participation Units, repayments recorded and distributions are held by the Soroban contracts and remain readable and verifiable from any Soroban RPC and the Stellar explorer. `/verify/facility/<id>` and `/proof` read the contract directly.
- Distributions and positions follow the contract, not the front end. An outage does not change who holds what.
- What stops: operating through the application (recording a repayment, attesting a condition, collections work). Role holders can still act directly on the contract with their own keys under the documented procedure.
- What must be done on recovery: re-index missed events (idempotent), run reconciliation, process any queued operations.

## Controls

| Area | Design | Status |
| --- | --- | --- |
| Encrypted backups | Provider point-in-time recovery plus encrypted export | PARTIAL |
| Database recovery | Restore, re-index, reconcile | PARTIAL, untested |
| Configuration recovery | Documented environment variable list; secrets recreated from the secret store | PARTIAL |
| Indexer recovery | Persistent cursor, dead letters, safe re-index from any ledger | DONE |
| Blockchain re-index | `/admin/reconciliation` re-index action | DONE |
| Document backup | Versioned private bucket, hash verification | PLANNED |
| Incident response | `docs/security/INCIDENT-RESPONSE-PLAN.md` | DRAFT |
| Key succession | Two-step admin rotation, named deputy | DONE on contract, policy DRAFT |
| Successor servicing | `docs/operations/WIND-DOWN-PLAN.md` | DRAFT, needs counsel |
| Facility data export | Institutional reports (JSON and printable) | DONE |

## Not yet true

No recovery time or recovery point objective is committed. No restore drill has been run. No external monitoring pager is connected. These are listed in the Mainnet readiness scorecard.
