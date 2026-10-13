# Security Pass (Bug Bash) — 13 October 2026

**Scope:** manual attack-surface review of the critical paths. No code was exploited; this is a code-review pass, not a penetration test. An independent audit and penetration test remain Mainnet gates.

## Method

Read the enforcement code for: middleware route gating, session/role checks on every sampled API route, sandbox session ownership, webhook signature verification, storage path handling, rate limiting, secret hygiene, and the outbox confirmation flow.

## Checked and passing

| Area | Verdict |
| --- | --- |
| Middleware public surface | Only intended routes are public (`/`, docs, `/marketplace`, `/verify/*`, `/proof`, `/sandbox`, `/api/verify/*`, `/api/health`, `/api/sandbox/*`, `/api/contact`, `/api/marketplace/*`, `/api/auth`, `/_next`). Everything else requires a session. |
| Role gating (pages) | SME/INVESTOR/SUPPLIER/UNDERWRITER areas redirect other roles; `/admin` requires an admin operator; unenrolled admins in Alpha are confined to `/admin/security`. |
| Admin API routes | All sampled routes call `auth()` and require an admin operator or `ADMIN` (users, simulation, financial-mode, pools, blockchain, reconciliation, audit, contacts, mfa, setup/test-user). |
| SME API routes | Require `SME` role; application/document access additionally checks `companyId` ownership (403 on mismatch). |
| Investor API routes | Require `INVESTOR`; wallets and subscriptions are keyed to `session.user.id`, never to a client-supplied id. |
| Supplier API routes | Require `SUPPLIER`. |
| Underwriting API routes | Require `UNDERWRITER` (review, archive, ai-assist allow ADMIN where appropriate). |
| Webhooks (Sumsub) | Timing-safe HMAC; rejects when the secret is missing; transactional and idempotent. |
| Sandbox sessions | Every session-scoped route verifies the `sbx_sid` cookie matches the id; a foreign id returns 404. Rate limits: 30/min creation, 60/min reads/actions. |
| Storage deletion | Refuses paths outside the uploads directory; S3 paths go through the SDK. |
| Public contact form | Rate limited (5 per 10 minutes per IP). |
| Secret hygiene | `.env*`, `.alpha/`, `.platform-config/`, `uploads/`, `*.db` ignored; `.env` untracked; gitleaks green in CI (one narrow allowlist for a public RFC test vector and demo seed data). |
| Outbox confirmation | Transactions are verified successful on-ledger before `CONFIRMED` (fixed this week). |

## Findings

No new vulnerabilities were found in the sampled paths. Residual risks (already tracked):

1. **Rate limiting is per-instance in-memory** (`lib/security/rate-limit.ts`) — acceptable on one instance, not a distributed limiter. Flagged for the scaling stage.
2. **Unauthenticated API calls are redirected to `/login` by middleware** (307) instead of receiving a 401 JSON. Every route also checks `auth()` itself and returns 401, so enforcement is intact; the redirect is an outer layer only.
3. **Single admin key on Testnet, no enforced multisig, no HSM** — Mainnet gate, unchanged.
4. **Independent audit and penetration test not done** — Mainnet gate, unchanged.

## Verdict

The Testnet surface is consistently enforced at both the middleware and route layers. Nothing found in this pass blocks the Testnet launch. The remaining gates are the documented Mainnet ones.
