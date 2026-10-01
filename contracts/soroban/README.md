# AssetFi UAE - Soroban Smart Contracts (Phase 2)

This directory contains Soroban smart contracts for AssetFi UAE on Stellar Testnet.

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

## Testnet Deployment

All contracts are deployed to Stellar Testnet only for Phase 2 prototype.
