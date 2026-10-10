# Quality Gates & Check Report

**Date:** 10 October 2026 · **Scope:** Day 1 of `docs/updated-general-plan.md` (foundation & safety) · **Environment:** local + CI config.

This records the quality-gate foundation and the results of the full check suite.

---

## 1. What was added

| File | Purpose |
| --- | --- |
| `.github/workflows/ci.yml` | Mandatory gate: typecheck, lint, unit tests, build (Node 22) + Soroban contract tests (Rust). Blocks merges on failure. |
| `.github/workflows/security.yml` | Secret scan (gitleaks) + dependency audit (`npm audit --audit-level=high`). |
| `.github/workflows/codeql.yml` | CodeQL static analysis for JavaScript/TypeScript. |
| `.github/dependabot.yml` | Weekly updates for npm, GitHub Actions, and Cargo. |
| `package.json` (`test` script) | Quoted the glob (`tsx --test "lib/**/*.test.ts"`) so the same files run on Windows and Linux. Previously the glob was shell-expanded differently per platform and only a subset ran in CI. |

---

## 2. Check results (run locally, 10 October 2026)

| Check | Command | Result |
| --- | --- | --- |
| Typecheck | `npx tsc --noEmit` | ✅ 0 errors |
| Lint | `npx eslint . --quiet` | ✅ 0 errors |
| Unit tests | `npm test` | ✅ 147 tests, 0 fail |
| Contract tests | `cargo test --workspace` | ✅ 44 tests, 0 fail |
| Build | `npm run build` | ✅ passes (exit 0) |

Coverage note: `npm test` runs every `lib/**/*.test.ts` file, including nested `__tests__` directories.

---

## 3. Manual steps required (cannot be done from a file)

These must be enabled in the GitHub repository settings (owner action):

1. **Branch protection** on `main`: require the `CI / quality` and `CI / contracts` checks to pass before merge; require pull requests; require at least one review.
2. **Enable code scanning** (CodeQL) for the repository so `codeql.yml` can upload results. Free for public repositories.
3. **Enable Dependabot alerts** and security updates.

---

## 4. Notes

- CI uses a committed demo database (`prisma/prisma/dev.db`) and non-secret environment values; no real secrets are used in CI.
- `gitleaks-action` and CodeQL need no third-party secrets beyond the default `GITHUB_TOKEN`.
- If a first CI run fails because a workflow needs a repository setting (e.g. CodeQL permissions), adjust the setting rather than the code.

---

## 5. Next (per plan)

- **Week 1, Day 5:** critical fixes — real chain confirmation in the outbox (H1), stop swallowing chain errors (H7), fix the experimental `fields` API usage (H8).
- **Week 1, Day 6–7:** integration test harness and first integration tests (auth + facility lifecycle).
