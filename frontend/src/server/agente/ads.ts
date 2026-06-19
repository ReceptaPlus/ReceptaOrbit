import "server-only";
import { Pool } from "pg";

/* Leitura READ-ONLY do banco do projeto Agente-Meta-Ads (métricas Google+Meta já
   coletadas). Reuso decidido p/ os cards de anúncio no dashboard do Orbit.
   ⚠️ SEGURANÇA: a tabela AdAccount guarda accessToken em texto puro — este módulo
   NUNCA seleciona essa coluna. Em produção, usar um usuário Postgres READ-ONLY
   (sem acesso a accessToken). Acopla Orbit ao schema do Agente (risco conhecido).
   Mapeamento Pharmacy↔Client = por NOME normalizado (Client não tem cnpj/slug). */

type GlobalPool = { agentePool?: Pool | null };
const g = globalThis as unknown as GlobalPool;

function getPool(): Pool | null {
  if (g.agentePool !== undefined) return g.agentePool;
  const url = process.env.AGENTE_DATABASE_URL;
  g.agentePool = url
    ? new Pool({ connectionString: url, ssl: { rejectUnauthorized: false }, max: 3 })
    : null;
  return g.agentePool;
}

export interface ProviderMetrics {
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
}

export interface AdsSummary {
  clientId: string;
  clientName: string;
  periodDays: number;
  meta: ProviderMetrics;
  google: ProviderMetrics;
}

const ZERO: ProviderMetrics = { spend: 0, impressions: 0, clicks: 0, conversions: 0 };

function normalize(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // tira acentos
    .toLowerCase()
    .replace(/[^a-z0-9]/g, ""); // só alfanumérico
}

/** Resolve o Client do Agente por nome normalizado (match exato após normalizar). */
async function resolveClientIdByName(name: string): Promise<{ id: string; name: string } | null> {
  const pool = getPool();
  if (!pool) return null;
  const target = normalize(name);
  if (!target) return null;
  const { rows } = await pool.query<{ id: string; name: string }>(`select id, name from "Client"`);
  const hit = rows.find((r) => normalize(r.name) === target);
  return hit ?? null;
}

async function metaMetrics(clientId: string, days: number): Promise<ProviderMetrics> {
  const pool = getPool();
  if (!pool) return ZERO;
  const { rows } = await pool.query<ProviderMetrics>(
    `select
       coalesce(sum(ai.spend),0)::float as spend,
       coalesce(sum(ai.impressions),0)::int as impressions,
       coalesce(sum(ai.clicks),0)::int as clicks,
       coalesce(sum(ai.conversions),0)::int as conversions
     from "AdInsight" ai
     join "Ad" a on a.id = ai."adId"
     join "AdSet" s on s.id = a."adSetId"
     join "Campaign" cp on cp.id = s."campaignId"
     join "AdAccount" aa on aa.id = cp."adAccountId"
     where aa."clientId" = $1 and ai.date >= now() - ($2 * interval '1 day')`,
    [clientId, days],
  );
  return rows[0] ?? ZERO;
}

async function googleMetrics(clientId: string, days: number): Promise<ProviderMetrics> {
  const pool = getPool();
  if (!pool) return ZERO;
  const { rows } = await pool.query<ProviderMetrics>(
    `select
       coalesce(sum(g.spend),0)::float as spend,
       coalesce(sum(g.impressions),0)::int as impressions,
       coalesce(sum(g.clicks),0)::int as clicks,
       coalesce(sum(g.conversions),0)::int as conversions
     from "GoogleInsightSnapshot" g
     join "GoogleCampaign" gc on gc.id = g."campaignId"
     join "GoogleAdAccount" ga on ga.id = gc."googleAdAccountId"
     where ga."clientId" = $1 and g.date >= now() - ($2 * interval '1 day')`,
    [clientId, days],
  );
  return rows[0] ?? ZERO;
}

/** Métricas de anúncio (Meta+Google) da farmácia, por nome. Null = sem Agente
    configurado ou sem Client correspondente. Falhas de leitura → null (cards somem). */
export async function getAdsByPharmacyName(pharmacyName: string, days = 7): Promise<AdsSummary | null> {
  try {
    if (!getPool()) return null;
    const client = await resolveClientIdByName(pharmacyName);
    if (!client) return null;
    const [meta, google] = await Promise.all([
      metaMetrics(client.id, days),
      googleMetrics(client.id, days),
    ]);
    return { clientId: client.id, clientName: client.name, periodDays: days, meta, google };
  } catch (err) {
    console.error("[agente/ads] leitura falhou:", err instanceof Error ? err.message : err);
    return null;
  }
}
