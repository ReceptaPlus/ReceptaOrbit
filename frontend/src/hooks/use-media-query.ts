"use client";

import { useSyncExternalStore } from "react";

/* Assina uma media query via store externo (sem setState em effect; SSR-safe). */
export function useMediaQuery(query: string): boolean {
  function subscribe(callback: () => void): () => void {
    const mql = window.matchMedia(query);
    mql.addEventListener("change", callback);
    return () => mql.removeEventListener("change", callback);
  }
  const getSnapshot = () => window.matchMedia(query).matches;
  const getServerSnapshot = () => false;

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
