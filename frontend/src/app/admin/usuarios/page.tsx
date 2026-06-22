import { db } from "@/server/db";
import { requireCan } from "@/server/auth/dal";
import { InviteUserForm } from "./invite-user-form";

const STATUS_LABEL: Record<string, string> = {
  INVITED: "Convidado",
  ACTIVE: "Ativo",
  SUSPENDED: "Suspenso",
  REVOKED: "Revogado",
};

export default async function AdminUsuariosPage() {
  await requireCan("access_admin"); // defesa em profundidade (além do AdminLayout)
  const [pharmacies, memberships] = await Promise.all([
    db.pharmacy.findMany({ orderBy: { tradeName: "asc" }, select: { id: true, tradeName: true } }),
    db.membership.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        role: true,
        status: true,
        user: { select: { name: true, email: true } },
        pharmacy: { select: { tradeName: true } },
      },
    }),
  ]);

  const statusCls: Record<string, string> = {
    ACTIVE: "bg-success-bg text-success-text",
    INVITED: "bg-warning-bg text-warning-text",
    SUSPENDED: "bg-danger-bg text-danger-text",
    REVOKED: "bg-cream-alt text-muted",
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-display-lg font-bold tracking-tight text-ink">Usuários</h1>
        <p className="mt-1 text-body text-secondary">{memberships.length} vínculo{memberships.length === 1 ? "" : "s"} entre usuários e farmácias.</p>
      </header>

      <InviteUserForm pharmacies={pharmacies} />

      <div className="card-premium overflow-x-auto p-0">
        <table className="row-stagger w-full text-small">
          <thead>
            <tr className="border-b border-line text-left text-caption font-semibold uppercase tracking-wide text-muted">
              <th className="px-5 py-3.5">Nome</th>
              <th className="px-5 py-3.5">E-mail</th>
              <th className="px-5 py-3.5">Farmácia</th>
              <th className="px-5 py-3.5">Papel</th>
              <th className="px-5 py-3.5">Status</th>
            </tr>
          </thead>
          <tbody>
            {memberships.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-secondary">Nenhum vínculo ainda.</td>
              </tr>
            ) : (
              memberships.map((m) => (
                <tr key={m.id} className="border-b border-line-subtle transition-colors last:border-0 hover:bg-cream-alt/40">
                  <td className="px-5 py-3.5">
                    <span className="flex items-center gap-2.5 font-medium text-ink">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-500/90 to-brand-400 text-[10px] font-semibold text-white">
                        {m.user.name.split(" ").map((w: string) => w[0]).slice(0, 2).join("")}
                      </span>
                      {m.user.name}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-secondary">{m.user.email}</td>
                  <td className="px-5 py-3.5 text-secondary">{m.pharmacy.tradeName}</td>
                  <td className="px-5 py-3.5">
                    <span className="inline-flex rounded-md bg-cream-alt px-2 py-0.5 text-micro font-semibold text-ink">{m.role}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-micro font-semibold ${statusCls[m.status] ?? "bg-cream-alt text-muted"}`}>
                      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
                      {STATUS_LABEL[m.status] ?? m.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
