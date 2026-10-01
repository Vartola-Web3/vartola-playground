#!/bin/bash
# Deploy Soroban contracts to Stellar Testnet

set -e

echo "🚀 Deploying AssetFi Soroban Contracts to Testnet..."

# Check if soroban CLI is installed
if ! command -v soroban &> /dev/null; then
    echo "❌ Soroban CLI not found. Install it with:"
    echo "cargo install --locked soroban-cli"
    exit 1
fi

# Set network
NETWORK="testnet"
echo "📡 Network: $NETWORK"

# Check for admin secret key
if [ -z "$ADMIN_SECRET_KEY" ]; then
    echo "⚠️  ADMIN_SECRET_KEY not set. Generating a new keypair..."
    soroban keys generate admin --network $NETWORK
    ADMIN_SECRET_KEY="admin"
fi

# Build contracts
echo "🔨 Building contracts..."
cd "$(dirname "$0")"
soroban contract build

echo ""
echo "📦 Deploying contracts..."

# Deploy facility contract
echo "1️⃣  Deploying facility_contract..."
FACILITY_CONTRACT_ID=$(soroban contract deploy \
    --wasm target/wasm32-unknown-unknown/release/facility_contract.wasm \
    --source $ADMIN_SECRET_KEY \
    --network $NETWORK)
echo "✅ Facility Contract ID: $FACILITY_CONTRACT_ID"

# Deploy pool contract
echo "2️⃣  Deploying pool_contract..."
POOL_CONTRACT_ID=$(soroban contract deploy \
    --wasm target/wasm32-unknown-unknown/release/pool_contract.wasm \
    --source $ADMIN_SECRET_KEY \
    --network $NETWORK)
echo "✅ Pool Contract ID: $POOL_CONTRACT_ID"

# Deploy subscription contract
echo "3️⃣  Deploying subscription_contract..."
SUBSCRIPTION_CONTRACT_ID=$(soroban contract deploy \
    --wasm target/wasm32-unknown-unknown/release/subscription_contract.wasm \
    --source $ADMIN_SECRET_KEY \
    --network $NETWORK)
echo "✅ Subscription Contract ID: $SUBSCRIPTION_CONTRACT_ID"

# Deploy payment distributor
echo "4️⃣  Deploying payment_distributor..."
PAYMENT_DISTRIBUTOR_ID=$(soroban contract deploy \
    --wasm target/wasm32-unknown-unknown/release/payment_distributor.wasm \
    --source $ADMIN_SECRET_KEY \
    --network $NETWORK)
echo "✅ Payment Distributor ID: $PAYMENT_DISTRIBUTOR_ID"

# Save contract IDs to .env
echo ""
echo "💾 Saving contract IDs to .env.soroban..."
cat > .env.soroban << EOF
# Soroban Contract IDs on Stellar Testnet
FACILITY_CONTRACT_ID=$FACILITY_CONTRACT_ID
POOL_CONTRACT_ID=$POOL_CONTRACT_ID
SUBSCRIPTION_CONTRACT_ID=$SUBSCRIPTION_CONTRACT_ID
PAYMENT_DISTRIBUTOR_ID=$PAYMENT_DISTRIBUTOR_ID
NETWORK=$NETWORK
DEPLOYED_AT=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
EOF

echo "✅ Deployment complete!"
echo ""
echo "📋 Contract IDs saved to .env.soroban"
echo "🔗 Add these to your .env.local file to use in the app"
echo ""
echo "Next steps:"
echo "1. Copy contract IDs to .env.local"
echo "2. Initialize contracts with admin addresses"
echo "3. Test contract interactions"
