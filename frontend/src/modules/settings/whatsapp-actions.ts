"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/server/db";
import { getAuthorizedPharmacyContext } from "@/server/auth/dal";
import { can } from "@/modules/tenancy/authz";
import { writeAudit } from "@/server/audit";
import { connectInstance, getConnectionState, logoutInstance } from "@/server/evolution/client";
import { getInstancePrefix } from "@/server/evolution/config";

/* Ações da tela de pareamento WhatsApp. Gated por can("manage_whatsapp").
   Multi-tenant: cada farmácia tem a SUA instância Evolution. O nome da instância é
   guardado em WhatsAppConnection.instanceName (resolução de tenant no webhook/worker);
   quando ainda não existe, é derivado do slug da farmácia (estável + único por tenant). */

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
const QR_TTL_MS = 60_000;

/** Nome da instância Evolution do tenant: reusa o já gravado; senão deriva do slug. */
async function resolveInstanceName(pharmacyId: string): Promise<string> {
  const conn = await db.whatsAppConnection.findUnique({
    where: { pharmacyId },
    select: { instanceName: true },
  });
  if (conn?.instanceName) return conn.instanceName;
  const pharmacy = await db.pharmacy.findUnique({ where: { id: pharmacyId }, select: { slug: true } });
  const slug = pharmacy?.slug ?? pharmacyId;
  return `${getInstancePrefix()}-${slug}`;
}

export async function startPairingAction(): Promise<PairingState> {
  const ctx = await getAuthorizedPharmacyContext();
  if (!can("manage_whatsapp", ctx.role)) return { error: "Sem permissão." };

  const instanceName = await resolveInstanceName(ctx.pharmacyId);
  try {
    const { qr, pairingCode } = await connectInstance(instanceName);
    const qrExpiresAt = new Date(Date.now() + QR_TTL_MS);
    await db.whatsAppConnection.upsert({
      where: { pharmacyId: ctx.pharmacyId },
      create: { pharmacyId: ctx.pharmacyId, state: "PAIRING", instanceName, stateChangedAt: new Date(), qrExpiresAt },
      update: { state: "PAIRING", instanceName, stateChangedAt: new Date(), qrExpiresAt },
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

  const conn = await db.whatsAppConnection.findUnique({
    where: { pharmacyId: ctx.pharmacyId },
    select: { instanceName: true, state: true },
  });
  if (!conn?.instanceName) return {}; // nada pareado ainda

  const live = await getConnectionState(conn.instanceName);
  if (!live) return {};

  await db.whatsAppConnection.update({
    where: { pharmacyId: ctx.pharmacyId },
    data: { state: live, stateChangedAt: new Date() },
  });

  if (live === "CONNECTED" && conn.state !== "CONNECTED") {
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

  const instanceName = await resolveInstanceName(ctx.pharmacyId);
  try {
    await logoutInstance(instanceName);
  } catch {
    // segue mesmo se o logout remoto falhar — reflete o estado desejado localmente
  }
  await db.whatsAppConnection.upsert({
    where: { pharmacyId: ctx.pharmacyId },
    create: { pharmacyId: ctx.pharmacyId, state: "DISCONNECTED", stateChangedAt: new Date(), instanceName },
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
