# Wind-down plan

**DRAFT — SUBJECT TO LEGAL AND REGULATORY REVIEW.** Not approved by counsel or any regulator. Describes operational readiness, not a legal commitment.

## Principle

If Vartola stopped operating, facility records, investor positions and proofs must remain recoverable by someone else. Financial state is on the Soroban contracts, so it does not disappear with the application; the work is to preserve the off-chain records and hand servicing to a successor.

## Steps

1. **Freeze new activity.** Stop new applications and subscriptions. Pause contracts only if needed for safety; pause cannot move funds.
2. **Facility records export.** Generate the facility report for every facility (`/api/admin/reports/facility?facility=...`, JSON and printable).
3. **Investor position export.** Investor position reports with units, committed, returned, income and recovery, plus chain references.
4. **Contract references.** Contract IDs, versions, role wallets and deployment transactions (`/admin/contracts`).
5. **Transaction proofs.** Receipts with recomputable SHA-256 and explorer links.
6. **Document preservation.** Export private documents with their SHA-256 hashes and access history to a custodian under agreement.
7. **Reconciliation snapshot.** Run reconciliation, store the HEALTHY or findings report as the closing snapshot.
8. **Open collections cases.** Export cases with stage, owner, promises, recovery costs and next action; assign to the successor servicer.
9. **Asset passport export.** Passports with serial hashes, insurance, registration and recovery status.
10. **Successor servicing.** Appoint a licensed servicer by agreement; transfer role keys through the documented rotation, never by sharing a secret.
11. **Stakeholder communication.** Notify investors, SMEs, suppliers and any regulator or partner as counsel advises, with factual status and contacts.

## Open legal questions

Who owns servicing rights, how security over assets is transferred, client-money treatment and regulator notifications. These need counsel and are blockers for any real-money operation.
