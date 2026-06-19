export function formatBRL(cents: number): string {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export function formatPercent(value: number): string {
  return `${Math.round(value * 100)}%`;
}

/** Telefone E.164 (+5511990001122) → exibição BR legível. Fallback: retorna como veio. */
export function formatPhone(e164: string): string {
  const m = /^\+55(\d{2})(\d{4,5})(\d{4})$/.exec(e164);
  if (!m) return e164;
  return `+55 ${m[1]} ${m[2]}-${m[3]}`;
}

/** Telefone mascarado p/ VIEWER (mantém país+DDD e 2 últimos dígitos). */
export function maskPhone(e164: string): string {
  const m = /^\+55(\d{2})(\d+)(\d{2})$/.exec(e164);
  if (!m) return "•••••";
  return `+55 ${m[1]} ${"•".repeat(Math.max(m[2].length, 4))}${m[3]}`;
}

export function initials(name: string): string {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}
