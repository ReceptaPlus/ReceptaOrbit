import { listUsers } from "@/modules/settings/api";
import { ROLE_LABEL } from "@/lib/constants";

const ROLE_STYLE: Record<string, string> = {
  RECEPTA_ADMIN: "bg-primary-light text-primary",
  PHARMACY_MANAGER: "bg-success-bg text-success-text",
  PHARMACY_VIEWER: "bg-line-subtle text-secondary",
};

export default function UsuariosPage() {
  const users = listUsers();

  return (
    <section className="card-premium p-0">
      <div className="flex items-center justify-between border-b border-line-subtle px-5 py-4">
        <h2 className="font-display text-subtitle font-semibold text-ink">Usuários da farmácia</h2>
        <button className="btn-primary !h-9 !px-3.5 text-small">Convidar usuário</button>
      </div>
      <div className="overflow-x-auto">
        <table className="row-stagger w-full text-small">
          <thead>
            <tr className="border-b border-line text-left text-caption font-semibold uppercase tracking-wide text-muted">
              <th className="px-5 py-3.5">Nome</th>
              <th className="px-5 py-3.5">E-mail</th>
              <th className="px-5 py-3.5">Papel</th>
              <th className="px-5 py-3.5">Status</th>
              <th className="px-5 py-3.5">Último acesso</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-line-subtle transition-colors last:border-0 hover:bg-cream-alt/40">
                <td className="px-5 py-3.5">
                  <span className="flex items-center gap-2.5 font-medium text-ink">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-500/90 to-brand-400 text-[10px] font-semibold text-white">
                      {u.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                    </span>
                    {u.name}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-secondary">{u.email}</td>
                <td className="px-5 py-3.5">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-micro font-semibold ${ROLE_STYLE[u.role]}`}>
                    {ROLE_LABEL[u.role]}
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-micro font-semibold ${
                    u.status === "ACTIVE" ? "bg-success-bg text-success-text" : "bg-cream-alt text-muted"
                  }`}>
                    <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
                    {u.status === "ACTIVE" ? "Ativo" : "Suspenso"}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-secondary">{u.lastLoginAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
