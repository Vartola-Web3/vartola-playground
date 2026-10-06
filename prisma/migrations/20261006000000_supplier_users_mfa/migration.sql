-- CreateTable
CREATE TABLE "supplier_users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "supplier_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "supplier_users_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "suppliers" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "supplier_submissions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "supplier_id" TEXT NOT NULL,
    "facility_id" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "reference" TEXT NOT NULL DEFAULT '',
    "amount" REAL,
    "serial_hash" TEXT,
    "document_hash" TEXT,
    "storage_path" TEXT,
    "status" TEXT NOT NULL DEFAULT 'SUBMITTED',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "user_mfa" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "secret_sealed" TEXT NOT NULL,
    "confirmed_at" DATETIME,
    "last_step" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "supplier_users_user_id_key" ON "supplier_users"("user_id");

-- CreateIndex
CREATE INDEX "supplier_users_supplier_id_idx" ON "supplier_users"("supplier_id");

-- CreateIndex
CREATE INDEX "supplier_submissions_supplier_id_facility_id_idx" ON "supplier_submissions"("supplier_id", "facility_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_mfa_user_id_key" ON "user_mfa"("user_id");

