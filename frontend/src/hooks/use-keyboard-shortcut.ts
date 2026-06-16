"use client";

import { useEffect } from "react";

interface Options {
  meta?: boolean;
  enabled?: boolean;
}

export function useKeyboardShortcut(key: string, handler: () => void, options: Options = {}) {
  const { meta = false, enabled = true } = options;

  useEffect(() => {
    if (!enabled) return;
    function onKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      if (["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)) return;
      if (meta && !(e.metaKey || e.ctrlKey)) return;
      if (e.key.toLowerCase() === key.toLowerCase()) {
        e.preventDefault();
        handler();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [key, handler, meta, enabled]);
}
