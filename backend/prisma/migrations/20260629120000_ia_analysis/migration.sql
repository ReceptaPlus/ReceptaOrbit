-- IA — Análise de conversas (produzida FORA do app, pelo n8n).
-- Dois resultados persistidos pelo n8n via endpoints internos (/api/internal/ia/*):
--  · cycle_analyses  → venda por ciclo (1:1 com conversation_cycles); idempotente por
--                      analyzed_through_message_at (só reprocessa se chegou msg nova).
--  · sales_reports   → relatório agregado por farmácia/período (narrativa pro dono).
-- O app NÃO roda LLM: só lê/escreve estas tabelas. Chave do modelo vive no n8n.

-- ── Análise por ciclo ────────────────────────────────────────────────────────
CREATE TABLE "cycle_analyses" (
    "id" UUID NOT NULL,
    "pharmacy_id" UUID NOT NULL,
    "cycle_id" UUID NOT NULL,
    "is_sale" BOOLEAN NOT NULL,
    "sale_value_cents" INTEGER,
    "stage" TEXT,
    "loss_reason" TEXT,
    "summary" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "model" TEXT NOT NULL,
    "analyzed_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "analyzed_through_message_at" TIMESTAMPTZ NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    CONSTRAINT "cycle_analyses_pkey" PRIMARY KEY ("id")
);

-- (cycle_id, pharmacy_id) único: 1:1 com o ciclo + idempotência do upsert do n8n.
CREATE UNIQUE INDEX "cycle_analyses_cycle_id_pharmacy_id_key"
    ON "cycle_analyses" ("cycle_id", "pharmacy_id");
CREATE INDEX "cycle_analyses_pharmacy_id_is_sale_idx"
    ON "cycle_analyses" ("pharmacy_id", "is_sale");
CREATE INDEX "cycle_analyses_pharmacy_id_analyzed_at_idx"
    ON "cycle_analyses" ("pharmacy_id", "analyzed_at");

-- FK composta (cycle_id, pharmacy_id) → conversation_cycles (id, pharmacy_id):
-- impede análise cruzar tenant (mesmo padrão de messages).
ALTER TABLE "cycle_analyses"
    ADD CONSTRAINT "cycle_analyses_cycle_id_pharmacy_id_fkey"
    FOREIGN KEY ("cycle_id", "pharmacy_id") REFERENCES "conversation_cycles"("id", "pharmacy_id")
    ON DELETE CASCADE ON UPDATE CASCADE;

-- ── Relatório agregado (narrativa pro dono) ──────────────────────────────────
CREATE TABLE "sales_reports" (
    "id" UUID NOT NULL,
    "pharmacy_id" UUID NOT NULL,
    "period_start" TIMESTAMPTZ NOT NULL,
    "period_end" TIMESTAMPTZ NOT NULL,
    "narrative" TEXT NOT NULL,
    "sales_count" INTEGER NOT NULL,
    "sales_value_cents" INTEGER NOT NULL,
    "conversation_count" INTEGER NOT NULL,
    "conversion_rate" DOUBLE PRECISION NOT NULL,
    "model" TEXT NOT NULL,
    "generated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "sales_reports_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "sales_reports_pharmacy_id_period_end_idx"
    ON "sales_reports" ("pharmacy_id", "period_end");

ALTER TABLE "sales_reports"
    ADD CONSTRAINT "sales_reports_pharmacy_id_fkey"
    FOREIGN KEY ("pharmacy_id") REFERENCES "pharmacies"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
