-- Read-state por usuário p/ o badge "conversas não vistas".
CREATE TABLE "conversation_reads" (
    "user_id" UUID NOT NULL,
    "cycle_id" UUID NOT NULL,
    "seen_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT "conversation_reads_pkey" PRIMARY KEY ("user_id","cycle_id")
);
CREATE INDEX "conversation_reads_cycle_id_idx" ON "conversation_reads"("cycle_id");
ALTER TABLE "conversation_reads" ADD CONSTRAINT "conversation_reads_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "conversation_reads" ADD CONSTRAINT "conversation_reads_cycle_id_fkey"
    FOREIGN KEY ("cycle_id") REFERENCES "conversation_cycles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
