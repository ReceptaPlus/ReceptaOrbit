-- Integração multicanal (aditiva à Evolution).
-- Provider de canal por farmácia: EVOLUTION (WhatsApp/QR, modelo atual) ou
-- DIGISAC (plataforma de atendimento multicanal). Ingestão reaproveita a fila
-- webhook_events e o ingestMessage; muda só o parser e a resolução de tenant.

-- Enum de provider.
CREATE TYPE "ChannelProvider" AS ENUM ('EVOLUTION', 'DIGISAC');

-- webhook_events: discriminador de provider + chave externa (serviceId Digisac).
-- DEFAULT 'EVOLUTION' mantém os eventos atuais válidos (sem backfill).
ALTER TABLE "webhook_events"
    ADD COLUMN "provider" "ChannelProvider" NOT NULL DEFAULT 'EVOLUTION',
    ADD COLUMN "external_id" TEXT;

-- Conexões a providers multicanal (Digisac). Coexiste com whatsapp_connections.
CREATE TABLE "channel_connections" (
    "id" UUID NOT NULL,
    "pharmacy_id" UUID NOT NULL,
    "provider" "ChannelProvider" NOT NULL,
    "external_id" TEXT NOT NULL,
    "label" TEXT,
    "api_base_url" TEXT,
    "webhook_secret_hash" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    CONSTRAINT "channel_connections_pkey" PRIMARY KEY ("id")
);

-- (provider, serviceId) único: resolve exatamente um tenant a partir do webhook.
CREATE UNIQUE INDEX "channel_connections_provider_external_id_key"
    ON "channel_connections" ("provider", "external_id");
CREATE INDEX "channel_connections_pharmacy_id_idx"
    ON "channel_connections" ("pharmacy_id");

ALTER TABLE "channel_connections"
    ADD CONSTRAINT "channel_connections_pharmacy_id_fkey"
    FOREIGN KEY ("pharmacy_id") REFERENCES "pharmacies"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
