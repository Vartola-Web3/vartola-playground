# Soroban Contracts Deployment Guide

## Prerequisites

1. **Install Rust** (if not already installed):
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env
```

2. **Install Soroban CLI**:
```bash
cargo install --locked soroban-cli --features opt
```

3. **Add Wasm target**:
```bash
rustup target add wasm32-unknown-unknown
```

4. **Configure Stellar testnet**:
```bash
soroban network add \
  --global testnet \
  --rpc-url https://soroban-testnet.stellar.org:443 \
  --network-passphrase "Test SDF Network ; September 2015"
```

## Generate Admin Keypair

```bash
# Generate new keypair for admin
soroban keys generate admin --network testnet

# Get the public key
soroban keys address admin
```

**Important**: Fund the admin account with XLM for transaction fees:
- Visit https://laboratory.stellar.org/#account-creator?network=test
- Or use: `soroban keys fund admin --network testnet`

## Build Contracts

From the `contracts/soroban` directory:

```bash
# Build all contracts
soroban contract build

# This generates WASM files in:
# target/wasm32-unknown-unknown/release/*.wasm
```

## Deploy to Testnet

### Option 1: Automated Deployment

```bash
# Set admin secret key (or let script generate one)
export ADMIN_SECRET_KEY=admin

# Run deployment script
./deploy-testnet.sh
```

The script will:
1. Build all contracts
2. Deploy them to testnet
3. Save contract IDs to `.env.soroban`

### Option 2: Manual Deployment

Deploy each contract individually:

```bash
# 1. Facility Contract
FACILITY_ID=$(soroban contract deploy \
  --wasm target/wasm32-unknown-unknown/release/facility_contract.wasm \
  --source admin \
  --network testnet)
echo "Facility Contract: $FACILITY_ID"

# 2. Pool Contract  
POOL_ID=$(soroban contract deploy \
  --wasm target/wasm32-unknown-unknown/release/pool_contract.wasm \
  --source admin \
  --network testnet)
echo "Pool Contract: $POOL_ID"

# 3. Subscription Contract
SUBSCRIPTION_ID=$(soroban contract deploy \
  --wasm target/wasm32-unknown-unknown/release/subscription_contract.wasm \
  --source admin \
  --network testnet)
echo "Subscription Contract: $SUBSCRIPTION_ID"

# 4. Payment Distributor
PAYMENT_ID=$(soroban contract deploy \
  --wasm target/wasm32-unknown-unknown/release/payment_distributor.wasm \
  --source admin \
  --network testnet)
echo "Payment Distributor: $PAYMENT_ID"
```

## Initialize Contracts

After deployment, initialize each contract:

```bash
# Get admin address
ADMIN_ADDRESS=$(soroban keys address admin)

# Initialize Facility Contract
soroban contract invoke \
  --id $FACILITY_ID \
  --source admin \
  --network testnet \
  -- initialize \
  --admin $ADMIN_ADDRESS

# Initialize Pool Contract
soroban contract invoke \
  --id $POOL_ID \
  --source admin \
  --network testnet \
  -- initialize \
  --admin $ADMIN_ADDRESS

# Initialize Subscription Contract
soroban contract invoke \
  --id $SUBSCRIPTION_ID \
  --source admin \
  --network testnet \
  -- initialize \
  --admin $ADMIN_ADDRESS \
  --pool_contract $POOL_ID

# Initialize Payment Distributor
soroban contract invoke \
  --id $PAYMENT_ID \
  --source admin \
  --network testnet \
  -- initialize \
  --admin $ADMIN_ADDRESS \
  --facility_contract $FACILITY_ID \
  --subscription_contract $SUBSCRIPTION_ID
```

## Configure Application

Copy contract IDs to your application's `.env.local`:

```bash
# From .env.soroban (created by deploy script)
cat .env.soroban >> ../../.env.local
```

Or manually add:

```env
ENABLE_SOROBAN_CONTRACTS="true"
FACILITY_CONTRACT_ID="C..."
POOL_CONTRACT_ID="C..."
SUBSCRIPTION_CONTRACT_ID="C..."
PAYMENT_DISTRIBUTOR_ID="C..."
```

## Test Contract Invocation

Test that contracts are working:

```bash
# Test facility contract
soroban contract invoke \
  --id $FACILITY_ID \
  --source admin \
  --network testnet \
  -- get_facility_count

# Should return 0 initially
```

## Update Admin Config

In the app, go to `/admin/setup` and configure:
- Enable Soroban Contracts: `true`
- Paste contract IDs

## Troubleshooting

### Build Errors

```bash
# Clean and rebuild
cargo clean
soroban contract build
```

### Deployment Errors

**Insufficient Balance**:
- Fund admin account: `soroban keys fund admin --network testnet`

**Invalid Contract**:
- Ensure Soroban CLI version is compatible: `soroban --version`
- Try: `cargo install --locked soroban-cli --force`

**Network Issues**:
- Check testnet status: https://status.stellar.org
- Try different RPC: `--rpc-url https://soroban-testnet.stellar.org`

### Contract Not Found

If contract ID returns "not found":
- Wait 5-10 seconds after deployment (network propagation)
- Verify contract ID is correct
- Check deployment transaction: https://stellar.expert/explorer/testnet

## Contract Testing

Run Rust unit tests:

```bash
cd contracts/soroban
cargo test
```

## Upgrading Contracts

Soroban contracts are immutable. To upgrade:

1. Build new version
2. Deploy new contract (gets new ID)
3. Update contract IDs in app config
4. Migrate data if needed

## Production Considerations

⚠️ **This is Testnet Only - Prototype Quality**

For production:
- Conduct security audit
- Implement access control lists
- Add emergency pause mechanisms  
- Test extensively on testnet first
- Use hardware wallet for admin keys
- Implement upgrade patterns
- Add monitoring and alerting

## Resources

- [Soroban Docs](https://soroban.stellar.org/docs)
- [Stellar Laboratory](https://laboratory.stellar.org)
- [Stellar Expert](https://stellar.expert/explorer/testnet)
- [Soroban Examples](https://github.com/stellar/soroban-examples)
