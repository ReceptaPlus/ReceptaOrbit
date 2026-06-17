import "server-only";
import { createHash, randomBytes } from "node:crypto";

/* Tokens de convite: gera aleatório (vai no link) e guarda só o SHA-256 no banco.
   Mesmo algoritmo do backend (backend/src/domain/auth/invitations.ts). */
export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function generateInviteToken(): { token: string; tokenHash: string } {
  const token = randomBytes(32).toString("base64url");
  return { token, tokenHash: hashToken(token) };
}
