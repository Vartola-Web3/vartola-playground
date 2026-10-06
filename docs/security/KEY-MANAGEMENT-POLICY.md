# Key management policy

Status: INTERNAL / PRE-AUDIT DRAFT. Describes the target policy and states honestly what is implemented today.

## Current state (Testnet)

- Each contract role has its own Stellar key. Keys exist only for Testnet and hold no real value.
- Provider secrets in application settings are encrypted at rest with `SERVER_MASTER_KEY` (AES-GCM). Local and demo mode may fall back to plaintext only where no secret is real.
- Wallet secrets for embedded investor wallets are sealed with `WALLET_KEK`.
- Secrets never reach client code, logs or error messages.
- A single master key is not a managed vault. This is a known limitation.

## Required before Mainnet

1. Administrator, treasury and upgrade authority held by a multisig account (for example 3-of-5), signers on separate hardware devices and separate people.
2. A managed secret store or HSM for any server-held key, with access logging.
3. Documented key generation, storage, rotation, revocation and succession.
4. Separate keys per environment. A Testnet key is never reused anywhere else.
5. Offline backup of recovery material under dual control.

## Rules

- Never commit a secret, seed or private key. Repository scanning runs before release.
- Rotate a key after any suspected exposure and after any staff change involving that key.
- Role keys are revoked on-chain first, then replaced.
- Succession: a named deputy can rotate the administrator role through the two-step rotation, with a recorded reason.

## Evidence

Encrypted settings tests (`lib/security/encrypted-secrets.test.ts`), role separation test (`lib/docs/testnet-record.test.ts`), contract role tests.
