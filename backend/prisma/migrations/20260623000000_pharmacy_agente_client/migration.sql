-- Vínculo lógico Pharmacy -> Client do banco do Agente-Meta-Ads (cross-DB, sem FK).
-- Usado para resolver os cards de anúncio (Meta+Google) por id explícito,
-- substituindo o match frágil por nome.
ALTER TABLE "pharmacies" ADD COLUMN "agente_client_id" TEXT;
