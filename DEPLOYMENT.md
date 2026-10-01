# AssetFi UAE - Deployment & Configuration Guide

## Quick Start for Demo/Grant Review

### 1. Environment Setup

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Edit `.env.local` and set required values:

```env
# REQUIRED: Generate with openssl rand -base64 32
NEXTAUTH_SECRET="your-generated-secret-here"

# Database (SQLite - already configured)
DATABASE_URL="file:./prisma/dev.db"

# Stellar (Testnet by default)
STELLAR_NETWORK="testnet"
ENABLE_STELLAR_TESTNET="true"
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Database

```bash
npx prisma generate
npx prisma migrate deploy
npx prisma db seed
```

### 4. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:4200`.

### 5. Login with Seeded Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@assetfi.ae | admin123 |
| Underwriter | underwriter@assetfi.ae | underwriter123 |
| SME | ahmed@gulflogistics.ae | sme123 |
| Investor | khalid@investor.ae | investor123 |

---

## Admin Configuration (First Time Setup)

### 1. Login as Admin

Use `admin@assetfi.ae` / `admin123` (or create your own via `/register`).

### 2. Access Admin Setup Page

Navigate to `/admin/setup` in your browser.

### 3. Configure Platform Settings

#### Stellar Network
- **Network**: Keep on `testnet` for demo/grant
- **Horizon URL**: `https://horizon-testnet.stellar.org` (default)

⚠️ **Important**: Do NOT use mainnet for grant demo. Mainnet requires production compliance.

#### Firebase (Optional for MVP)
- **Project ID**: Your Firebase project ID
- Add service account credentials to `.env.local` if using Firestore

#### Integration Services
All services have stub implementations for demo:
- **Email Provider**: `console` (logs to console)
- **Payment Gateway**: `console` (stub)
- **AECB/KYB**: Stub implementation
- **File Storage**: `local` (./uploads directory)

### 4. Create Test Admin (Optional)

Click "Create Test Admin" to generate `setup@assetfi.ae` / `setup123` for easy testing.

---

## Configuration Keys

### Required Environment Variables

```env
# NextAuth - REQUIRED
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:4200"

# Database
DATABASE_URL="file:./prisma/dev.db"

# Stellar Network
STELLAR_NETWORK="testnet"
STELLAR_HORIZON_URL="https://horizon-testnet.stellar.org"
STELLAR_SOROBAN_RPC_URL="https://soroban-testnet.stellar.org"
ENABLE_STELLAR_TESTNET="true"
```

### Optional Services (Stubs for MVP)

```env
# File Storage
STORAGE_TYPE="local"
STORAGE_PATH="./uploads"
MAX_FILE_SIZE="10485760"

# Email
EMAIL_PROVIDER="console"
FROM_EMAIL="noreply@assetfi.ae"

# Payment Gateway
PAYMENT_PROVIDER="console"

# KYB/Credit Bureau
KYB_PROVIDER="console"
AECB_API_URL=""

# Firebase (optional)
FIREBASE_PROJECT_ID=""
FIREBASE_CLIENT_EMAIL=""
FIREBASE_PRIVATE_KEY=""
```

---

## Feature Flags

Control which features are enabled:

```env
ENABLE_STELLAR_TESTNET="true"        # Stellar SDK integration
ENABLE_EMAIL_NOTIFICATIONS="false"   # Email sending (stub)
ENABLE_SMS_NOTIFICATIONS="false"     # SMS (not implemented)
ENABLE_PAYMENT_GATEWAY="false"       # Payment processing (stub)
ENABLE_AECB_INTEGRATION="false"      # AECB credit checks (stub)
```

---

## Testing Flows

### 1. SME Application Flow

1. Login as SME: `ahmed@gulflogistics.ae` / `sme123`
2. Navigate to "New Application"
3. Fill in asset details (e.g., truck for AED 300,000)
4. Set contribution (e.g., AED 75,000 = 25%)
5. Upload documents (optional - stub)
6. Submit application
7. Risk engine automatically calculates scores

