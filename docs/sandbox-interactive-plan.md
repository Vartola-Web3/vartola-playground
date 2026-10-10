# Vartola — Interactive Sandbox Plan (execution-ready design)

Status: proposed design for implementation. Companion to `docs/audit-2026-10-10.md` (section 6).
Scope: turn `/sandbox` from a static page into an isolated, interactive sandbox with no real money and no effect on the shared Demo data.

---

## 1. Goals and non-goals

**Goals**
- A visitor (no account) runs a full facility lifecycle: SME application → underwriting → funding → controlled release → delivery → repayment → distribution → then a branch (early settlement / default and recovery / supplier failure / insurance event).
- Role switching (SME / investor / underwriter / operations / supplier) within one session.
- A simulation clock to advance time and pay installments.
- A downloadable evidence pack (financial state, positions, event log, reconciliation).
- Full isolation + one-click reset.
- Reuse the same waterfall engine and lifecycle rules used by the platform (credibility).

**Non-goals (out of this phase)**
- Real money or Mainnet.
- Real Soroban execution per session (later optional phase).
- Durable storage of visitor states.
- Real personal data.

---

## 2. Design principles

1. **Never touch the shared platform tables.** The sandbox is a fully separate world.
2. **The engine is pure functions.** Testable without a database and without a network.
3. **A session = one row holding a JSON snapshot.** Isolation is structural, and reset = replacing the snapshot.
4. **The same maths.** `lib/finance/waterfall-v2.ts` + `lib/lifecycle/rules.ts` + `lib/alpha/money.ts`.
5. **Determinism.** Same inputs + same seed ⇒ same outputs (reproducible).
6. **Boundaries are explicit in the UI.** Banner: "Simulation · no real money · illustrative numbers".

---

## 3. Architecture — options and decision

| Option | Description | Isolation | Reset | Risk | Effort | Verdict |
| --- | --- | --- | --- | --- | --- | --- |
| A. Shared space + `sandboxId` column | Add a column to every table and filter every query | Medium | Fragile | **High** (edits every lifecycle function) | Large | ❌ |
| B. One SQLite file per session | A separate DB copy per visitor via a dynamic Prisma datasource | Full | Good | Medium (file cleanup; the engine must accept a client) | Medium | 🔶 Alternative |
| **C. In-memory simulation engine + one session table** | The whole simulated world in JSON, pure functions, one `SandboxSession` row | **Full** | **Instant** | **Low** | Medium | ✅ **Recommended** |

**Decision:** Option C. The sandbox exists to demonstrate and explore, not to persist. Keeping state in a JSON snapshot in a single row gives structural isolation without touching any existing table, makes reset trivial, and lets us reuse `waterfall-v2`/`rules` as-is.

The core reason to reject A: `lib/lifecycle/service.ts` and `lib/alpha/lifecycle.ts` read the global `prisma` directly; threading a `sandboxId` means editing dozens of queries and every money path — an unjustified regression risk.

> **Option B** stays available if we later want to exercise the real schema precisely. We do not start with it.

---

## 4. Data model (the snapshot and the table)

### 4.1 One Prisma table (additive only; touches no existing table)

```prisma
// A fully isolated sandbox world. One row per visitor session. No relations to platform tables.
model SandboxSession {
  id          String   @id @default(cuid())
  scenarioKey String   @map("scenario_key")   // normal | early | late | default | supplier | insurance
  state       String                            // JSON: the full world snapshot
  version     Int      @default(1)              // snapshot shape version (for upgrades)
  step        Int      @default(0)              // last applied action (audit/resume)
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")
  expiresAt   DateTime @map("expires_at")       // auto-delete

  @@index([expiresAt])
  @@map("sandbox_sessions")
}
```

### 4.2 Snapshot shape (`lib/sandbox/state.ts`)

