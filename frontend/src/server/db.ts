import "server-only";
import { PrismaClient } from "@prisma/client";

/* Prisma Client do app web (Next). Lê DATABASE_URL (Railway). Schema é o mesmo do
   backend (cópia gerada por db:pull-schema). Singleton p/ não esgotar conexões em dev. */
const globalForPrisma = globalThis as unknown as { db?: PrismaClient };

export const db =
  globalForPrisma.db ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.db = db;
}
