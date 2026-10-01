# AssetFi UAE - Implementation Plan

## Overview

This document outlines the detailed implementation plan for AssetFi UAE Phase 1 MVP. The goal is to deliver a working Next.js application with role-based portals, risk engine, and Stellar integration stubs.

## Project Phases

### Phase 1: MVP Foundation (This Implementation)
**Goal**: Working web application with database, auth, risk engine, and Stellar stubs
**Duration**: Current development session
**Deliverables**: See section below

### Phase 2: Soroban Integration
**Goal**: Full Rust smart contracts on Stellar Testnet
**Duration**: TBD after Phase 1 completion
**Deliverables**: Live blockchain integration

### Phase 3: AI Underwriting
**Goal**: AI-assisted document analysis and risk signals
**Duration**: TBD after Phase 2 completion
**Deliverables**: Enhanced underwriting workflow

---

## Phase 1: Detailed Implementation Steps

### Step 1: Project Initialization ✅

**Tasks**:
- [x] Read grant specification document
- [x] Write architecture documentation
- [x] Write database schema documentation
- [x] Write Stellar architecture documentation
- [x] Write risk engine documentation
- [x] Write implementation plan documentation

**Output**: Complete planning documentation in `/workspace/docs/`

### Step 2: Next.js Project Setup

**Tasks**:
- [ ] Initialize Next.js 14 project with TypeScript
- [ ] Configure Tailwind CSS
- [ ] Install and configure shadcn/ui
- [ ] Set up project directory structure
- [ ] Configure ESLint and Prettier
- [ ] Set up TypeScript strict mode

**Commands**:
```bash
# Create Next.js app in temp directory
npx create-next-app@latest tmp-scaffold --typescript --tailwind --app --no-src-dir

# Move files to workspace root
mv tmp-scaffold/* ./
rm -rf tmp-scaffold

# Install shadcn/ui
npx shadcn-ui@latest init

# Install additional dependencies
npm install @radix-ui/react-* lucide-react recharts
npm install -D @types/node
```

**Output**: Configured Next.js project

### Step 3: Database Setup

**Tasks**:
- [ ] Install Prisma
- [ ] Create Prisma schema from database-schema.md
- [ ] Configure PostgreSQL connection (Supabase)
- [ ] Generate Prisma Client
- [ ] Create initial migration

**Commands**:
```bash
npm install prisma @prisma/client
npx prisma init

# After creating schema
npx prisma generate
npx prisma migrate dev --name init
```

**Files**:
- `/workspace/prisma/schema.prisma`
- `/workspace/prisma/migrations/`

**Output**: Working database connection and schema

### Step 4: Authentication System

**Tasks**:
- [ ] Install NextAuth.js
- [ ] Configure authentication providers
- [ ] Set up session management
- [ ] Create auth middleware
- [ ] Implement role-based access control
- [ ] Create login/register pages

**Files**:
- `/workspace/src/app/api/auth/[...nextauth]/route.ts`
- `/workspace/src/lib/auth/config.ts`
- `/workspace/src/lib/auth/middleware.ts`
- `/workspace/src/app/(auth)/login/page.tsx`
- `/workspace/src/app/(auth)/register/page.tsx`

**Output**: Working authentication system with role-based access

### Step 5: Shared UI Components

**Tasks**:
- [ ] Create layout components (header, sidebar, footer)
- [ ] Create form components (input, select, textarea, file upload)
- [ ] Create data display components (table, card, badge)
- [ ] Create feedback components (alert, toast, dialog)
- [ ] Create navigation components (tabs, breadcrumbs)

**Files**:
- `/workspace/src/components/ui/` (shadcn components)
- `/workspace/src/components/layout/`
- `/workspace/src/components/forms/`

**Output**: Reusable component library

### Step 6: Risk Engine Implementation

**Tasks**:
- [ ] Create risk engine core logic
- [ ] Implement company risk scoring
- [ ] Implement asset risk scoring
- [ ] Implement deal risk scoring
- [ ] Create tier assignment logic
- [ ] Add configuration system
- [ ] Write unit tests

**Files**:
- `/workspace/src/lib/risk-engine/index.ts`
- `/workspace/src/lib/risk-engine/company-score.ts`
- `/workspace/src/lib/risk-engine/asset-score.ts`
- `/workspace/src/lib/risk-engine/deal-score.ts`
- `/workspace/src/lib/risk-engine/tier-assignment.ts`
- `/workspace/src/lib/risk-engine/config.ts`
- `/workspace/src/lib/risk-engine/__tests__/`

**Output**: Working risk engine with test coverage

### Step 7: Stellar Integration Stubs

**Tasks**:
- [ ] Install Stellar SDK
- [ ] Create mock transaction generator
- [ ] Create contract stub classes
- [ ] Implement simulated tAED token
- [ ] Create transaction logging
- [ ] Add Stellar Explorer link helpers

