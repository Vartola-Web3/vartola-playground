# Security policy

## Status

Vartola is deployed on **Stellar Testnet only**. It uses no real money, holds no client assets and has **not** been independently audited. Mainnet and live-money deployment are gated on an external audit, a penetration test, production key custody and the applicable regulatory structure.

## Reporting a vulnerability

Please **do not open a public issue** for a security problem.

- Use GitHub's private vulnerability reporting on this repository: **Security → Report a vulnerability**.
- Or use the contact form at `/contact` and mark the enquiry as security-related.

Please include the affected route or file, the impact, and the steps to reproduce. We will acknowledge the report and keep you updated on remediation. We do not currently run a paid bounty.

## In scope

- Soroban contracts in `contracts/soroban` (facility contract, wallet registry, finance math).
- The Next.js application: authentication, authorisation, financial endpoints, webhooks, the sandbox session API, and document handling.
- Secrets handling and infrastructure configuration in this repository.

## Out of scope

- Third-party providers (Sumsub, Transak, Circle, Stellar/Soroban networks) — report those to the provider.
- Denial-of-service or spam that requires no vulnerability.
- Issues that only affect the seeded demo data.
- Missing hardening headers on non-production preview deployments.

## Existing controls

Role-separated areas, authorisation checks on every financial route, a compliance gate in Alpha mode, signed provider webhooks, rate limiting, idempotency keys, encrypted provider secrets, private document storage, a session-ownership check on the sandbox API, and CI security scans (gitleaks, CodeQL, dependency audit). These are documented in `docs/security` and `docs/security-pass.md`.

## Known limitations

Single Testnet admin key, multisig not enforced on-chain, in-memory rate limiting (per instance), provider integrations that need sandbox credentials, and no independent audit yet.
