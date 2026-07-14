-- Cooldown do disparo de análise de IA por farmácia.
--  · O disparo saiu do cron para o LOGIN/entrada no app (por pharmacyId). O throttle antigo
--    era em memória (por-instância, resetava no deploy, não coordenava réplicas) — best-effort.
--  · last_ai_run_at vira a trava DURÁVEL: o app reivindica a janela com um UPDATE condicional
--    atômico (updateMany WHERE last_ai_run_at IS NULL OR < cutoff). O Postgres garante um único
--    vencedor por janela, entre réplicas e sobrevivendo a deploys — evita disparo/custo duplicado.
ALTER TABLE "pharmacies"
    ADD COLUMN "last_ai_run_at" TIMESTAMPTZ;