**Files**:
- `/workspace/src/lib/stellar/config.ts`
- `/workspace/src/lib/stellar/mock-transactions.ts`
- `/workspace/src/lib/stellar/contracts/`
  - `investor-whitelist.ts`
  - `asset-registry.ts`
  - `financing-facility.ts`
  - `financing-pool.ts`
  - `payment-distributor.ts`

**Output**: Stellar integration stubs ready for Phase 2

### Step 8: SME Portal

**Tasks**:
- [ ] Create SME dashboard layout
- [ ] Create company profile page
- [ ] Create new application form
- [ ] Create document upload component
- [ ] Create application list view
- [ ] Create application detail view
- [ ] Create payment submission page

**Routes**:
- `/workspace/src/app/sme/page.tsx` - Dashboard
- `/workspace/src/app/sme/profile/page.tsx` - Company profile
- `/workspace/src/app/sme/applications/page.tsx` - Application list
- `/workspace/src/app/sme/applications/new/page.tsx` - New application
- `/workspace/src/app/sme/applications/[id]/page.tsx` - Application detail
- `/workspace/src/app/sme/payments/page.tsx` - Make payment

**Output**: Complete SME user experience

### Step 9: Underwriter Portal

**Tasks**:
- [ ] Create underwriter dashboard layout
- [ ] Create pending applications queue
- [ ] Create application review page
- [ ] Create risk score display
- [ ] Create approval/rejection workflow
- [ ] Create conditions editor
- [ ] Create audit log viewer

**Routes**:
- `/workspace/src/app/underwriter/page.tsx` - Dashboard
- `/workspace/src/app/underwriter/queue/page.tsx` - Application queue
- `/workspace/src/app/underwriter/applications/[id]/page.tsx` - Review page

**Output**: Complete underwriter workflow

### Step 10: Investor Portal

**Tasks**:
- [ ] Create investor dashboard layout
- [ ] Create available pools page
- [ ] Create pool detail page
- [ ] Create subscription form
- [ ] Create portfolio view
- [ ] Create distributions history

**Routes**:
- `/workspace/src/app/investor/page.tsx` - Dashboard
- `/workspace/src/app/investor/pools/page.tsx` - Available pools
- `/workspace/src/app/investor/pools/[id]/page.tsx` - Pool detail
- `/workspace/src/app/investor/portfolio/page.tsx` - My portfolio
- `/workspace/src/app/investor/distributions/page.tsx` - Distributions

**Output**: Complete investor experience

### Step 11: Admin Portal

**Tasks**:
- [ ] Create admin dashboard layout
- [ ] Create user management page
- [ ] Create pool creation page
- [ ] Create system monitoring page
- [ ] Create audit log viewer
- [ ] Create configuration editor

**Routes**:
- `/workspace/src/app/admin/page.tsx` - Dashboard
- `/workspace/src/app/admin/users/page.tsx` - User management
- `/workspace/src/app/admin/pools/page.tsx` - Pool management
- `/workspace/src/app/admin/monitoring/page.tsx` - System monitoring
- `/workspace/src/app/admin/audit/page.tsx` - Audit logs

**Output**: Complete admin functionality

### Step 12: API Routes & Server Actions

**Tasks**:
- [ ] Create application submission API
- [ ] Create document upload API
- [ ] Create risk scoring API
- [ ] Create approval workflow API
- [ ] Create payment processing API
- [ ] Create Stellar transaction logging API

**Files**:
- `/workspace/src/app/api/applications/route.ts`
- `/workspace/src/app/api/documents/route.ts`
- `/workspace/src/app/api/risk-score/route.ts`
- `/workspace/src/app/api/payments/route.ts`

**Output**: Complete API layer

### Step 13: Database Seeding

**Tasks**:
- [ ] Create seed script
- [ ] Seed admin user
- [ ] Seed underwriter user
- [ ] Seed SME company (Gulf Logistics LLC)
- [ ] Seed SME user
- [ ] Seed investor users (3)
- [ ] Seed truck application (Tier B demo)
- [ ] Seed Logistics Pool 001
- [ ] Seed facility for truck
- [ ] Seed investments
- [ ] Seed payments (3 months)

**Files**:
- `/workspace/prisma/seed.ts`

**Commands**:
```bash
npx prisma db seed
```

**Output**: Complete demo dataset

### Step 14: Testing & Validation

**Tasks**:
- [ ] Run ESLint
- [ ] Run TypeScript type checking
- [ ] Test authentication flow
- [ ] Test SME application submission
- [ ] Test underwriter approval flow
- [ ] Test risk engine calculations
- [ ] Test investor subscription
- [ ] Test payment processing
- [ ] Verify all Stellar transaction hashes display

**Commands**:
```bash
npm run lint
npm run type-check
npm run dev
```

