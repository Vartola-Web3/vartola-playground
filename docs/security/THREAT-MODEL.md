# Threat model

Status: INTERNAL / PRE-AUDIT. Environment: Stellar Testnet, Working Alpha. Not reviewed by an independent party.

## Assets to protect

1. Facility state and participation positions held by the Soroban contracts.
2. Role keys (administrator, pauser, treasury, underwriter, operations, compliance).
3. Investor and SME personal data and commercial documents (off-chain, private storage).
4. Provider credentials (KYC, email, SMS, storage) and the server master key.
5. The integrity of risk scores and document records (anchored as hashes).

## Trust boundaries

Browser, Next.js application on Vercel, Neon PostgreSQL (read model), Firebase journal, private object storage, Soroban RPC, Stellar network. The chain is the financial source in Alpha mode; the application and database are never authoritative for balances.

## Threats and controls

| Threat | Control | Residual risk |
| --- | --- | --- |
| Stolen administrator session releases capital | Release needs eight attested conditions, one authorizer, a different payer, daily limit, pause; TOTP MFA on admin roles | Single Testnet keys, no multisig |
| Compromised role key | Separate wallets per role; role revocation; two-step admin rotation | Keys held by the application on Testnet; no HSM |
| Insider edits a risk score after funding | Input hash and score attested on-chain; later change is detectable | Attestation only proves what was attested |
| Supplier redirects payment | Supplier payout address is part of the approved facility; supplier role cannot approve release or change terms | Supplier KYB depends on provider quality |
| Event replay or duplicate processing | Idempotency keys; unique event key; replay guard | None known |
| Indexer or RPC outage | Persistent cursor, retry, dead letters, safe re-index; finality never fabricated | Operator must review dead letters |
| Database drift from chain | Scheduled reconciliation, HEALTHY / WARNING / FAILED, no history rewrite | Depends on cron being configured |
| Document leak | Private objects, signed short-lived URLs, MIME and size checks, SHA-256, audit trail | Not tested against a real bucket yet |
| Secret exposure | Provider secrets encrypted at rest; no secret in client code or logs | Single master key, not a managed vault |
| Contract bug | 44 contract tests, invariants, pause; independent audit not yet done | Unaudited code |
| Malicious upgrade | Timelocked upgrade path and policy requiring review | No multisig yet |
| Phishing or social engineering of operators | MFA, least-privilege roles, audit log | Human factor |

## Out of scope for this build

Real-money custody, fiat rails, regulated client money, production incident staffing. These are tracked as blockers in the Mainnet readiness scorecard.
