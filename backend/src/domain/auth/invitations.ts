import { createHash, randomBytes } from "node:crypto";

/* Convite de 1º acesso: token aleatório enviado por link; banco guarda só o HASH.
   Uso único + expiração validados no consumo. */
const DEFAULT_TTL_DAYS = 7;

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function generateInviteToken(): { token: string; tokenHash: string } {
  const token = randomBytes(32).toString("base64url");
  return { token, tokenHash: hashToken(token) };
}

export function inviteExpiry(from: Date = new Date(), ttlDays = DEFAULT_TTL_DAYS): Date {
  return new Date(from.getTime() + ttlDays * 24 * 60 * 60 * 1000);
}

export function isInviteUsable(invite: { usedAt: Date | null; expiresAt: Date }, now: Date = new Date()): boolean {
  return invite.usedAt === null && invite.expiresAt.getTime() > now.getTime();
}
