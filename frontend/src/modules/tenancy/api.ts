/* API do módulo tenancy. Mesmas assinaturas que terão com fetch real (CONTRATOS
   Parte 3); na Época 1 leem de src/mocks e resolvem síncrono embrulhado em Promise.
   Selectors fazem o join (pharmacyName etc.) — o componente recebe ViewModel pronto. */
import {
  memberships,
  pharmacies,
  sales,
  users,
  whatsappConnections,
} from "@/mocks";
import { ApiError } from "@/lib/errors";
import type { SessionRole, User } from "@/types/domain";
import { getSession, roleForContext, setSession } from "./session";
import type { CurrentSession, MembershipWithPharmacy, TenantSwitcherVM } from "./types";

function userOrThrow(id: string): User {
  const u = users.find((x) => x.id === id);
  if (!u) throw new ApiError("NOT_FOUND", `Usuário ${id} não encontrado.`);
  return u;
}

function pharmacyName(pharmacyId: string): string {
  return pharmacies.find((p) => p.id === pharmacyId)?.tradeName ?? pharmacyId;
}

export async function getCurrentUser(): Promise<User> {
  return userOrThrow(getSession().currentUserId);
}

/** Todos os vínculos do usuário atual (qualquer status), com nome da farmácia. */
export async function getMemberships(): Promise<MembershipWithPharmacy[]> {
  const { currentUserId } = getSession();
  return memberships
    .filter((m) => m.userId === currentUserId)
    .map((m) => ({ ...m, pharmacyName: pharmacyName(m.pharmacyId) }));
}

export async function getCurrentSession(): Promise<CurrentSession> {
  const { currentUserId, currentPharmacyId } = getSession();
  const user = userOrThrow(currentUserId);
  const membership =
    currentPharmacyId == null
      ? null
      : memberships.find((m) => m.userId === currentUserId && m.pharmacyId === currentPharmacyId) ??
        null;
  const pharmacy =
    currentPharmacyId == null ? null : pharmacies.find((p) => p.id === currentPharmacyId) ?? null;
  return { user, membership, pharmacy };
}

/** Troca o tenant ativo. Valida vínculo ACTIVE — pharmacyId do cliente nunca é confiado. */
export async function switchPharmacy(pharmacyId: string): Promise<void> {
  const { currentUserId } = getSession();
  const role = roleForContext(currentUserId, pharmacyId);
  const active = memberships.some(
    (m) => m.userId === currentUserId && m.pharmacyId === pharmacyId && m.status === "ACTIVE",
  );
  if (!active || role == null) {
    throw new ApiError("FORBIDDEN", "Sem acesso ativo a esta farmácia.");
  }
  setSession({ currentPharmacyId: pharmacyId, role });
}

export async function getTenantSwitcher(): Promise<TenantSwitcherVM> {
  const { currentUserId, currentPharmacyId } = getSession();
  const active = memberships.filter((m) => m.userId === currentUserId && m.status === "ACTIVE");
  const options = active.map((m) => ({
    id: m.pharmacyId,
    name: pharmacyName(m.pharmacyId),
    pendingCount: sales.filter(
      (s) => s.pharmacyId === m.pharmacyId && s.status === "PENDING_REVIEW",
    ).length,
    whatsAppDown:
      whatsappConnections.find((w) => w.pharmacyId === m.pharmacyId)?.state === "DOWN",
  }));
  const current =
    currentPharmacyId == null
      ? null
      : { id: currentPharmacyId, name: pharmacyName(currentPharmacyId) };
  return { current, options, visible: active.length >= 2 };
}

/** DevSwitcher (apenas Época 1): alterna papel para testar permissões sem auth. */
export function devSetRole(role: SessionRole): void {
  setSession({ role });
}