### 2. Underwriter Approval Flow

1. Login as Underwriter: `underwriter@assetfi.ae` / `underwriter123`
2. View pending applications
3. Click on an application to review
4. See risk scores (Company, Asset, Deal) and Tier
5. **Click "Approve"**:
   - Creates Facility record
   - Generates payment schedule (monthly installments)
   - Links to open investment pool
   - Calls Stellar testnet helpers (creates asset on-chain)
   - Updates pool raised amount
6. **Click "Reject"**:
   - Updates status to REJECTED
   - Logs audit trail
   - Does NOT create facility

### 3. Investor Flow

1. Login as Investor: `khalid@investor.ae` / `investor123`
2. Navigate to "My Wallet & Faucet"
3. Create Stellar testnet wallet
4. Request tAED tokens from faucet (10,000 tAED per request)
5. Browse available pools at `/investor/pools`
6. Click on a pool to view details
7. Subscribe with tAED tokens
8. View portfolio with distributions

### 4. Admin Operations

1. Login as Admin: `admin@assetfi.ae` / `admin123`
2. **Create Pool**: `/admin/pools` → "Create New Pool"
3. **Create User**: `/admin/users/create`
4. **View Audit Log**: `/admin/audit`
5. **Platform Config**: `/admin/setup`

---

## Stellar Testnet Integration

### Current Implementation

The app uses `@stellar/stellar-sdk` with the following behavior:

- **ENABLE_STELLAR_TESTNET=true**: Real Stellar SDK calls (with fallback to simulated hashes if network fails)
- **ENABLE_STELLAR_TESTNET=false**: Simulated transaction hashes only

### What Happens on Approval

When an underwriter approves an application:

1. **Risk Engine**: Recalculates scores server-side (never trusts client)
2. **Facility Creation**: 
   - Generates unique facility number
   - Calculates monthly payment amount
   - Calls `createFacilityOnStellar()` (lib/stellar/facility-operations.ts)
3. **Stellar Operations** (if enabled):
   - Creates asset token on Stellar testnet
   - Records transaction hash
   - Stores asset ID
4. **Payment Schedule**: Creates N monthly payment records
5. **Pool Funding**: Links facility to open pool, increments raised amount
6. **Audit Log**: Records all changes

---

## Risk Engine Configuration

### Server-Side Validation

The risk engine runs **server-side only** during:
- Application submission (initial calculation)
- Underwriter approval (re-computation with latest company data)

Weights and thresholds can be adjusted in `/lib/risk-engine/config.ts`:

```typescript
export const RISK_ENGINE_CONFIG = {
  companyWeights: {
    age: 0.15,
    revenue: 0.25,
    cashFlow: 0.25,
    debtRatio: 0.20,
    industry: 0.10,
    documents: 0.05,
  },
  assetWeights: {
    type: 0.30,
    age: 0.20,
    value: 0.20,
    condition: 0.15,
    liquidity: 0.15,
  },
  dealWeights: {
    company: 0.40,
    asset: 0.30,
    ltv: 0.15,
    term: 0.10,
    affordability: 0.05,
  },
  tierThresholds: {
    A: 81,
    B: 66,
    C: 51,
    D: 0,
  },
};
```

### Running Unit Tests

```bash
# Install test dependencies
npm install --save-dev jest @types/jest ts-jest

# Run risk engine tests
npm test -- lib/risk-engine/__tests__/risk-engine.test.ts
```

---

## Security Notes

### Encrypted Configuration

Platform configuration (from `/admin/setup`) is stored encrypted at rest:
- **Algorithm**: AES-256-GCM
- **Location**: `.platform-config/config.json`
- **Key**: Set `CONFIG_ENCRYPTION_KEY` in environment (or uses default)

⚠️ **Never commit** `.platform-config/` to git (already in .gitignore).

### No Plaintext Secrets

