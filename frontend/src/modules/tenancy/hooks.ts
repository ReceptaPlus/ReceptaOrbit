"use client";

/* Hooks de sessão para componentes client. useSession assina o store; useCan
   reavalia permissão quando o DevSwitcher troca o papel. */
import { useSyncExternalStore } from "react";
import type { Action } from "@/types/domain";
import { can } from "./authz";
import { getSession, subscribeSession } from "./session";
import type { SessionState } from "@/mocks/session.mock";

export function useSession(): SessionState {
  return useSyncExternalStore(subscribeSession, getSession, getSession);
}

export function useCan(action: Action): boolean {
  const session = useSession();
  return can(action, session.role);
}