```ts
export type SandboxRole = 'SME' | 'INVESTOR' | 'UNDERWRITER' | 'OPERATIONS' | 'SUPPLIER';

export type ConditionState = 'PENDING' | 'VERIFIED' | 'WAIVED';
export type CheckState = 'PENDING' | 'VERIFIED';
export type FacilityPhase =
  | 'APPLICATION' | 'UNDER_REVIEW' | 'APPROVED' | 'POOL_OPEN' | 'FUNDING'
  | 'FULLY_FUNDED' | 'RELEASE_READY' | 'RELEASED' | 'DELIVERY_PENDING'
  | 'ACTIVE' | 'LATE' | 'DEFAULTED' | 'RECOVERED' | 'COMPLETED' | 'SETTLED';

export type Wallet = { available: number; reserved: number; deployed: number };

export type SandboxState = {
  version: 1;
  scenarioKey: string;
  seed: number;                 // determinism
  clock: string;                // simulation date (ISO)
  phase: FacilityPhase;
  actor: SandboxRole;           // active role
  facility: {
    id: string; facilityNo: string;
    financeAmount: number; termMonths: number; monthlyPayment: number;
    serviceFeeRateBps: number; reserveRateBps: number; reserveTarget: number;
    units: number; unitValue: number; priorityOrder: number;
  };
  pool: { id: string; poolNo: string; target: number; raised: number; status: string };
  sme:      { id: string; name: string; wallet: Wallet; contribution: number };
  investors:Array<{ id: string; name: string; wallet: Wallet; units: number;
                    principalReturned: number; incomeReceived: number; recoveryReceived: number }>;
  supplier: { id: string; name: string; kyb: 'APPROVED' | 'PENDING'; wallet: Wallet; approved: boolean };
  conditions: Array<{ type: string; label: string; status: ConditionState; verifiedAt?: string }>;
  checks:     Array<{ type: string; label: string; status: CheckState }>;
  payments: Array<{ no: number; dueDate: string; amount: number; principal: number; income: number;
                    serviceFee: number; reserve: number; status: 'SCHEDULED'|'PAID'|'LATE'|'MISSED'; paidAt?: string }>;
  distributions: Array<{ paymentNo: number; investorId: string; principal: number; income: number }>;
  ledger: Array<{ at: string; actor: SandboxRole; type: string; amount: number; direction: 'IN'|'OUT'; note: string }>;
  timeline: Array<{ at: string; type: string; detail: string; proofId?: string }>; // lifecycle events
  flags: { defaulted: boolean; recovered: boolean; settled: boolean };
};
```

**Note:** `seed` + `clock` make results deterministic and reproducible. `ledger`/`timeline` are the audit trail and the evidence pack.

---

## 5. Simulation engine (pure functions)

New files under `lib/sandbox/`:

| File | Responsibility |
| --- | --- |
| `state.ts` | Snapshot types + `initialState(scenarioKey)` |
| `scenarios.ts` | The six scenario definitions (imports the texts from `lib/finance/scenarios.ts` and extends them into playable steps) |
| `engine.ts` | Pure functions: `nextActions(state)`, `applyAction(state, action)`, `projectState(state)` |
| `reducer.ts` | Action dispatcher + valid-transition check (state machine) |
| `evidence.ts` | Builds the evidence pack (JSON + summary) |
| `store.ts` | Read/write `SandboxSession` (create, get, reset, delete, purge expired) |
| `actions.ts` | Catalogue of actions available per role and phase |

**Reuse:**
- Waterfall and maths: `splitRepayment`, `splitSettlement`, `splitRecovery`, `distributeByUnits` from `lib/finance/waterfall-v2.ts`.
- Rules: `RELEASE_CONDITIONS`, `ACTIVATION_CHECKS`, `isReady` from `lib/lifecycle/rules.ts`.
- Money: `vtaedToStroops`, `stroopsToVtaed`, `principalComponent`, `incomeComponent`, `platformFee`, `reserveAmount`, `settlementAmount` from `lib/alpha/money.ts`.
- Clock: logic similar to `simulationDate`/`setSimulationDate`, but inside the snapshot rather than `SystemSettings`.

**Engine contract:**
```ts
export type SandboxAction =
  | { type: 'SET_ACTOR'; role: SandboxRole }
  | { type: 'SUBMIT_APPLICATION' }
  | { type: 'UNDERWRITE_APPROVE' } | { type: 'UNDERWRITE_REJECT'; reason: string }
  | { type: 'OPEN_POOL' }
  | { type: 'INVEST'; investorId: string; amount: number }
  | { type: 'FUND_CONTRIBUTION' }              // SME contribution
  | { type: 'ATTEST_CONDITION'; conditionType: string }
  | { type: 'VERIFY_CHECK'; checkType: string }
  | { type: 'LOCK_RELEASE' } | { type: 'AUTHORIZE_RELEASE' } | { type: 'RELEASE_TO_SUPPLIER' }
  | { type: 'ADVANCE_TIME'; days: number }
  | { type: 'PAY_INSTALLMENT' }
  | { type: 'SETTLE_EARLY' }
  | { type: 'MARK_LATE' } | { type: 'MARK_DEFAULT' } | { type: 'RECOVER'; proceeds: number }
  | { type: 'SUPPLIER_FAIL'; resolution: 'REPLACE' | 'REFUND' | 'CANCEL' }
  | { type: 'INSURANCE_EVENT'; claim: number };

export function applyAction(state: SandboxState, action: SandboxAction): SandboxState;

export type AvailableAction = { id: string; label: string; role: SandboxRole; kind: 'primary'|'risk'; enabled: boolean; hint?: string };
export function nextActions(state: SandboxState): AvailableAction[];
```

