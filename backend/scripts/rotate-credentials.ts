/* Rotação de credenciais das contas semeadas (M0 — segurança).
   Motivo: o seed antigo usou uma senha fraca FIXA, visível no histórico do git, em
   contas REAIS no Postgres compartilhado — incluindo o PLATFORM_ADMIN. Qualquer um que
   leia o repo loga como admin → acesso multi-tenant total.

   O que faz, por conta com passwordHash:
     - gera senha forte aleatória (crypto, 20+ chars)
     - re-hasheia com o MESMO Argon2id+pepper do login (reusa hashPassword)
     - bump em sessionVersion → mata sessões ativas (cookies antigos = logout)
     - mustChangePassword=false → a nova senha já loga (UX de troca forçada é M3)

   SEGURANÇA: dry-run por padrão. Só escreve com --apply. As senhas novas são impressas
   UMA vez — guarde num cofre. Priorize distribuir a do suporte@ (PLATFORM_ADMIN).

   Uso:
     npm run rotate:creds                          # dry-run (todas as contas)
     npm run rotate:creds -- --apply               # aplica em todas
     npm run rotate:creds -- --admin-only          # dry-run só PLATFORM_ADMIN/STAFF
     npm run rotate:creds -- --apply --admin-only  # aplica só no staff de plataforma
*/
import "dotenv/config";
import { randomBytes } from "node:crypto";
import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/domain/auth/password.js";

const db = new PrismaClient();
const APPLY = process.argv.includes("--apply");
const ADMIN_ONLY = process.argv.includes("--admin-only");

function strongPassword(): string {
  // 18 bytes → 24 chars base64url; sem ambiguidade de padding.
  return randomBytes(18).toString("base64url");
}

function maskEmail(e: string): string {
  const [u, d] = e.split("@");
  return `${u.slice(0, 2)}***@${d ?? ""}`;
}

try {
  const users = await db.user.findMany({
    where: { passwordHash: { not: null }, ...(ADMIN_ONLY ? { platformStaff: { isNot: null } } : {}) },
    select: { id: true, email: true, name: true, sessionVersion: true, platformStaff: { select: { role: true } } },
    orderBy: [{ platformStaff: { role: "asc" } }, { createdAt: "asc" }],
  });

  if (users.length === 0) {
    console.log("Nenhuma conta alvo encontrada. Nada a rotacionar.");
    process.exit(0);
  }

  console.log(`${APPLY ? "APLICANDO" : "DRY-RUN"}${ADMIN_ONLY ? " (só staff de plataforma)" : ""} rotação em ${users.length} conta(s):\n`);
  const results: { email: string; password: string; admin: boolean }[] = [];

  for (const u of users) {
    const isAdmin = !!u.platformStaff;
    const newPwd = strongPassword();
    if (APPLY) {
      const passwordHash = await hashPassword(newPwd);
      await db.user.update({
        where: { id: u.id },
        data: { passwordHash, sessionVersion: { increment: 1 }, mustChangePassword: false },
      });
    }
    results.push({ email: u.email, password: newPwd, admin: isAdmin });
    console.log(`  ${isAdmin ? "★ " : "  "}${maskEmail(u.email)} (sessV ${u.sessionVersion}→${u.sessionVersion + 1})`);
  }

  console.log("\n=== NOVAS CREDENCIAIS (guarde já — não reaparecem) ===");
  for (const r of results.sort((a, b) => Number(b.admin) - Number(a.admin))) {
    console.log(`${r.admin ? "[ADMIN] " : "        "}${r.email}\n          senha: ${r.password}`);
  }

  if (!APPLY) {
    console.log("\nℹ️ DRY-RUN — nada foi gravado. As senhas acima são apenas amostras; rode com --apply p/ valer.");
  } else {
    console.log("\n✅ Rotação aplicada. Sessões antigas invalidadas (sessionVersion++).");
    console.log("   Próximo: rotacionar também a senha do Postgres na Railway (apareceu em chat/histórico).");
  }
} catch (e) {
  console.error("rotate:creds ERRO:", e instanceof Error ? e.message : e);
  process.exit(1);
} finally {
  await db.$disconnect();
}
