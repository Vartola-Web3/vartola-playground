-- Alpha chain read-model columns and supporting tables. Existing rows stay valid.

ALTER TABLE "users" ADD COLUMN "phone" TEXT;
ALTER TABLE "users" ADD COLUMN "country" TEXT;
ALTER TABLE "users" ADD COLUMN "residency" TEXT;
ALTER TABLE "users" ADD COLUMN "investor_type" TEXT;
ALTER TABLE "users" ADD COLUMN "account_status" TEXT NOT NULL DEFAULT 'ACTIVE';
ALTER TABLE "users" ADD COLUMN "email_verified_at" DATETIME;
ALTER TABLE "users" ADD COLUMN "phone_verified_at" DATETIME;

ALTER TABLE "facilities" ADD COLUMN "supplier_id" TEXT;
ALTER TABLE "facilities" ADD COLUMN "chain_status" TEXT;
ALTER TABLE "facilities" ADD COLUMN "participation_units" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "facilities" ADD COLUMN "unit_value" REAL NOT NULL DEFAULT 100;

ALTER TABLE "investments" ADD COLUMN "chain_status" TEXT;
ALTER TABLE "investments" ADD COLUMN "chain_error" TEXT;
ALTER TABLE "investments" ADD COLUMN "participation_units" INTEGER NOT NULL DEFAULT 0;

ALTER TABLE "payments" ADD COLUMN "chain_status" TEXT;
ALTER TABLE "distributions" ADD COLUMN "chain_status" TEXT;
ALTER TABLE "investor_facility_allocations" ADD COLUMN "participation_units" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "facility_releases" ADD COLUMN "chain_status" TEXT;
ALTER TABLE "facility_recoveries" ADD COLUMN "chain_status" TEXT;
ALTER TABLE "facility_recoveries" ADD COLUMN "tx_hash" TEXT;

CREATE TABLE "user_wallets" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "public_key" TEXT NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'EMBEDDED',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "user_wallets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "user_wallets_public_key_key" ON "user_wallets"("public_key");
CREATE UNIQUE INDEX "user_wallets_user_id_provider_key" ON "user_wallets"("user_id", "provider");

CREATE TABLE "wallet_secrets" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "wallet_id" TEXT NOT NULL,
    "ciphertext" TEXT NOT NULL,
    "iv" TEXT NOT NULL,
    "auth_tag" TEXT NOT NULL,
    "key_version" INTEGER NOT NULL DEFAULT 1,
    CONSTRAINT "wallet_secrets_wallet_id_fkey" FOREIGN KEY ("wallet_id") REFERENCES "user_wallets" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "wallet_secrets_wallet_id_key" ON "wallet_secrets"("wallet_id");

CREATE TABLE "suppliers" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "company_name" TEXT NOT NULL,
    "kyb_status" TEXT NOT NULL DEFAULT 'NOT_STARTED',
    "payout_public_key" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "supplier_invoices" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "supplier_id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'RECEIVED',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "supplier_invoices_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "suppliers" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE "asset_passports" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "facility_id" TEXT NOT NULL,
    "asset_id" TEXT NOT NULL,
    "serial_hash" TEXT NOT NULL,
    "asset_type" TEXT NOT NULL DEFAULT '',
    "manufacturer" TEXT NOT NULL DEFAULT '',
    "model" TEXT NOT NULL DEFAULT '',
    "year" INTEGER,
    "purchase_value" REAL,
    "supplier_name" TEXT NOT NULL DEFAULT '',
    "legal_owner" TEXT NOT NULL DEFAULT '',
    "operator_name" TEXT NOT NULL DEFAULT '',
    "insurance_status" TEXT NOT NULL DEFAULT 'UNKNOWN',
    "registration_status" TEXT NOT NULL DEFAULT 'UNKNOWN',
    "delivery_status" TEXT NOT NULL DEFAULT 'UNKNOWN',
    "valuation" REAL,
    "recovery_status" TEXT NOT NULL DEFAULT 'NONE',
    "chain_tx_hash" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "asset_passports_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "facilities" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE INDEX "asset_passports_facility_id_idx" ON "asset_passports"("facility_id");

CREATE TABLE "document_attestations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "facility_id" TEXT,
    "document_id" TEXT,
    "document_hash" TEXT NOT NULL,
    "document_type" TEXT NOT NULL,
    "entity_hash" TEXT NOT NULL,
    "verification_status" TEXT NOT NULL DEFAULT 'ANCHORED',
    "chain_tx_hash" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "document_attestations_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "facilities" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE INDEX "document_attestations_document_hash_idx" ON "document_attestations"("document_hash");

CREATE TABLE "chain_events" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "event_type" TEXT NOT NULL,
    "tx_hash" TEXT NOT NULL,
    "ledger" INTEGER NOT NULL DEFAULT 0,
    "contract_id" TEXT NOT NULL DEFAULT '',
    "entity_type" TEXT NOT NULL DEFAULT '',
    "entity_id" TEXT NOT NULL DEFAULT '',
    "payload" TEXT NOT NULL DEFAULT '{}',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX "chain_events_tx_hash_event_type_entity_id_key" ON "chain_events"("tx_hash", "event_type", "entity_id");
CREATE INDEX "chain_events_event_type_created_at_idx" ON "chain_events"("event_type", "created_at");

CREATE TABLE "phone_challenges" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "code_hash" TEXT NOT NULL,
    "expires_at" DATETIME NOT NULL,
    "consumed_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "phone_challenges_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE INDEX "phone_challenges_user_id_phone_idx" ON "phone_challenges"("user_id", "phone");

CREATE TABLE "email_challenges" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "code_hash" TEXT NOT NULL,
    "expires_at" DATETIME NOT NULL,
    "consumed_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "email_challenges_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE INDEX "email_challenges_user_id_idx" ON "email_challenges"("user_id");

CREATE TABLE "contract_roles" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "role" TEXT NOT NULL,
    "address" TEXT NOT NULL DEFAULT '',
    "note" TEXT NOT NULL DEFAULT ''
);
CREATE UNIQUE INDEX "contract_roles_role_key" ON "contract_roles"("role");
