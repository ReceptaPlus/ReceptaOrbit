import "server-only";
import type { PrismaClient } from "@prisma/client";
import { mockDb } from "./mock-db";

/* Prisma Client do app web (Next). Em produção lê DATABASE_URL (Railway).
   SEM DATABASE_URL (modo demo local), usa o mockDb em memória (src/mocks) —
   o app roda sem Postgres, com dados fictícios. Singleton em dev. */
const globalForPrisma = globalThis as unknown as { db?: PrismaClient };

const USE_MOCK = !process.env.DATABASE_URL;

function createClient(): PrismaClient {
  if (USE_MOCK) return mockDb as unknown as PrismaClient;
  // Import dinâmico evita exigir DATABASE_URL/engine quando em modo mock.
  const { PrismaClient: RealPrisma } = require("@prisma/client") as typeof import("@prisma/client");
  return new RealPrisma({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });
}

export const db = globalForPrisma.db ?? createClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.db = db;
}
