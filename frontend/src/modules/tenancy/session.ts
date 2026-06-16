/* Store de sessão simulada (Época 1). Framework-agnóstico: server lê o snapshot,
   client assina via hooks.ts (useSyncExternalStore). Em produção isto vira Auth.js.
   ÚNICA porta para ler/alterar o contexto de sessão (userId, pharmacyId, role). */
import { initialSession, type SessionState } from "@/mocks/session.mock";
import { memberships, platformStaff } from "@/mocks";
import type { SessionRole } from "@/types/domain";

let current: SessionState = { ...initialSession };
const listeners = new Set<() => void>();

export function getSession(): SessionState {
  return current;
}

export function setSession(next: Partial<SessionState>): void {
  current = { ...current, ...next };
  listeners.forEach((l) => l());
}

export function subscribeSession(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Papel efetivo de um usuário num tenant: membership ATIVO; senão papel de plataforma. */
export function roleForContext(userId: string, pharmacyId: string | null): SessionRole | null {
  if (pharmacyId) {
    const m = memberships.find(
      (mb) => mb.userId === userId && mb.pharmacyId === pharmacyId && mb.status === "ACTIVE",
    );
    if (m) return m.role;
  }
  const staff = platformStaff.find((s) => s.userId === userId);
  return staff ? staff.role : null;
}
