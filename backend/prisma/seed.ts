import "dotenv/config";
import { randomBytes } from "node:crypto";
import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/domain/auth/password.js";
import { generateInviteToken, inviteExpiry } from "../src/domain/auth/invitations.js";

/* Seed da Fase 1 — espelha os cenários dos mocks do frontend (src/mocks) para que
   dev local tenha os mesmos casos: 3 farmácias, usuário em 2 tenants (switcher),
   convite pendente, membership suspenso, staff de plataforma, aceite legal, auditoria.
   Idempotente: upsert por chaves naturais (email, slug, [type,version], [pharmacy,user]). */
const prisma = new PrismaClient();

/* SEGURANÇA: nunca embutir senha fraca fixa no repositório (este seed roda contra o
   Postgres real). Defina SEED_PASSWORD no ambiente; se ausente, gera uma forte e a
   imprime UMA vez (anote). PASSWORD_PEPPER deve ser o mesmo do login para autenticar. */
const providedPassword = process.env.SEED_PASSWORD;
const seedPassword = providedPassword ?? randomBytes(12).toString("base64url");

async function main() {
  const passwordHash = await hashPassword(seedPassword);

  // ── Documentos legais ─────────────────────────────────────────────────────
  const terms = await prisma.legalDocument.upsert({
    where: { type_version: { type: "TERMS_OF_USE", version: "1.0" } },
    update: {},
    create: {
      type: "TERMS_OF_USE",
      version: "1.0",
      contentUrl: "https://receptaorbit.com/legal/termos-1.0",
      contentHash: "sha256:terms-1.0",
      active: true,
      publishedAt: new Date("2026-01-01T00:00:00Z"),
    },
  });
  const privacy = await prisma.legalDocument.upsert({
    where: { type_version: { type: "PRIVACY_POLICY", version: "1.0" } },
    update: {},
    create: {
      type: "PRIVACY_POLICY",
      version: "1.0",
      contentUrl: "https://receptaorbit.com/legal/privacidade-1.0",
      contentHash: "sha256:privacy-1.0",
      active: true,
      publishedAt: new Date("2026-01-01T00:00:00Z"),
    },
  });

  // ── Farmácias (tenants) ───────────────────────────────────────────────────
  const dsp = await prisma.pharmacy.upsert({
    where: { slug: "drogaria-sp" },
    update: {},
    create: {
      tradeName: "Drogaria São Paulo — Jardim Europa",
      legalName: "DSP Farma Ltda.",
      cnpj: "12.345.678/0001-90",
      slug: "drogaria-sp",
      city: "São Paulo",
      uf: "SP",
      plan: "PRO",
      status: "ACTIVE",
      aiAutoConfirmThreshold: 0.85,
    },
  });
  const vida = await prisma.pharmacy.upsert({
    where: { slug: "farmacia-vida" },
    update: {},
    create: {
      tradeName: "Farmácia Vida — Centro",
      legalName: "Vida Saúde Comércio de Medicamentos Ltda.",
      cnpj: "98.765.432/0001-10",
      slug: "farmacia-vida",
      city: "Campinas",
      uf: "SP",
      plan: "START",
      status: "ACTIVE",
      aiAutoConfirmThreshold: 0.7,
    },
  });
  const bemEstar = await prisma.pharmacy.upsert({
    where: { slug: "drogaria-bem-estar" },
    update: {},
    create: {
      tradeName: "Drogaria Bem Estar — Tatuapé",
      legalName: "Bem Estar Farma Ltda.",
      cnpj: "45.678.901/0001-23",
      slug: "drogaria-bem-estar",
      city: "São Paulo",
      uf: "SP",
      plan: "START",
      status: "ACTIVE",
    },
  });

  // ── Usuários ──────────────────────────────────────────────────────────────
  const antonio = await prisma.user.upsert({
    where: { email: "antonio@dspaulo.com.br" },
    update: {},
    create: { name: "Antonio Ferreira", email: "antonio@dspaulo.com.br", passwordHash, mustChangePassword: false },
  });
  const camila = await prisma.user.upsert({
    where: { email: "camila@dspaulo.com.br" },
    update: {},
    create: { name: "Camila Ramos", email: "camila@dspaulo.com.br", passwordHash, mustChangePassword: false },
  });
  const daniel = await prisma.user.upsert({
    where: { email: "daniel@dspaulo.com.br" },
    update: {},
    create: { name: "Daniel Melo", email: "daniel@dspaulo.com.br", passwordHash, mustChangePassword: false },
  });
  // Convidada — ainda sem 1º acesso: sem senha, deve trocar.
  const ana = await prisma.user.upsert({
    where: { email: "ana@dspaulo.com.br" },
    update: {},
    create: { name: "Ana Souza", email: "ana@dspaulo.com.br", passwordHash: null, mustChangePassword: true },
  });
  const suporte = await prisma.user.upsert({
    where: { email: "suporte@receptaplus.com.br" },
    update: {},
    create: { name: "Suporte Recepta", email: "suporte@receptaplus.com.br", passwordHash, mustChangePassword: false },
  });

  // ── Staff de plataforma (separado do tenant) ───────────────────────────────
  await prisma.platformStaff.upsert({
    where: { userId: suporte.id },
    update: {},
    create: { userId: suporte.id, role: "PLATFORM_ADMIN" },
  });

  // ── Memberships ─────────────────────────────────────────────────────────────
  const link = (pharmacyId: string, userId: string) => ({ pharmacyId_userId: { pharmacyId, userId } });
  await prisma.membership.upsert({ where: link(dsp.id, antonio.id), update: {}, create: { pharmacyId: dsp.id, userId: antonio.id, role: "MANAGER", status: "ACTIVE" } });
  await prisma.membership.upsert({ where: link(vida.id, antonio.id), update: {}, create: { pharmacyId: vida.id, userId: antonio.id, role: "OWNER", status: "ACTIVE" } }); // 2 tenants → switcher
  await prisma.membership.upsert({ where: link(dsp.id, camila.id), update: {}, create: { pharmacyId: dsp.id, userId: camila.id, role: "OWNER", status: "ACTIVE" } });
  await prisma.membership.upsert({ where: link(dsp.id, daniel.id), update: {}, create: { pharmacyId: dsp.id, userId: daniel.id, role: "VIEWER", status: "ACTIVE" } });
  const anaMembership = await prisma.membership.upsert({
    where: link(dsp.id, ana.id),
    update: {},
    create: { pharmacyId: dsp.id, userId: ana.id, role: "VIEWER", status: "INVITED", invitedByUserId: camila.id, inviteExpiresAt: inviteExpiry() },
  });
  await prisma.membership.upsert({ where: link(vida.id, daniel.id), update: {}, create: { pharmacyId: vida.id, userId: daniel.id, role: "VIEWER", status: "SUSPENDED" } });

  // ── Convite de 1º acesso da Ana (token aleatório; só o hash é persistido) ───
  const existingInvite = await prisma.userInvitation.findFirst({
    where: { userId: ana.id, usedAt: null },
  });
  if (!existingInvite) {
    const { tokenHash } = generateInviteToken();
    await prisma.userInvitation.create({
      data: { userId: ana.id, tokenHash, expiresAt: inviteExpiry(), createdByUserId: camila.id },
    });
  }

  // ── Aceite legal do Antonio (termos + privacidade) ──────────────────────────
  for (const doc of [terms, privacy]) {
    await prisma.userLegalAcceptance.upsert({
      where: { userId_legalDocumentId: { userId: antonio.id, legalDocumentId: doc.id } },
      update: {},
      create: { userId: antonio.id, legalDocumentId: doc.id, ipAddress: "203.0.113.10", userAgent: "seed" },
    });
  }

  // ── Auditoria (append-only) — só na 1ª execução ─────────────────────────────
  if ((await prisma.auditLog.count()) === 0) {
    await prisma.auditLog.create({
      data: {
        pharmacyId: dsp.id,
        actorType: "USER",
        actorUserId: suporte.id,
        onBehalfOf: dsp.id, // ação de staff sempre com onBehalfOf
        action: "PHARMACY_CREATED",
        entityType: "Pharmacy",
        entityId: dsp.id,
        before: undefined,
        after: { tradeName: dsp.tradeName, plan: dsp.plan },
      },
    });
    await prisma.auditLog.create({
      data: {
        pharmacyId: dsp.id,
        actorType: "USER",
        actorUserId: camila.id,
        action: "USER_INVITED",
        entityType: "Membership",
        entityId: anaMembership.id,
        after: { userId: ana.id, role: "VIEWER", status: "INVITED" },
      },
    });
  }

  // ── V1 Ingestão — conexões WhatsApp (espelham os 3 estados dos mocks) ────────
  await prisma.whatsAppConnection.upsert({
    where: { pharmacyId: dsp.id },
    update: {},
    create: { pharmacyId: dsp.id, state: "CONNECTED", pairedNumber: "+5511940028922", instanceName: "drogaria-sp-01", stateChangedAt: new Date("2026-06-10T08:00:00Z") },
  });
  await prisma.whatsAppConnection.upsert({
    where: { pharmacyId: vida.id },
    update: {},
    create: { pharmacyId: vida.id, state: "DOWN", pairedNumber: "+5511955551234", instanceName: "farmacia-vida-01", stateChangedAt: new Date("2026-06-17T22:15:00Z") },
  });
  await prisma.whatsAppConnection.upsert({
    where: { pharmacyId: bemEstar.id },
    update: {},
    create: { pharmacyId: bemEstar.id, state: "PAIRING", instanceName: "bem-estar-01", stateChangedAt: new Date("2026-06-18T09:00:00Z"), qrExpiresAt: new Date("2026-06-18T09:01:00Z") },
  });

  // ── V1 Ingestão — contato + ciclo aberto com mensagens (tenant dsp) ─────────
  const now = new Date();
  const minsAgo = (m: number) => new Date(now.getTime() - m * 60_000);
  const rafael = await prisma.contact.upsert({
    where: { pharmacyId_phoneE164: { pharmacyId: dsp.id, phoneE164: "+5511990005543" } },
    update: {},
    create: { pharmacyId: dsp.id, name: "Rafael Lima", phoneE164: "+5511990005543", firstSeenAt: new Date("2025-11-20T10:00:00Z"), lastSeenAt: minsAgo(5) },
  });
  const cycle = await prisma.conversationCycle.upsert({
    where: { id_pharmacyId: { id: "00000000-0000-4000-8000-000000000006", pharmacyId: dsp.id } },
    update: {},
    create: {
      id: "00000000-0000-4000-8000-000000000006",
      pharmacyId: dsp.id,
      contactId: rafael.id,
      startedAt: minsAgo(10),
      expiresAt: new Date(now.getTime() + 23 * 60 * 60_000),
      lastMessageAt: minsAgo(5),
      status: "OPEN", // ativo; WAITING_* é DERIVADO na VM (última msg INBOUND → aguardando farmácia)
    },
  });
  const seedMessages: { providerMessageId: string; direction: "INBOUND" | "OUTBOUND"; textContent: string; sentAt: Date }[] = [
    { providerMessageId: "evo_seed_0601", direction: "INBOUND", textContent: "Boa tarde, vocês têm dipirona em gotas?", sentAt: minsAgo(10) },
    { providerMessageId: "evo_seed_0602", direction: "OUTBOUND", textContent: "Temos sim! R$ 8,90. Deseja entrega?", sentAt: minsAgo(7) },
    { providerMessageId: "evo_seed_0603", direction: "INBOUND", textContent: "Pode ser entrega. Qual o prazo?", sentAt: minsAgo(5) },
  ];
  for (const m of seedMessages) {
    await prisma.message.upsert({
      where: { pharmacyId_providerMessageId: { pharmacyId: dsp.id, providerMessageId: m.providerMessageId } },
      update: {},
      create: { pharmacyId: dsp.id, cycleId: cycle.id, direction: m.direction, textContent: m.textContent, providerMessageId: m.providerMessageId, sentAt: m.sentAt },
    });
  }

  console.log("Seed concluído: 3 farmácias, 5 usuários, 6 memberships, staff, convite, aceites, auditoria, 3 conexões WhatsApp, 1 contato, 1 ciclo, 3 mensagens.");
  console.log(
    providedPassword
      ? "Senha das contas seedadas: definida via SEED_PASSWORD."
      : `Senha das contas seedadas (gerada — anote, não será mostrada de novo): ${seedPassword}`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