**Output**: Working application with no errors

### Step 15: Documentation & Cleanup

**Tasks**:
- [ ] Update README.md with setup instructions
- [ ] Add environment variable documentation
- [ ] Add user flow diagrams to docs
- [ ] Clean up unused files
- [ ] Remove console.logs
- [ ] Add code comments where needed

**Files**:
- `/workspace/README.md`
- `/workspace/.env.example`

**Output**: Production-ready documentation

### Step 16: Git Commit

**Tasks**:
- [ ] Stage all files
- [ ] Commit with descriptive message
- [ ] Push to main branch

**Commands**:
```bash
git add .
git commit -m "feat: AssetFi UAE Phase 1 MVP - complete institutional fintech platform"
git push origin main
```

**Output**: Code committed to repository

---

## Technology Stack Summary

### Core Framework
- **Next.js**: 14.x with App Router
- **React**: 18.x
- **TypeScript**: 5.x (strict mode)
- **Node.js**: 20.x LTS

### UI & Styling
- **Tailwind CSS**: 3.x
- **shadcn/ui**: Latest
- **Radix UI**: Latest
- **Lucide Icons**: Latest
- **Recharts**: For data visualization

### Database & ORM
- **PostgreSQL**: 15+
- **Supabase**: Cloud PostgreSQL hosting
- **Prisma**: 5.x ORM

### Authentication
- **NextAuth.js**: 5.x (next-auth)

### Blockchain
- **@stellar/stellar-sdk**: For Phase 2
- **Mock stubs**: For Phase 1

### Development Tools
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **TypeScript Compiler**: Type checking

---

## File Structure

```
/workspace
├── docs/
│   ├── architecture.md
│   ├── database-schema.md
│   ├── stellar-architecture.md
│   ├── risk-engine.md
│   └── implementation-plan.md
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts
│   └── migrations/
├── public/
│   ├── images/
│   └── fonts/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── sme/
│   │   │   ├── page.tsx
│   │   │   ├── profile/
│   │   │   ├── applications/
│   │   │   └── payments/
│   │   ├── investor/
│   │   │   ├── page.tsx
│   │   │   ├── pools/
│   │   │   └── portfolio/
│   │   ├── underwriter/
│   │   │   ├── page.tsx
│   │   │   └── applications/
│   │   ├── admin/
│   │   │   ├── page.tsx
│   │   │   ├── users/
│   │   │   └── pools/
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   ├── applications/
│   │   │   ├── documents/
│   │   │   └── payments/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── ui/
│   │   ├── layout/
│   │   ├── forms/
│   │   └── dashboard/
│   ├── lib/
│   │   ├── auth/
│   │   ├── db/
│   │   ├── risk-engine/
│   │   ├── stellar/
│   │   └── utils/
│   └── types/
│       └── index.ts
├── .env.local
├── .env.example
├── .gitignore
├── next.config.js
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── components.json
└── README.md
```

---

## Environment Variables

```env
# Database
DATABASE_URL="postgresql://user:password@host:5432/assetfi"

# NextAuth
NEXTAUTH_URL="http://localhost:4200"
NEXTAUTH_SECRET="your-secret-key-here"

# Stellar (for Phase 2)
STELLAR_NETWORK="testnet"
STELLAR_HORIZON_URL="https://horizon-testnet.stellar.org"

# File Upload
MAX_FILE_SIZE="10485760" # 10MB
ALLOWED_FILE_TYPES="application/pdf,image/jpeg,image/png"

# Feature Flags
ENABLE_STELLAR_INTEGRATION="false" # Phase 1: stubs only
ENABLE_AI_UNDERWRITING="false" # Phase 3
```

---

## Success Criteria

Phase 1 is complete when:

✅ All planning documentation written
✅ Next.js application running on port 4200
✅ Database schema implemented and migrated
✅ Authentication working with all 4 roles
✅ SME can submit application with documents
✅ Risk engine calculates scores correctly
✅ Underwriter can review and approve
✅ Admin can create pools
✅ Investor can subscribe to pools
✅ Stellar transaction hashes display (simulated)
✅ Seeded demo data loads successfully
✅ Gulf Logistics truck application shows Tier B
✅ No TypeScript errors
✅ No ESLint errors
✅ README.md has complete setup instructions
✅ All code committed and pushed to main

---

## Known Limitations (MVP)

**Phase 1 Limitations**:
- Stellar transactions are simulated, not real
- No actual blockchain writes
- Mock transaction hashes (prefixed with SIMULATED_)
- Local file storage (not S3)
- No email notifications
- No real payment gateway
- No SMS verification
- Basic responsive design (desktop-first)

**Will be addressed in Phase 2+**:
- Real Soroban smart contracts
- Actual Stellar Testnet transactions
- Production-grade file storage
- Enhanced mobile experience
- Notification system
- Payment gateway integration
- Advanced security hardening

