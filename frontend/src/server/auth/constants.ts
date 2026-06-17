/* Constantes de auth sem dependências — seguras para importar no proxy (edge-safe)
   e em server modules. NÃO importar aqui nada de next/headers, jose ou "server-only". */
export const SESSION_COOKIE = "orbit_session";
export const SESSION_MAX_AGE_S = 60 * 60 * 24 * 7; // 7 dias