- All secrets in `.env.local` (not in git)
- Firebase credentials via environment variables
- Stellar keypairs generated per-user (stored in database)
- Platform config encrypted at rest

---

## Production Considerations

### NOT Production-Ready For Real Money

This is a **Stellar Testnet prototype** for grant/concept demonstration.

Before production deployment with real funds:

1. **Regulatory Compliance**:
   - CBUAE license (financing company)
   - ADGM/DFSA approval (tokenized securities)
   - Full KYC/AML implementation
   - Licensed payment processor

2. **Security Hardening**:
   - Third-party security audit
   - Penetration testing
   - Rate limiting and DDoS protection
   - WAF (Web Application Firewall)
   - HSM for key management

3. **Infrastructure**:
   - Multi-region deployment
   - Database replication
   - Automated backups
   - Monitoring and alerting
   - Load balancing

4. **Integrations**:
   - Real AECB API access
   - Licensed payment gateway (Stripe, Checkout.com)
   - Professional object storage (S3, GCS)
   - Transactional email service (SendGrid, SES)
   - SMS provider for 2FA

5. **Stellar Mainnet**:
   - Review all Soroban contracts
   - External smart contract audit
   - Mainnet deployment checklist
   - Proper key management
   - Multi-sig for admin operations

---

## Support & Documentation

### In-App Guidelines

All configuration fields have in-app help text and guidelines in `/admin/setup`.

### Demo Videos & Screenshots

Use `/investor/wallet` faucet flow to demo tAED token acquisition.

### File Structure

```
/workspace
├── app/
│   ├── (auth)/             # Login, register
│   ├── sme/                # SME portal (applications, facilities)
│   ├── investor/           # Investor portal (pools, wallet, faucet)
│   ├── underwriter/        # Underwriter dashboard (review, approve)
│   ├── admin/              # Admin panel (pools, users, audit, setup)
│   └── api/                # API routes
├── lib/
│   ├── risk-engine/        # Risk scoring (with tests)
│   ├── stellar/            # Stellar SDK integration
│   ├── services/           # Email, storage, payment, KYB stubs
│   └── config/             # Platform configuration (encrypted)
├── prisma/
│   ├── schema.prisma       # Database schema
│   └── seed.ts             # Demo data (truck application)
└── docs/                   # Architecture & design docs
```

---

## Troubleshooting

### Database Issues

```bash
# Reset database (CAREFUL - deletes all data)
rm prisma/dev.db
npx prisma migrate deploy
npx prisma db seed
```

### Stellar Connection Issues

If Stellar testnet is unreachable:
- Set `ENABLE_STELLAR_TESTNET="false"` to use simulated hashes
- Check Stellar testnet status: https://status.stellar.org

### Port Already in Use

The app runs on port 4200 by default. To change:

```json
// package.json
"scripts": {
  "dev": "next dev -p 3000"
}
```

### Missing Dependencies

```bash
npm install
npx prisma generate
```

---

## Grant Review Checklist

✅ **Phase 1 Scope Complete**:
- [x] Wire SME routes with write APIs (create/update application)
- [x] Wire admin routes (pools, audit log)
- [x] Underwriter approve creates Facility + payment schedule + pool linkage + Stellar calls
- [x] Investor subscribe UI + API
- [x] Pool browse/detail + wallet/faucet/tAED mint
- [x] Admin create user, manage pools, full audit log
- [x] .env.example with NEXTAUTH_SECRET
- [x] Enforce roles in middleware (not just page checks)
- [x] Registration flow with basic KYC fields
- [x] Risk engine runs on submit + server-side recompute on approve
- [x] Admin weight-config (editable in config.ts)
- [x] Risk engine unit tests
- [x] Replace Stellar stubs with @stellar/stellar-sdk testnet
- [x] Stub implementations: storage, AECB/KYB, payment, email
- [x] Admin Firebase setup page with encrypted config
- [x] README + in-app admin guidelines

---

**Built for Stellar Community Fund Grant Application**  
**Testnet Only - No Real Funds - Demo/Prototype**
