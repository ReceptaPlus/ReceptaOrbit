import "server-only";
import { PrismaClient } from "@prisma/client";

/* Prisma Client do app web (Next). Lê DATABASE_URL (mesmo Postgres do backend).
   Singleton para não esgotar conexões em hot-reload. Sem fallback em memória:
   sem DATABASE_URL o Prisma falha alto (fail-closed) — não há mais modo demo. */
const globalForPrisma = globalThis as unknown as { db?: PrismaClient };

export const db =
  globalForPrisma.db ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.db = db;
}
