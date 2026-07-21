import { z } from "zod";

export const inviteUserSchema = z.object({
  name: z.string().min(2, "Informe o nome"),
  email: z.string().email("E-mail inválido"),
  role: z.enum(["PHARMACY_MANAGER", "PHARMACY_VIEWER"]),
});

export const pharmacySchema = z.object({
  tradeName: z.string().min(2, "Informe o nome fantasia"),
  legalName: z.string().min(2, "Informe a razão social"),
  cnpj: z.string().regex(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/, "CNPJ no formato 00.000.000/0000-00"),
  timezone: z.string(),
  city: z.string().max(120).optional(), // município (opcional na edição; validação de vazio no action)
  uf: z.string().max(2).optional(), // UF — validada contra a lista no action
});

export type InviteUserInput = z.infer<typeof inviteUserSchema>;
export type PharmacyInput = z.infer<typeof pharmacySchema>;
