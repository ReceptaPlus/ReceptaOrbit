import "server-only";
import { headers } from "next/headers";
import { $Enums, type Prisma } from "@prisma/client";
import { db } from "@/server/db";

/* Trilha de auditoria append-only. Toda mutação relevante grava aqui (ator, antes→depois).
   Staff sempre com onBehalfOf (a farmácia alvo). IP/UA capturados do request. */
interface AuditInput {
  pharmacyId: string;
  actorUserId: string;
  onBehalfOf?: string | null;
  action: $Enums.AuditAction;
  entityType: string;
  entityId: string;
  before?: Prisma.InputJsonValue;
  after?: Prisma.InputJsonValue;
}

export async function writeAudit(input: AuditInput): Promise<void> {
  const h = await headers();
  await db.auditLog.create({
    data: {
      pharmacyId: input.pharmacyId,
      actorType: "USER",
      actorUserId: input.actorUserId,
      onBehalfOf: input.onBehalfOf ?? null,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId,
      before: input.before,
      after: input.after,
      ipAddress: h.get("x-forwarded-for") ?? h.get("x-real-ip"),
      userAgent: h.get("user-agent"),
    },
  });
}