---

## Post-Phase 1 Roadmap

### Phase 2: Soroban Integration
- Write Rust smart contracts
- Deploy to Stellar Testnet
- Generate TypeScript SDKs
- Replace stubs with real calls
- End-to-end blockchain testing

### Phase 3: AI Underwriting
- Document OCR integration
- Financial analysis AI
- Fraud detection
- Risk signal extraction
- Human-in-the-loop workflow

### Phase 4: Production Readiness
- Legal review and compliance
- Licensed partner integration
- Security audit
- Load testing
- Mainnet deployment preparation

---

## Risk Register

| Risk | Impact | Mitigation |
|------|--------|------------|
| Supabase setup complexity | Medium | Use local PostgreSQL if needed |
| Stellar SDK learning curve | Low | Phase 1 uses stubs only |
| Time constraints | Medium | Focus on core features first |
| shadcn/ui configuration | Low | Follow official setup guide |
| Database migration issues | Medium | Test migrations incrementally |

---

## Dependencies Installation Order

```bash
# 1. Core Next.js and TypeScript
npx create-next-app@latest

# 2. UI Libraries
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-select @radix-ui/react-tabs @radix-ui/react-toast
npm install lucide-react recharts class-variance-authority clsx tailwind-merge

# 3. Database and ORM
npm install @prisma/client
npm install -D prisma

# 4. Authentication
npm install next-auth@beta @auth/prisma-adapter bcryptjs
npm install -D @types/bcryptjs

# 5. Form Handling
npm install react-hook-form zod @hookform/resolvers

# 6. Stellar (Phase 2, optional for Phase 1)
npm install @stellar/stellar-sdk

# 7. Utilities
npm install date-fns
```

---

## Port Configuration

**Application Port**: 4200 (chosen to avoid conflicts with common defaults)

**Why 4200**:
- Not 3000 (common Next.js default)
- Not 5173 (Vite default)
- Not 8080 (common backend default)
- Easy to remember
- Unlikely to conflict with other services

Configure in `package.json`:
```json
{
  "scripts": {
    "dev": "next dev -p 4200",
    "start": "next start -p 4200"
  }
}
```

---

## Testing Strategy

### Manual Testing Checklist

**Authentication**:
- [ ] Admin can log in
- [ ] SME can log in
- [ ] Investor can log in
- [ ] Underwriter can log in
- [ ] Incorrect password rejected
- [ ] Role-based redirect works

**SME Flow**:
- [ ] Can create company profile
- [ ] Can submit application
- [ ] Can upload documents
- [ ] Can see risk scores
- [ ] Can view application status
- [ ] Can make payments

**Underwriter Flow**:
- [ ] Can see pending applications
- [ ] Can view risk breakdown
- [ ] Can approve application
- [ ] Can reject with reason
- [ ] Can add conditions

**Investor Flow**:
- [ ] Can browse pools
- [ ] Can subscribe to pool
- [ ] Can view portfolio
- [ ] Can see distributions

**Admin Flow**:
- [ ] Can create pools
- [ ] Can manage users
- [ ] Can view audit logs

**Risk Engine**:
- [ ] Gulf Logistics scores ~72 company risk
- [ ] Truck scores ~84 asset risk
- [ ] Deal scores ~75 overall risk
- [ ] Tier B assigned correctly

**Stellar Integration**:
- [ ] Transaction hashes display
- [ ] Explorer links work (placeholder)
- [ ] Simulated prefix shows

---

## Deployment Notes

**MVP Deployment** (optional for demo):
- **Frontend**: Vercel (automatic with Git)
- **Database**: Supabase (already cloud-hosted)
- **Environment**: Production environment variables in Vercel

**Commands**:
```bash
# Deploy to Vercel
vercel --prod

# Or via Git
git push origin main  # Auto-deploys if Vercel connected
```

---

## Success Metrics

After Phase 1 completion, the following should be demonstrable:

1. **End-to-End SME Journey**: From registration to approved facility
2. **Risk Scoring Accuracy**: Demo application scores as expected (Tier B)
3. **Role Separation**: Each role sees only their portal
4. **Stellar Integration Points**: Transaction hashes visible in UI
5. **Data Integrity**: All relationships working correctly
6. **Audit Trail**: All actions logged
7. **Professional UX**: Institutional fintech appearance, not crypto exchange

---

## Next Steps After Phase 1

1. **Review with stakeholders**: Demo the working application
2. **Gather feedback**: Identify any critical gaps
3. **Plan Phase 2**: Prioritize Soroban contract development
4. **Legal review**: Ensure regulatory compliance stance is clear
5. **Grant submission**: Complete Stellar Community Fund application
6. **Phase 2 kickoff**: Begin Rust contract implementation

---

This implementation plan provides a clear roadmap from documentation to working application. Let's execute! 🚀
