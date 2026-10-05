# Vartola Soroban contracts

These contracts target Stellar Testnet only. `wallet_registry` and `facility_contract` are the Alpha financial contracts. They are implemented and unit-tested. They are not deployed, so this repository does not publish contract IDs. `pool_contract` and `subscription_contract` are earlier metadata records and are not the Alpha money path.

## Contracts

1. **facility_contract** - Asset financing facility management
2. **pool_contract** - Investment pool management  
3. **subscription_contract** - Investor subscription handling
4. **payment_distributor** - Distribute lease payments to investors

## Development

```bash
# Install Soroban CLI
cargo install --locked soroban-cli

# Build contracts
soroban contract build

# Deploy to testnet
soroban contract deploy \
  --wasm target/wasm32-unknown-unknown/release/facility_contract.wasm \
  --source <your-secret-key> \
  --network testnet
```

## Testnet status

Deployment is a next milestone, not a completed release. Mainnet is out of scope. VTAED, if issued, is a non-redeemable Testnet asset with no AED value.
