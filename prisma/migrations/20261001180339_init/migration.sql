-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "company_id" TEXT,
    "stellar_public_key" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_login_at" DATETIME,
    CONSTRAINT "users_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "companies" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "trade_license_no" TEXT NOT NULL,
    "legal_name" TEXT NOT NULL,
    "trading_name" TEXT,
    "emirate" TEXT NOT NULL,
    "industry" TEXT NOT NULL,
    "established_date" DATETIME NOT NULL,
    "monthly_revenue" REAL,
    "monthly_expenses" REAL,
    "liabilities" REAL,
    "contact_email" TEXT NOT NULL,
    "contact_phone" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "verified_at" DATETIME,
    "verified_by" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true
);

-- CreateTable
CREATE TABLE "applications" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "application_no" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "submitted_by" TEXT NOT NULL,
    "asset_type" TEXT NOT NULL,
    "asset_description" TEXT NOT NULL,
    "asset_value" REAL NOT NULL,
    "sme_contribution" REAL NOT NULL,
    "finance_amount" REAL NOT NULL,
    "requested_term" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "company_risk_score" INTEGER,
    "asset_risk_score" INTEGER,
    "deal_risk_score" INTEGER,
    "risk_tier" TEXT,
    "approved_at" DATETIME,
    "approved_by" TEXT,
    "rejected_at" DATETIME,
    "rejection_reason" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "applications_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "applications_submitted_by_fkey" FOREIGN KEY ("submitted_by") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "documents" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "application_id" TEXT NOT NULL,
    "document_type" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_size" INTEGER NOT NULL,
    "mime_type" TEXT NOT NULL,
    "storage_path" TEXT NOT NULL,
    "document_hash" TEXT NOT NULL,
    "uploaded_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "uploaded_by" TEXT NOT NULL,
    "verified_at" DATETIME,
    "verified_by" TEXT,
    CONSTRAINT "documents_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "applications" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "underwriting_reviews" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "application_id" TEXT NOT NULL,
    "reviewed_by" TEXT NOT NULL,
    "decision" TEXT NOT NULL,
    "comments" TEXT,
    "conditions" TEXT,
    "recommended_tier" TEXT,
    "recommended_terms" TEXT,
    "reviewed_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "underwriting_reviews_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "applications" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "underwriting_reviews_reviewed_by_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "facilities" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "facility_no" TEXT NOT NULL,
    "application_id" TEXT NOT NULL,
    "pool_id" TEXT,
    "finance_amount" REAL NOT NULL,
    "term" INTEGER NOT NULL,
    "monthly_payment" REAL NOT NULL,
    "status" TEXT NOT NULL,
    "stellar_tx_hash" TEXT,
    "stellar_asset_id" TEXT,
    "activated_at" DATETIME,
    "maturity_date" DATETIME,
    "closed_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "facilities_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "applications" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "facilities_pool_id_fkey" FOREIGN KEY ("pool_id") REFERENCES "pools" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "pools" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "pool_no" TEXT NOT NULL,
    "pool_name" TEXT NOT NULL,
    "target_amount" REAL NOT NULL,
    "raised_amount" REAL NOT NULL DEFAULT 0,
    "min_investment" REAL NOT NULL,
    "target_return" REAL NOT NULL,
    "status" TEXT NOT NULL,
    "asset_focus" TEXT NOT NULL,
    "stellar_tx_hash" TEXT,
    "stellar_pool_id" TEXT,
    "opened_at" DATETIME,
    "closed_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "investments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "investor_id" TEXT NOT NULL,
    "pool_id" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "shares" REAL NOT NULL,
    "status" TEXT NOT NULL,
    "stellar_tx_hash" TEXT,
    "subscribed_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "activated_at" DATETIME,
    CONSTRAINT "investments_investor_id_fkey" FOREIGN KEY ("investor_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "investments_pool_id_fkey" FOREIGN KEY ("pool_id") REFERENCES "pools" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "facility_id" TEXT NOT NULL,
    "payment_no" INTEGER NOT NULL,
    "due_date" DATETIME NOT NULL,
    "amount" REAL NOT NULL,
    "paid_at" DATETIME,
    "paid_amount" REAL,
    "status" TEXT NOT NULL,
    "stellar_tx_hash" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "payments_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "facilities" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "distributions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "investment_id" TEXT NOT NULL,
    "payment_id" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "stellar_tx_hash" TEXT,
    "distributed_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "distributions_investment_id_fkey" FOREIGN KEY ("investment_id") REFERENCES "investments" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "distributions_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "payments" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "changes" TEXT,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_company_id_idx" ON "users"("company_id");

-- CreateIndex
CREATE UNIQUE INDEX "companies_trade_license_no_key" ON "companies"("trade_license_no");

-- CreateIndex
CREATE INDEX "companies_trade_license_no_idx" ON "companies"("trade_license_no");

-- CreateIndex
CREATE UNIQUE INDEX "applications_application_no_key" ON "applications"("application_no");

-- CreateIndex
CREATE INDEX "applications_application_no_idx" ON "applications"("application_no");

-- CreateIndex
CREATE INDEX "applications_status_idx" ON "applications"("status");

-- CreateIndex
CREATE UNIQUE INDEX "facilities_facility_no_key" ON "facilities"("facility_no");

-- CreateIndex
CREATE UNIQUE INDEX "facilities_application_id_key" ON "facilities"("application_id");

-- CreateIndex
CREATE INDEX "facilities_facility_no_idx" ON "facilities"("facility_no");

-- CreateIndex
CREATE UNIQUE INDEX "pools_pool_no_key" ON "pools"("pool_no");

-- CreateIndex
CREATE INDEX "pools_pool_no_idx" ON "pools"("pool_no");

-- CreateIndex
CREATE INDEX "investments_investor_id_pool_id_idx" ON "investments"("investor_id", "pool_id");

-- CreateIndex
CREATE UNIQUE INDEX "payments_facility_id_payment_no_key" ON "payments"("facility_id", "payment_no");

-- CreateIndex
CREATE INDEX "audit_logs_entity_type_entity_id_idx" ON "audit_logs"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "audit_logs_user_id_created_at_idx" ON "audit_logs"("user_id", "created_at");