Every action checks the active role, the allowed current phase, and the limits (e.g. `isReady` before release, the installment amount before payment). Any invalid transition throws a clear error.

---

## 6. Session model

- **Create:** `POST /api/sandbox/session` creates a row with the initial state for the requested scenario (default `normal`), `expiresAt = now + 24h`. A signed `sbx_sid` cookie (httpOnly, SameSite=Lax) identifies the session.
- **Ownership:** no account. The session is bound to the session cookie; a visitor cannot reach another session by knowing the id alone (the cookie is verified).
- **Single visitor session:** if a valid, unexpired cookie exists, it is reused instead of creating a new one.
- **Reset:** `POST /api/sandbox/session/[id]/reset` → `state = initialState(scenarioKey)`, `step = 0`.
- **Change scenario:** `POST /api/sandbox/session/[id]/scenario` → re-initialises with a new scenario.
- **Expiry/cleanup:** manual `DELETE` + a cleanup worker (added to `app/api/cron/reconcile` or a separate cron, or lazy deletion on the first request after expiry).
- **Limits:** a cap on active sessions (e.g. 500); refuse new ones at the cap with a friendly message.

---

## 7. API routes

| Method | Path | Function | Protection |
| --- | --- | --- | --- |
| `POST` | `/api/sandbox/session` | Create/retrieve a session | rate limit (5/min/IP) |
| `GET` | `/api/sandbox/session/[id]` | Get the snapshot + available actions | session cookie |
| `POST` | `/api/sandbox/session/[id]/action` | Apply one action | cookie + rate limit (60/min) |
| `POST` | `/api/sandbox/session/[id]/reset` | Reset | cookie |
| `POST` | `/api/sandbox/session/[id]/scenario` | Switch scenario | cookie |
| `GET` | `/api/sandbox/session/[id]/evidence` | Download the evidence pack (JSON) | cookie |
| `DELETE` | `/api/sandbox/session/[id]` | End | cookie |

**Response shape:** full state + `nextActions` (so transition rules are not computed in the UI — the UI is display only).

```json
{ "state": { "...": "..." }, "actions": [ { "id": "RELEASE_TO_SUPPLIER", "label": "Release to supplier", "role": "OPERATIONS", "kind": "primary", "enabled": true } ] }
```

`rateLimit` is reused from `lib/security/rate-limit.ts` (note it is per-instance in memory — sufficient to start).

---

## 8. Screens and UX

Replace the static `app/sandbox/page.tsx` with an interactive app (React client + API routes):
- **Header:** "Simulation · no real money · illustrative numbers" banner + scenario picker + "Reset" button.
- **Right — lifecycle stepper:** phases from `APPLICATION` to the end, the current phase highlighted and prior ones ticked.
- **Centre — live state panels:** financial (finance amount, units, installment, principal/income/reserve), asset (delivered/registered/insured), chain/certificate (simulation events), and wallets (SME/supplier/investors).
- **Left — actions panel:** `nextActions` buttons for the active role; disabled actions show their reason (hint). A role switcher at the top.
- **Bottom — timeline + ledger:** the `timeline` and `ledger` loops.
- **Clock control:** "advance a week/month" buttons to generate dues and pay installments.
- **Evidence pack:** a download button.
- **Mobile:** the stepper and panels stack vertically.

The six current scenario descriptions are kept as picker cards at the top of the page, reusing the same texts.

---

## 9. Playable scenarios

Built from the current `lib/finance/scenarios.ts` and made runnable step by step:

| Key | Name | Playable differences |
| --- | --- | --- |
| `normal` | Normal facility | The full path through repayment and distribution |
| `early` | Early settlement | After one installment: `SETTLE_EARLY` closes the facility once (a second close is rejected) |
| `late` | Late payment | `ADVANCE_TIME` past the due date → `MARK_LATE` → cure or restructure |
| `default` | Default and recovery | `MARK_DEFAULT` → `RECOVER` with real proceeds; the waterfall allocates principal first |
| `supplier` | Supplier failure | `SUPPLIER_FAIL` with options (replace/refund/cancel) — release stays locked |
| `insurance` | Insurance event | `INSURANCE_EVENT` with a claim amount and its effect on facility continuity |

---

## 10. Simulation clock

- `clock` lives in the snapshot (not in `SystemSettings`).
- `ADVANCE_TIME` advances the date, generates installment dues, and steps default states by duration.
- The engine never calls `Date.now()`; `now` is passed explicitly for determinism.

