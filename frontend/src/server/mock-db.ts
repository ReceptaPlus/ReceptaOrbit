import "server-only";
import {
  pharmacies,
  users,
  platformStaff,
  memberships,
  whatsappConnections,
  contacts,
  conversationCycles,
  messages,
  auditLogs,
} from "@/mocks";

/* ==========================================================================
   Mock DB — engine Prisma-shaped em memória (modo SEM Postgres).
   Serve os arrays de src/mocks com a mesma API do PrismaClient usada no app:
   findUnique / findFirst / findMany / count / create / update / upsert,
   com where (equals, gte/lte/gt/lt, in, not), orderBy, take, select, include
   e _count de relações. Ativado quando não há DATABASE_URL (ver server/db.ts).
   ========================================================================== */

type Row = Record<string, unknown>;

/* Coleções mutáveis (clonadas p/ não vazar entre requests em dev). */
const store: Record<string, Row[]> = {
  pharmacy: clone(pharmacies),
  user: clone(users),
  platformStaff: clone(platformStaff),
  membership: clone(memberships),
  whatsAppConnection: clone(whatsappConnections),
  contact: clone(contacts),
  conversationCycle: clone(conversationCycles),
  message: clone(messages),
  auditLog: clone(auditLogs),
  webhookEvent: [],
  userInvitation: [],
  legalDocument: [],
  userLegalAcceptance: [],
};

function clone<T>(arr: T[]): Row[] {
  return arr.map((x) => ({ ...(x as Row) }));
}

/* Relações: (model, relationName) → resolver(row) */
type RelResolver = (row: Row) => { many: boolean; rows: Row[] };
const relations: Record<string, Record<string, RelResolver>> = {
  conversationCycle: {
    contact: (r) => ({
      many: false,
      rows: store.contact.filter((c) => c.id === r.contactId),
    }),
    messages: (r) => ({
      many: true,
      rows: store.message.filter((m) => m.cycleId === r.id),
    }),
  },
  contact: {
    cycles: (r) => ({
      many: true,
      rows: store.conversationCycle.filter((c) => c.contactId === r.id),
    }),
  },
  message: {
    cycle: (r) => ({
      many: false,
      rows: store.conversationCycle.filter((c) => c.id === r.cycleId),
    }),
  },
  membership: {
    user: (r) => ({ many: false, rows: store.user.filter((u) => u.id === r.userId) }),
    pharmacy: (r) => ({ many: false, rows: store.pharmacy.filter((p) => p.id === r.pharmacyId) }),
  },
  user: {
    memberships: (r) => ({ many: true, rows: store.membership.filter((m) => m.userId === r.id) }),
  },
  pharmacy: {
    memberships: (r) => ({ many: true, rows: store.membership.filter((m) => m.pharmacyId === r.id) }),
  },
};

const COUNT_TARGET: Record<string, Record<string, string>> = {
  conversationCycle: { messages: "message" },
  contact: { cycles: "conversationCycle" },
};

/* Prisma devolve DateTime como Date; os mocks guardam ISO string. Convertendo na
   saída, o código de query (c.lastMessageAt.toISOString()) funciona igual ao Prisma. */
const ISO_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:?\d{2})$/;
function coerceDates(v: unknown): unknown {
  if (typeof v === "string") return ISO_RE.test(v) ? new Date(v) : v;
  if (Array.isArray(v)) return v.map(coerceDates);
  if (v && typeof v === "object" && !(v instanceof Date)) {
    const out: Row = {};
    for (const [k, val] of Object.entries(v as Row)) out[k] = coerceDates(val);
    return out;
  }
  return v;
}

function asDate(v: unknown): number {
  if (v instanceof Date) return v.getTime();
  if (typeof v === "string" || typeof v === "number") return new Date(v).getTime();
  return NaN;
}

function matchOne(value: unknown, cond: unknown): boolean {
  if (cond === null || typeof cond !== "object" || cond instanceof Date) {
    // igualdade direta (datas comparadas por timestamp)
    if (cond instanceof Date || value instanceof Date) return asDate(value) === asDate(cond);
    return value === cond;
  }
  const c = cond as Row;
  if ("equals" in c) return matchOne(value, c.equals);
  if ("in" in c) return Array.isArray(c.in) && (c.in as unknown[]).some((x) => matchOne(value, x));
  if ("not" in c) return !matchOne(value, c.not);
  if ("gte" in c) return asDate(value) >= asDate(c.gte);
  if ("lte" in c) return asDate(value) <= asDate(c.lte);
  if ("gt" in c) return asDate(value) > asDate(c.gt);
  if ("lt" in c) return asDate(value) < asDate(c.lt);
  if ("contains" in c)
    return typeof value === "string" && value.toLowerCase().includes(String(c.contains).toLowerCase());
  return false;
}

function matchWhere(row: Row, where?: Row): boolean {
  if (!where) return true;
  for (const [key, cond] of Object.entries(where)) {
    if (key === "AND") {
      if (!(cond as Row[]).every((w) => matchWhere(row, w))) return false;
      continue;
    }
    if (key === "OR") {
      if (!(cond as Row[]).some((w) => matchWhere(row, w))) return false;
      continue;
    }
    // chave composta tipo pharmacyId_userId: { pharmacyId, userId }
    if (cond && typeof cond === "object" && !(cond instanceof Date) && key.includes("_") && !("equals" in (cond as Row))) {
      const sub = cond as Row;
      const keys = Object.keys(sub);
      const looksComposite = keys.every((k) => key.includes(k));
      if (looksComposite) {
        if (!keys.every((k) => matchOne(row[k], sub[k]))) return false;
        continue;
      }
    }
    if (!matchOne(row[key], cond)) return false;
  }
  return true;
}

