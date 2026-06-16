import { z } from "zod";

/* Validação das variáveis de ambiente (Fase 1). Segredos por ambiente; pepper
   fora do banco. Mais variáveis (ENCRYPTION_KEY, AUTH_SECRET, EVOLUTION_*, AI_*)
   entram nas fases seguintes (§25 da arquitetura). */
const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "staging", "production"]).default("development"),
  DATABASE_URL: z.string().min(1),
  DIRECT_DATABASE_URL: z.string().min(1).optional(),
  PASSWORD_PEPPER: z.string().min(1, "PASSWORD_PEPPER é obrigatório"),
});

export const env = schema.parse(process.env);
export type Env = z.infer<typeof schema>;
