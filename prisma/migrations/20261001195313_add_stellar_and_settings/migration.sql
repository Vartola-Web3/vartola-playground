-- CreateTable
CREATE TABLE "stellar_transactions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "tx_hash" TEXT,
    "payload" TEXT NOT NULL,
    "error" TEXT,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "max_attempts" INTEGER NOT NULL DEFAULT 3,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "submitted_at" DATETIME,
    "confirmed_at" DATETIME,
    "failed_at" DATETIME,
    "cancelled_at" DATETIME
);

-- CreateTable
CREATE TABLE "system_settings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "stellar_transactions_tx_hash_key" ON "stellar_transactions"("tx_hash");

-- CreateIndex
CREATE INDEX "stellar_transactions_status_created_at_idx" ON "stellar_transactions"("status", "created_at");

-- CreateIndex
CREATE INDEX "stellar_transactions_entity_type_entity_id_idx" ON "stellar_transactions"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "stellar_transactions_type_status_idx" ON "stellar_transactions"("type", "status");

-- CreateIndex
CREATE UNIQUE INDEX "system_settings_key_key" ON "system_settings"("key");

-- CreateIndex
CREATE INDEX "system_settings_category_idx" ON "system_settings"("category");
