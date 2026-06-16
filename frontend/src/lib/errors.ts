/* Envelope de erro da camada de dados (CONTRATOS-FRONTEND Parte 3).
   api.ts dos módulos rejeita com ApiError; a UI mapeia code → mensagem/estado. */
export type ApiErrorCode =
  | "NOT_FOUND"
  | "FORBIDDEN"
  | "VALIDATION"
  | "CONFLICT"
  | "UNKNOWN";

export class ApiError extends Error {
  readonly code: ApiErrorCode;
  constructor(code: ApiErrorCode, message: string) {
    super(message);
    this.name = "ApiError";
    this.code = code;
  }
}
