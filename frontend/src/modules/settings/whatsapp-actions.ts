"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/server/db";
import { getAuthorizedPharmacyContext } from "@/server/auth/dal";
import { can } from "@/modules/tenancy/authz";
import { writeAudit } from "@/server/audit";
import { connectInstance, getConnectionState, logoutInstance } from "@/server/evolution/client";

/* Ações da tela de pareamento WhatsApp. Gated por can("manage_whatsapp").
   V1: 1 instância Evolution (env EVOLUTION_INSTANCE). Atualiza a WhatsAppConnection
   do tenant atual. */

export interface PairingState {
  qr?: string | null;
  pairingCode?: string | null;
  error?: string;
}

export interface SyncState {
  state?: "DISCONNECTED" | "PAIRING" | "CONNECTED" | "DOWN";
  error?: string;
}

const PATH = "/configuracoes/whatsapp";

export async function startPairingAction(): Promise<PairingState> {
  const ctx = await getAuthorizedPharmacyContext();
  if (!can("manage_whatsapp", ctx.role)) return { error: "Sem permissão." };

  try {
    const { qr, pairingCode } = await connectInstance();
    const instanceName = process.env.EVOLUTION_INSTANCE ?? null;
    await db.whatsAppConnection.upsert({
      where: { pharmacyId: ctx.pharmacyId },
      create: {
        pharmacyId: ctx.pharmacyId,
        state: "PAIRING",
        instanceName,
        stateChangedAt: new Date(),
        qrExpiresAt: new Date(Date.now() + 60_000),
      },
      update: { state: "PAIRING", instanceName, stateChangedAt: new Date(), qrExpiresAt: new Date(Date.now() + 60_000) },
    });
    revalidatePath(PATH);
    return { qr, pairingCode };
  } catch {
    return { error: "Falha ao iniciar o pareamento. Confira a configuração da Evolution." };
  }
}

export async function syncStateAction(): Promise<SyncState> {
  const ctx = await getAuthorizedPharmacyContext();
  if (!can("manage_whatsapp", ctx.role)) return { error: "Sem permissão." };

  const live = await getConnectionState();
  if (!live) return {};

  const prev = await db.whatsAppConnection.findUnique({ where: { pharmacyId: ctx.pharmacyId }, select: { state: true } });
  await db.whatsAppConnection.upsert({
    where: { pharmacyId: ctx.pharmacyId },
    create: { pharmacyId: ctx.pharmacyId, state: live, stateChangedAt: new Date(), instanceName: process.env.EVOLUTION_INSTANCE ?? null },
    update: { state: live, stateChangedAt: new Date() },
  });

  if (live === "CONNECTED" && prev?.state !== "CONNECTED") {
    await writeAudit({
      pharmacyId: ctx.pharmacyId,
      actorUserId: ctx.userId,
      action: "WHATSAPP_CONNECTED",
      entityType: "WhatsAppConnection",
      entityId: ctx.pharmacyId,
      after: { state: "CONNECTED" },
    });
  }
  revalidatePath(PATH);
  return { state: live };
}

export async function disconnectAction(): Promise<SyncState> {
  const ctx = await getAuthorizedPharmacyContext();
  if (!can("manage_whatsapp", ctx.role)) return { error: "Sem permissão." };

  try {
    await logoutInstance();
  } catch {
    // segue mesmo se o logout remoto falhar — reflete o estado desejado localmente
  }
  await db.whatsAppConnection.upsert({
    where: { pharmacyId: ctx.pharmacyId },
    create: { pharmacyId: ctx.pharmacyId, state: "DISCONNECTED", stateChangedAt: new Date(), instanceName: process.env.EVOLUTION_INSTANCE ?? null },
    update: { state: "DISCONNECTED", stateChangedAt: new Date(), pairedNumber: null },
  });
  await writeAudit({
    pharmacyId: ctx.pharmacyId,
    actorUserId: ctx.userId,
    action: "WHATSAPP_DISCONNECTED",
    entityType: "WhatsAppConnection",
    entityId: ctx.pharmacyId,
    after: { state: "DISCONNECTED" },
  });
  revalidatePath(PATH);
  return { state: "DISCONNECTED" };
}