function applyOrderBy(rows: Row[], orderBy?: Row | Row[]): Row[] {
  if (!orderBy) return rows;
  const orders = Array.isArray(orderBy) ? orderBy : [orderBy];
  return [...rows].sort((a, b) => {
    for (const o of orders) {
      const [field, dir] = Object.entries(o)[0] as [string, "asc" | "desc"];
      let av: unknown = a[field];
      let bv: unknown = b[field];
      const an = asDate(av);
      const bn = asDate(bv);
      let cmp = 0;
      if (!Number.isNaN(an) && !Number.isNaN(bn) && typeof av !== "number" && typeof bv !== "number") {
        cmp = an - bn;
      } else if (typeof av === "number" && typeof bv === "number") {
        cmp = av - bv;
      } else {
        cmp = String(av ?? "").localeCompare(String(bv ?? ""));
      }
      if (cmp !== 0) return dir === "desc" ? -cmp : cmp;
    }
    return 0;
  });
}

function project(model: string, row: Row, opts: Row): Row {
  const select = opts.select as Row | undefined;
  const include = opts.include as Row | undefined;
  let out: Row;
  if (select) {
    out = {};
    for (const [field, val] of Object.entries(select)) {
      if (!val) continue;
      if (field === "_count") {
        out._count = countRel(model, row, (val as Row).select as Row);
      } else if (relations[model]?.[field]) {
        out[field] = resolveRel(model, field, row, val as Row);
      } else {
        out[field] = row[field];
      }
    }
  } else {
    out = { ...row };
  }
  if (include) {
    for (const [field, val] of Object.entries(include)) {
      if (!val) continue;
      if (field === "_count") {
        out._count = countRel(model, row, (val as Row).select as Row);
      } else {
        out[field] = resolveRel(model, field, row, val === true ? {} : (val as Row));
      }
    }
  }
  return out;
}

function countRel(model: string, row: Row, sel: Row): Row {
  const res: Row = {};
  for (const rel of Object.keys(sel)) {
    const target = COUNT_TARGET[model]?.[rel];
    if (!target) {
      res[rel] = 0;
      continue;
    }
    res[rel] = relations[model][rel](row).rows.length;
  }
  return res;
}

function resolveRel(model: string, field: string, row: Row, opts: Row): unknown {
  const resolver = relations[model][field];
  const { many, rows } = resolver(row);
  const relModel = relModelName(model, field);
  let filtered = rows.filter((r) => matchWhere(r, opts.where as Row));
  filtered = applyOrderBy(filtered, opts.orderBy as Row);
  if (typeof opts.take === "number") filtered = filtered.slice(0, opts.take as number);
  const projected = filtered.map((r) => project(relModel, r, opts));
  return many ? projected : projected[0] ?? null;
}

function relModelName(model: string, field: string): string {
  if (field === "contact") return "contact";
  if (field === "messages") return "message";
  if (field === "cycles") return "conversationCycle";
  if (field === "cycle") return "conversationCycle";
  if (field === "user") return "user";
  if (field === "pharmacy") return "pharmacy";
  if (field === "memberships") return "membership";
  return field;
}

function makeModel(model: string) {
  const rows = () => store[model] ?? [];
  return {
    findMany: async (args: Row = {}) => {
      let r = rows().filter((x) => matchWhere(x, args.where as Row));
      r = applyOrderBy(r, args.orderBy as Row);
      if (typeof args.skip === "number") r = r.slice(args.skip as number);
      if (typeof args.take === "number") r = r.slice(0, args.take as number);
      return r.map((x) => coerceDates(project(model, x, args)));
    },
    findFirst: async (args: Row = {}) => {
      let r = rows().filter((x) => matchWhere(x, args.where as Row));
      r = applyOrderBy(r, args.orderBy as Row);
      return r.length ? coerceDates(project(model, r[0], args)) : null;
    },
    findUnique: async (args: Row = {}) => {
      const r = rows().find((x) => matchWhere(x, args.where as Row));
      return r ? coerceDates(project(model, r, args)) : null;
    },
    count: async (args: Row = {}) => rows().filter((x) => matchWhere(x, args.where as Row)).length,
    create: async (args: Row) => {
      const data = { ...(args.data as Row) };
      if (!data.id) data.id = `${model}_${Math.round(performance.now() * 1000)}`;
      rows().push(data);
      return project(model, data, args);
    },
    update: async (args: Row) => {
      const r = rows().find((x) => matchWhere(x, args.where as Row));
      if (r) Object.assign(r, args.data as Row);
      return r ? project(model, r, args) : null;
    },
    upsert: async (args: Row) => {
      const r = rows().find((x) => matchWhere(x, args.where as Row));
      if (r) {
        Object.assign(r, args.update as Row);
        return project(model, r, args);
      }
      const data = { ...(args.where as Row), ...(args.create as Row) };
      rows().push(data);
      return project(model, data, args);
    },
    delete: async (args: Row) => {
      const i = rows().findIndex((x) => matchWhere(x, args.where as Row));
      if (i >= 0) return rows().splice(i, 1)[0];
      return null;
    },
  };
}

const handler: ProxyHandler<Record<string, unknown>> = {
  get(_t, prop: string) {
    if (prop === "$connect" || prop === "$disconnect") return async () => {};
    if (prop === "$transaction")
      return async (arg: unknown) =>
        Array.isArray(arg) ? Promise.all(arg) : (arg as (db: unknown) => unknown)(proxy);
    if (!cache[prop]) cache[prop] = makeModel(prop);
    return cache[prop];
  },
};
const cache: Record<string, ReturnType<typeof makeModel>> = {};
const proxy = new Proxy({}, handler);

export const mockDb = proxy;
