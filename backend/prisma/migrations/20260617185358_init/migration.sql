-- CreateEnum
CREATE TYPE "PharmacyStatus" AS ENUM ('ACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "PlanType" AS ENUM ('START', 'PRO');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "TenantRole" AS ENUM ('OWNER', 'MANAGER', 'VIEWER');

-- CreateEnum
CREATE TYPE "MembershipStatus" AS ENUM ('INVITED', 'ACTIVE', 'SUSPENDED', 'REVOKED');

-- CreateEnum
CREATE TYPE "PlatformRole" AS ENUM ('PLATFORM_ADMIN', 'PLATFORM_SUPPORT');

-- CreateEnum
CREATE TYPE "LegalDocumentType" AS ENUM ('TERMS_OF_USE', 'PRIVACY_POLICY');

-- CreateEnum
CREATE TYPE "ActorType" AS ENUM ('USER', 'AI', 'SYSTEM');

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('SALE_CONFIRMED', 'SALE_REJECTED', 'SALE_REFUNDED', 'SALE_VALUE_CORRECTED', 'CLASSIFICATION_CORRECTED', 'USER_INVITED', 'INVITE_CANCELLED', 'INVITE_RESENT', 'MEMBERSHIP_SUSPENDED', 'MEMBERSHIP_REACTIVATED', 'WHATSAPP_CONNECTED', 'WHATSAPP_DISCONNECTED', 'AI_THRESHOLD_CHANGED', 'PHARMACY_UPDATED', 'PHARMACY_CREATED');

-- CreateTable
CREATE TABLE "pharmacies" (
    "id" UUID NOT NULL,
    "trade_name" TEXT NOT NULL,
    "legal_name" TEXT NOT NULL,
    "cnpj" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'America/Sao_Paulo',
    "plan" "PlanType" NOT NULL DEFAULT 'START',
    "status" "PharmacyStatus" NOT NULL DEFAULT 'ACTIVE',
    "ai_auto_confirm_threshold" DOUBLE PRECISION NOT NULL DEFAULT 0.85,
    "ai_summary_language" TEXT NOT NULL DEFAULT 'pt-BR',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "pharmacies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT,
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "must_change_password" BOOLEAN NOT NULL DEFAULT true,
    "session_version" INTEGER NOT NULL DEFAULT 0,
    "last_login_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "platform_staff" (
    "user_id" UUID NOT NULL,
    "role" "PlatformRole" NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "platform_staff_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "pharmacy_memberships" (
    "id" UUID NOT NULL,
    "pharmacy_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "role" "TenantRole" NOT NULL,
    "status" "MembershipStatus" NOT NULL DEFAULT 'INVITED',
    "invited_by_user_id" UUID,
    "invite_expires_at" TIMESTAMPTZ,
    "last_access_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "pharmacy_memberships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_invitations" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "token_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMPTZ NOT NULL,
    "used_at" TIMESTAMPTZ,
    "created_by_user_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_invitations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "legal_documents" (
    "id" UUID NOT NULL,
    "type" "LegalDocumentType" NOT NULL,
    "version" TEXT NOT NULL,
    "content_url" TEXT NOT NULL,
    "content_hash" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "published_at" TIMESTAMPTZ NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "legal_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_legal_acceptances" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "legal_document_id" UUID NOT NULL,
    "accepted_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ip_address" TEXT,
    "user_agent" TEXT,

    CONSTRAINT "user_legal_acceptances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" UUID NOT NULL,
    "pharmacy_id" UUID NOT NULL,
    "actor_type" "ActorType" NOT NULL,
    "actor_user_id" UUID,
    "actor_model" TEXT,
    "on_behalf_of" UUID,
    "action" "AuditAction" NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "before" JSONB,
    "after" JSONB,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "pharmacies_cnpj_key" ON "pharmacies"("cnpj");

-- CreateIndex
CREATE UNIQUE INDEX "pharmacies_slug_key" ON "pharmacies"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "pharmacy_memberships_user_id_idx" ON "pharmacy_memberships"("user_id");

-- CreateIndex
CREATE INDEX "pharmacy_memberships_pharmacy_id_idx" ON "pharmacy_memberships"("pharmacy_id");

-- CreateIndex
CREATE UNIQUE INDEX "pharmacy_memberships_pharmacy_id_user_id_key" ON "pharmacy_memberships"("pharmacy_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_invitations_token_hash_key" ON "user_invitations"("token_hash");

-- CreateIndex
CREATE INDEX "user_invitations_user_id_idx" ON "user_invitations"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "legal_documents_type_version_key" ON "legal_documents"("type", "version");

-- CreateIndex
CREATE INDEX "user_legal_acceptances_user_id_idx" ON "user_legal_acceptances"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_legal_acceptances_user_id_legal_document_id_key" ON "user_legal_acceptances"("user_id", "legal_document_id");

-- CreateIndex
CREATE INDEX "audit_logs_pharmacy_id_entity_type_created_at_idx" ON "audit_logs"("pharmacy_id", "entity_type", "created_at");

-- CreateIndex
CREATE INDEX "audit_logs_pharmacy_id_created_at_idx" ON "audit_logs"("pharmacy_id", "created_at");

-- AddForeignKey
ALTER TABLE "platform_staff" ADD CONSTRAINT "platform_staff_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pharmacy_memberships" ADD CONSTRAINT "pharmacy_memberships_pharmacy_id_fkey" FOREIGN KEY ("pharmacy_id") REFERENCES "pharmacies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pharmacy_memberships" ADD CONSTRAINT "pharmacy_memberships_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pharmacy_memberships" ADD CONSTRAINT "pharmacy_memberships_invited_by_user_id_fkey" FOREIGN KEY ("invited_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_invitations" ADD CONSTRAINT "user_invitations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_invitations" ADD CONSTRAINT "user_invitations_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_legal_acceptances" ADD CONSTRAINT "user_legal_acceptances_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_legal_acceptances" ADD CONSTRAINT "user_legal_acceptances_legal_document_id_fkey" FOREIGN KEY ("legal_document_id") REFERENCES "legal_documents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_pharmacy_id_fkey" FOREIGN KEY ("pharmacy_id") REFERENCES "pharmacies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
