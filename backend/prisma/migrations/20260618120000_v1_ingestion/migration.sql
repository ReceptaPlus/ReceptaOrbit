-- V1 Ingestão ("espionagem" WhatsApp): WhatsAppConnection, Contact, ConversationCycle, Message, WebhookEvent.
-- Autoridade: docs/DOMAIN-MODEL.md (regras 1-12, riscos de schema) + docs/CONTRATOS-FRONTEND.md.
-- Aditiva (não toca tabelas da Fase 1). FKs compostas (id, pharmacy_id) impedem mistura de tenants.

-- CreateEnum
CREATE TYPE "WhatsAppState" AS ENUM ('DISCONNECTED', 'PAIRING', 'CONNECTED', 'DOWN');

-- CreateEnum
CREATE TYPE "CycleStatus" AS ENUM ('OPEN', 'WAITING_CUSTOMER', 'WAITING_PHARMACY', 'CLOSED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "MessageDirection" AS ENUM ('INBOUND', 'OUTBOUND');

-- CreateEnum
CREATE TYPE "WebhookEventStatus" AS ENUM ('PENDING', 'PROCESSED', 'FAILED');

-- CreateTable
CREATE TABLE "whatsapp_connections" (
    "pharmacy_id" UUID NOT NULL,
    "state" "WhatsAppState" NOT NULL DEFAULT 'DISCONNECTED',
    "paired_number" TEXT,
    "instance_name" TEXT,
    "state_changed_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "qr_expires_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "whatsapp_connections_pkey" PRIMARY KEY ("pharmacy_id")
);

-- CreateTable
CREATE TABLE "contacts" (
    "id" UUID NOT NULL,
    "pharmacy_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "phone_e164" TEXT NOT NULL,
    "first_seen_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_seen_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversation_cycles" (
    "id" UUID NOT NULL,
    "pharmacy_id" UUID NOT NULL,
    "contact_id" UUID NOT NULL,
    "started_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMPTZ NOT NULL,
    "last_message_at" TIMESTAMPTZ NOT NULL,
    "status" "CycleStatus" NOT NULL DEFAULT 'OPEN',
    "attribution" JSONB,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "conversation_cycles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" UUID NOT NULL,
    "pharmacy_id" UUID NOT NULL,
    "cycle_id" UUID NOT NULL,
    "direction" "MessageDirection" NOT NULL,
    "text_content" TEXT NOT NULL,
    "provider_message_id" TEXT,
    "sent_at" TIMESTAMPTZ NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "webhook_events" (
    "id" UUID NOT NULL,
    "pharmacy_id" UUID,
    "instance_name" TEXT,
    "event_type" TEXT,
    "payload" JSONB NOT NULL,
    "status" "WebhookEventStatus" NOT NULL DEFAULT 'PENDING',
    "error" TEXT,
    "received_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processed_at" TIMESTAMPTZ,

    CONSTRAINT "webhook_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "whatsapp_connections_instance_name_key" ON "whatsapp_connections"("instance_name");

-- CreateIndex
CREATE INDEX "contacts_pharmacy_id_last_seen_at_idx" ON "contacts"("pharmacy_id", "last_seen_at");

-- CreateIndex
CREATE UNIQUE INDEX "contacts_pharmacy_id_phone_e164_key" ON "contacts"("pharmacy_id", "phone_e164");

-- CreateIndex
CREATE UNIQUE INDEX "contacts_id_pharmacy_id_key" ON "contacts"("id", "pharmacy_id");

-- CreateIndex
CREATE INDEX "conversation_cycles_pharmacy_id_contact_id_idx" ON "conversation_cycles"("pharmacy_id", "contact_id");

-- CreateIndex
CREATE INDEX "conversation_cycles_pharmacy_id_last_message_at_idx" ON "conversation_cycles"("pharmacy_id", "last_message_at");

-- CreateIndex
CREATE UNIQUE INDEX "conversation_cycles_id_pharmacy_id_key" ON "conversation_cycles"("id", "pharmacy_id");

-- CreateIndex
CREATE INDEX "messages_pharmacy_id_cycle_id_sent_at_idx" ON "messages"("pharmacy_id", "cycle_id", "sent_at");

-- CreateIndex
CREATE UNIQUE INDEX "messages_pharmacy_id_provider_message_id_key" ON "messages"("pharmacy_id", "provider_message_id");

-- CreateIndex
CREATE INDEX "webhook_events_status_received_at_idx" ON "webhook_events"("status", "received_at");

-- AddForeignKey
ALTER TABLE "whatsapp_connections" ADD CONSTRAINT "whatsapp_connections_pharmacy_id_fkey" FOREIGN KEY ("pharmacy_id") REFERENCES "pharmacies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_pharmacy_id_fkey" FOREIGN KEY ("pharmacy_id") REFERENCES "pharmacies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversation_cycles" ADD CONSTRAINT "conversation_cycles_contact_id_pharmacy_id_fkey" FOREIGN KEY ("contact_id", "pharmacy_id") REFERENCES "contacts"("id", "pharmacy_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_cycle_id_pharmacy_id_fkey" FOREIGN KEY ("cycle_id", "pharmacy_id") REFERENCES "conversation_cycles"("id", "pharmacy_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ── Índices parciais (SQL manual — Prisma não suporta índice filtrado no schema) ──

-- Invariante DOMAIN-MODEL 8.1: no máximo 1 ciclo OPEN por (pharmacy, contact).
-- Este UNIQUE parcial também serve de índice do caminho quente do worker
-- (lookup do ciclo aberto na ingestão de cada mensagem — risco de schema 2).
CREATE UNIQUE INDEX "conversation_cycles_one_open_per_contact"
    ON "conversation_cycles" ("pharmacy_id", "contact_id")
    WHERE "status" = 'OPEN';
