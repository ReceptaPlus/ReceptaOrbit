import { z } from "zod";

export const loginSchema = z.object({
  username: z.string().min(3, "Informe seu usuário"),
  password: z.string().min(8, "Senha tem no mínimo 8 caracteres"),
});

export type LoginInput = z.infer<typeof loginSchema>;
