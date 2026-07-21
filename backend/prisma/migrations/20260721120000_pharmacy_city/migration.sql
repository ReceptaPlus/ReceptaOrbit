-- Município/UF da farmácia (informado na criação da conta). Contexto para o Simulador
-- e base para análise regional futura. Nullable: farmácias existentes ficam sem valor
-- até serem editadas (nenhuma coluna NOT NULL sem default em tabela populada).
ALTER TABLE "pharmacies" ADD COLUMN "city" TEXT;
ALTER TABLE "pharmacies" ADD COLUMN "uf" TEXT;
