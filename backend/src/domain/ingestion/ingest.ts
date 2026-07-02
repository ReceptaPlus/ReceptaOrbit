import { Prisma } from "@prisma/client";
import { prisma } from "../../db/client.js";
import { parseJid } from "./phone.js";
import type { NormalizedMessage } from "./evolution-payload.js";

/* Processa UMA mensagem normalizada para dentro do domínio (tenant já resolvido):
   - upsert do Contact por (pharmacyId, phoneE164)
   - abre/anexa ConversationCycle (janela fixa de 24h; 1 ciclo OPEN por contato)
   - cria Message imutável (dedup por providerMessageId)
   Sem IA: status do ciclo é OPEN (ativo) ou CLOSED (expirado). WAITING_CUSTOMER/
   WAITING_PHARMACY são DERIVADOS na ViewModel (direção da última msg), não armazenados. */

const CYCLE_WINDOW_MS = 24 * 60 * 60 * 1000;

export type IngestResult =
  | { status: "ok"; cycleId: string }
  | { status: "skipped"; reason: string }
  | { status: "duplicate" };

export async function ingestMessage(pharmacyId: string, msg: NormalizedMessage): Promise<IngestResult> {
  const parsed = parseJid(msg.remoteJid);
  if (!parsed) return { status: "skipped", reason: "jid ausente/inválido" };
  if (parsed.isGroup) return { status: "skipped", reason: "grupo/broadcast (fora da V1)" };
  const phoneE164 = parsed.phoneE164;

  // Dedup antes da transação (rajada/replay do webhook).
  if (msg.providerMessageId) {
    const existing = await prisma.message.findUnique({
      where: { pharmacyId_providerMessageId: { pharmacyId, providerMessageId: msg.providerMessageId } },
      select: { id: true },
    });
    if (existing) return { status: "duplicate" };
  }

  return prisma.$transaction(async (tx) => {
    // Serializa por contato (lock cross-session do Postgres — vale entre instâncias do
    // worker). Elimina a corrida da invariante "1 ciclo OPEN" e do dedup: duas mensagens
    // concorrentes do mesmo contato passam a ser sequenciais. Liberado no fim da transação.
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`${pharmacyId}:${phoneE164}`}))`;

    const contact = await tx.contact.upsert({
      where: { pharmacyId_phoneE164: { pharmacyId, phoneE164 } },
      create: {
        pharmacyId,
        phoneE164,
        name: msg.pushName?.trim() || phoneE164,
        firstSeenAt: msg.sentAt,
        lastSeenAt: msg.sentAt,
      },
      update: { lastSeenAt: msg.sentAt },
    });

    // Ciclo mais recente do contato.
    const last = await tx.conversationCycle.findFirst({
      where: { pharmacyId, contactId: contact.id },
      orderBy: { startedAt: "desc" },
    });

    const isActive = last && last.status === "OPEN" && msg.sentAt < last.expiresAt;

    let cycleId: string;
    if (isActive && last) {
      const upd = await tx.conversationCycle.update({
        where: { id: last.id },
        data: { lastMessageAt: msg.sentAt > last.lastMessageAt ? msg.sentAt : last.lastMessageAt },
      });
      cycleId = upd.id;
    } else {
      // Fecha ciclo OPEN expirado (lazy close) antes de abrir novo.
      if (last && last.status === "OPEN") {
        await tx.conversationCycle.update({ where: { id: last.id }, data: { status: "CLOSED" } });
      }
      const created = await tx.conversationCycle.create({
        data: {
          pharmacyId,
          contactId: contact.id,
          startedAt: msg.sentAt,
          expiresAt: new Date(msg.sentAt.getTime() + CYCLE_WINDOW_MS),
          lastMessageAt: msg.sentAt,
          status: "OPEN",
        },
      });
      cycleId = created.id;
    }

    try {
      await tx.message.create({
        data: {
          pharmacyId,
          cycleId,
          direction: msg.fromMe ? "OUTBOUND" : "INBOUND",
          textContent: msg.text,
          providerMessageId: msg.providerMessageId,
          sentAt: msg.sentAt,
        },
      });
    } catch (err) {
      // Rede de segurança contra corrida de replay: o pré-check de dedup roda fora da
      // transação, então uma rajada concorrente pode colidir no unique aqui. Trata como
      // duplicata (rollback da tx — nada é persistido), não como erro.
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
        return { status: "duplicate" } as const;
      }
      throw err;
    }

    return { status: "ok", cycleId } as const;
  });
}
