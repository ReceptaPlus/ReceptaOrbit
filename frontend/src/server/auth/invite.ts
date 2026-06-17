"use server";

import { redirect } from "next/navigation";
import { firstAccessSchema } from "@/modules/auth/schemas";
import { db } from "@/server/db";
import { hashPassword } from "./password";
import { hashToken } from "./tokens";

/* Consumo do convite de 1º acesso: define senha definitiva, registra aceite dos
   documentos legais vigentes, ATIVA os memberships e marca o convite como usado.
   Token nunca é guardado em claro — comparamos pelo SHA-256 (igual ao backend). */

export interface InviteState {
  error?: string;
}

export async function completeInviteAction(_prev: InviteState, formData: FormData): Promise<InviteState> {
  const token = String(formData.get("token") ?? "");
  const acceptedTerms = formData.get("acceptTerms") === "on";

  const parsed = firstAccessSchema.safeParse({
    password: formData.get("password"),
    confirm: formData.get("confirm"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }
  if (!acceptedTerms) {
    return { error: "Aceite os Termos de Uso e a Política de Privacidade para continuar." };
  }

  const invite = await db.userInvitation.findUnique({ where: { tokenHash: hashToken(token) } });
  if (!invite || invite.usedAt || invite.expiresAt.getTime() < Date.now()) {
    return { error: "Convite inválido ou expirado." };
  }

  const passwordHash = await hashPassword(parsed.data.password);
  const activeDocs = await db.legalDocument.findMany({
    where: { active: true },
    select: { id: true },
  });

  await db.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: invite.userId },
      data: { passwordHash, mustChangePassword: false, status: "ACTIVE" },
    });
    await tx.membership.updateMany({
      where: { userId: invite.userId, status: "INVITED" },
      data: { status: "ACTIVE" },
    });
    for (const doc of activeDocs) {
      await tx.userLegalAcceptance.upsert({
        where: { userId_legalDocumentId: { userId: invite.userId, legalDocumentId: doc.id } },
        update: {},
        create: { userId: invite.userId, legalDocumentId: doc.id },
      });
    }
    await tx.userInvitation.update({ where: { id: invite.id }, data: { usedAt: new Date() } });
  });

  redirect("/login?ativado=1");
}
