import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().min(3, "Informe seu e-mail"),
  password: z.string().min(8, "Senha tem no mínimo 8 caracteres"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const firstAccessSchema = z
  .object({
    password: z.string().min(8, "Senha tem no mínimo 8 caracteres"),
    confirm: z.string().min(8, "Confirme a senha"),
  })
  .refine((d) => d.password === d.confirm, {
    message: "As senhas não conferem",
    path: ["confirm"],
  });

export type FirstAccessInput = z.infer<typeof firstAccessSchema>;
