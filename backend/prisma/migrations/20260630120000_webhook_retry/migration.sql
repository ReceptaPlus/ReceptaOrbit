-- Robustez da fila de ingestão (worker): retry com backoff + claim atômico.
--  · status PROCESSING: evento reivindicado por um worker (claim FOR UPDATE SKIP LOCKED),
--    impede que 2 instâncias processem o mesmo evento.
--  · attempts/next_retry_at: falha transitória reabre como PENDING com backoff (não vira
--    FAILED definitivo na 1ª falha — antes isso descartava mensagens de WhatsApp).
--    Em PROCESSING, next_retry_at é o deadline de visibilidade (reaper revive eventos
--    presos por crash do worker). FAILED passa a ser dead-letter (erro permanente ou
--    tentativas esgotadas).

-- PG16 permite ADD VALUE em transação desde que não seja usado na mesma transação.
ALTER TYPE "WebhookEventStatus" ADD VALUE IF NOT EXISTS 'PROCESSING' AFTER 'PENDING';

ALTER TABLE "webhook_events"
    ADD COLUMN "attempts" INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN "next_retry_at" TIMESTAMPTZ;
