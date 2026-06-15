export type UIState<T> =
  | { status: "loading" }
  | { status: "empty"; message: string }
  | { status: "error"; error: { code: string; message: string } }
  | { status: "ready"; data: T };
