/* Superfície de auth do servidor. NÃO importar este barril em componentes client
   (puxa "server-only"). Client importa a action diretamente de "./login". */
export { getSession, requireSession, requireCan, getAuthorizedPharmacyContext } from "./dal";
export { createSession, destroySession, type SessionPayload } from "./session";
export { SESSION_COOKIE } from "./constants";