---

## 11. Role switching

- `SET_ACTOR` changes only `state.actor`.
- Available actions are computed in `nextActions` (server) by role and phase.
- Example: `RELEASE_TO_SUPPLIER` is available to `OPERATIONS` only after conditions are complete; `PAY_INSTALLMENT` to `SME` after activation.

---

## 12. Evidence pack (`GET .../evidence`)

Built from the snapshot without a network:
- **JSON** with: scenario, timeline, ledger, final financial state, each investor's position, the last simulated reconciliation, and a SHA-256 fingerprint of the pack.
- A readable **Markdown summary**.
- **Reproducibility check:** because the snapshot is deterministic, the actions can be replayed against the initial snapshot and the fingerprint verified.
- (Optional later) include real read-only Testnet links for the equivalent events.

---

## 13. Guardrails and security

- **No personal data:** fictional names only (Investor A/B/C, Desert Mile…).
- **Isolation:** each session is an independent row; no access to other sessions (cookie verified).
- **Rate limiting:** `rateLimit` on creation and actions.
- **Resource limits:** active-session cap, 24h TTL, periodic cleanup.
- **Legal posture:** an explicit banner + a `SIMULATION` mark on every piece of evidence.
- **Fail closed:** an error in an action changes no state (no partial write) — because the write is an atomic replacement of the JSON column.

---

## 14. Acceptance criteria

1. A visitor with no account starts a `normal` session and reaches `COMPLETED` through the UI only.
2. Reset returns the state to the start immediately and clears the ledger.
3. A visitor session cannot see or edit shared Demo data or another visitor's session (tested with two parallel sessions).
4. All six scenarios are playable and reach their expected end.
5. Numbers match what `waterfall-v2`/`rules` compute (parity tests).
6. The evidence pack is downloadable and its fingerprint is reproducible from the same seed.
7. New `npm test` coverage covers the engine (valid/invalid transitions, determinism, distribution maths).
8. `next build` passes, and no existing table or money path is modified.

---

## 15. Implementation phases and files

**Phase 1 — engine (no UI, 3–5 days)**
- `lib/sandbox/state.ts`, `scenarios.ts`, `engine.ts`, `reducer.ts`, `actions.ts`, `evidence.ts`
- `lib/sandbox/__tests__/*.test.ts`
- Full reliance on `waterfall-v2` + `rules` + `money`.

**Phase 2 — storage and routes (2–3 days)**
- `prisma/schema.prisma` + an additive migration for `SandboxSession`.
- `lib/sandbox/store.ts` (CRUD + cleanup).
- `app/api/sandbox/session/route.ts` and `app/api/sandbox/session/[id]/{route,action,reset,scenario,evidence}.ts`.
- Add expired-session cleanup to an existing worker.

**Phase 3 — UI (4–6 days)**
- Replace `app/sandbox/page.tsx` with an interactive app.
- Components: `SandboxStepper`, `SandboxPanels`, `SandboxActions`, `SandboxTimeline`, `SandboxClock`, `ScenarioPicker`.
- Reuse the current design language (same colours/cards).

**Phase 4 — polish (2–3 days)**
- Evidence pack, mobile polish, error messages, session limits.

**Phase 5 — (optional) read-only Testnet / ephemeral tenant**
- `stellar.expert` links for equivalent events, then (later optional) managed execution on contracts v3 per session.

**Total estimate for phases 1–4:** ~2–3 weeks for one developer.

---

## 16. Risks and open decisions

| Risk | Mitigation |
| --- | --- |
| Ephemeral Vercel environment (memory) | State in the database, not in process memory |
| `sandbox_sessions` on SQLite vs Postgres | Additive only; same mechanism as the current `sync-postgres-schema` |
| Per-instance in-memory rate limit | Acceptable to start; upgrade to KV later if needed |
| Overlap with the current public `app/sandbox` | Keep the `/sandbox` route, replace the content |
| "Real chain" expectations | Make it clear phase 1 is simulation; Testnet comes later |

**Decisions needed from you:**
1. Fully anonymous session (recommended) or login required?
2. Retention period (24h proposed) and session cap.
3. Add a direct "Play" button for the `default` scenario alongside `normal`?
4. Include read-only Testnet links in phase 1?

---

## 17. Required tests

- Each action's state: allowed/rejected by role and phase.
- Determinism: same seed ⇒ same fingerprint.
- Maths: parity with `waterfall-v2` for distribution, early settlement, and recovery.
- A full cycle for each scenario from start to end.
- Session isolation (two parallel sessions do not intersect).
- Reset clears the ledger and state.

---

_Design plan. No code changes until the decisions in section 16 are approved._
