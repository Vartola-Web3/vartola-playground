# Backup and restore runbook

**Scope:** the application database (SQLite in development and the shipped demo, PostgreSQL when hosted) and the private object storage used for documents. This is an operational runbook for Testnet operations.

## 1. What to back up

| Store | What | Frequency |
| --- | --- | --- |
| Application database | All Prisma tables (users, companies, applications, facilities, pools, investments, payments, distributions, allocations, chain events, operations records) | Daily, plus before every deploy |
| Private object storage | Uploaded documents (S3-compatible bucket) | Continuous versioning or daily snapshot |
| Secrets | `SERVER_MASTER_KEY`, `WALLET_KEK`, `NEXTAUTH_SECRET`, provider keys | In a managed secret store, never in the repository |
| Configuration | Platform settings (provider mode, network) | With each deploy |

On-chain state does not need backup: it lives on Stellar. Prisma is a read model and can be rebuilt from chain events with the indexer, but rebuilding loses application-only data, so the database backup is the primary record.

## 2. Backup procedure

**PostgreSQL (hosted):**
```
pg_dump "$DATABASE_URL" --format=custom --file=vartola-$(date +%Y%m%d).dump
```

**SQLite (development / demo):**
```
cp prisma/prisma/dev.db backups/dev-$(date +%Y%m%d).db
```

**Object storage:** enable bucket versioning, or mirror the bucket to a second bucket daily.

Store backups encrypted, outside the application host, with restricted access.

## 3. Restore procedure

1. Provision a new database (or a new file for SQLite).
2. Restore:
   - PostgreSQL: `pg_restore --clean --if-exists --dbname "$DATABASE_URL" <file>.dump`
   - SQLite: copy the backup file into place.
3. Apply any newer schema changes additively (see `scripts/sync-postgres-schema.js`).
4. Run reconciliation to compare the restored read model with the chain:
   - `GET /api/cron/reconcile` (with `CRON_SECRET`) or the admin reconciliation page.
5. Confirm `/api/health` returns `ok`.

## 4. Verification and rehearsal

- Restore into a non-production database and run reconciliation; a HEALTHY result means the read model matches the chain.
- Time a full restore at least once before launch and record the result.
- Keep at least one restore rehearsal in the launch evidence.

## 5. Failure modes to watch

- Restoring an old backup after on-chain state moved: reconciliation will report findings; re-index to catch up.
- Missing encryption key: encrypted wallet secrets and provider settings become unreadable. Back up keys separately.
- Partial document restore: documents referenced by the database but missing from storage will fail to download; keep the two in step.
