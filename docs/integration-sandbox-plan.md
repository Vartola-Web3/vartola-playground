# Vartola integration sandbox plan

The public Alpha walkthrough uses the application ledger. Alpha mode is the Soroban execution path and is not the default until contracts are deployed. External providers stay adapters around that workflow.

## Target stack

| Capability | Primary sandbox | Alternative | Internal fallback |
| --- | --- | --- | --- |
| Investor KYC and SME KYB | Sumsub | Veriff plus a KYB provider | Manual demo approval |
| AED on/off-ramp | Transak | Banxa | Virtual tAED top-up |
| USDC treasury on Stellar | Circle | Licensed Stellar anchor | Simulation ledger |
| Blockchain settlement | Stellar Testnet | — | Simulation ledger |

## Identity lifecycle

`NOT_STARTED → PENDING → IN_REVIEW → VERIFIED / REJECTED / NEEDS_UPDATE`

KYC is required before funding, investing, external wallet transfer, or withdrawal. SME onboarding additionally requires trade licence, directors, shareholders, UBOs, and authorised signatory checks. Store provider references and decisions; avoid retaining raw identity images when the provider can retain them.

## Money lifecycle

1. Request a signed quote for AED to USDC on Stellar.
2. Redirect to or embed the licensed provider checkout.
3. Accept only signed webhooks and process each provider event once.
4. Credit the internal wallet only after the provider reports a completed settlement.
5. Keep available, reserved, deployed, returned principal, and income balances separate.
6. For withdrawal, verify the destination and request an off-ramp or on-chain payout.
7. Reconcile provider order ID, internal ledger ID, and blockchain transaction hash.

## Sandbox access needed

### Sumsub

- Create a sandbox project and verification level.
- Obtain an app token and secret key.
- Configure a signed webhook endpoint.
- Test approved, rejected, resubmission, sanctions, and KYB/UBO cases.

### Transak

- Apply for a partner staging account.
- Obtain the API key and webhook secret and allow the test domain.
- Confirm AED availability and the exact AED to USDC-on-Stellar buy and sell routes using live configuration/quote endpoints; availability must not be hardcoded.
- Test completed, cancelled, expired, refunded, and failed orders.

### Circle

- Create a developer sandbox account and API key.
- Register and verify webhook notifications.
- Configure the Stellar deposit and payout route.
- Use it for Vartola treasury and settlement, not as a substitute for the end-user KYC decision.

### Stellar

- Create Testnet keypairs and fund them using Friendbot.
- Record real Testnet hashes only for submitted transactions.
- Simulate fees before submission and preserve idempotency keys.

## Production gate

No real money, stablecoin conversion, custody, or external wallet transfers may be enabled until the relevant provider contracts, UAE regulatory scope, client-money arrangement, AML policy, sanctions monitoring, data processing terms, and incident procedures are approved.
