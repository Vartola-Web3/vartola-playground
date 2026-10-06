-- CreateTable
CREATE TABLE "ops_records" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "kind" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "data" TEXT NOT NULL DEFAULT '{}',
    "created_by" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateIndex
CREATE INDEX "ops_records_kind_status_idx" ON "ops_records"("kind", "status");

-- CreateIndex
CREATE INDEX "ops_records_kind_key_idx" ON "ops_records"("kind", "key");
