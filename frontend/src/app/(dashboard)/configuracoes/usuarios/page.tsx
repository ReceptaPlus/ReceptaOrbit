import { listPharmacyUsersVM, type PharmacyUserRole, type PharmacyUserStatus } from "@/modules/settings/queries";

const ROLE_LABEL: Record<PharmacyUserRole, string> = {
  OWNER: "Dono",
  MANAGER: "Gerente",
  VIEWER: "Visualizador",
};

const ROLE_STYLE: Record<PharmacyUserRole, string> = {
  OWNER: "bg-primary-light text-primary",
  MANAGER: "bg-success-bg text-success-text",
  VIEWER: "bg-line-subtle text-secondary",
};

const STATUS_LABEL: Record<PharmacyUserStatus, string> = {
  ACTIVE: "Ativo",
  INVITED: "Convidado",
  SUSPENDED: "Suspenso",
  REVOKED: "Revogado",
};

const STATUS_STYLE: Record<PharmacyUserStatus, string> = {
  ACTIVE: "bg-success-bg text-success-text",
  INVITED: "bg-warning-bg text-warning-text",
  SUSPENDED: "bg-cream-alt text-muted",
  REVOKED: "bg-danger-bg text-danger-text",
};

export default async function UsuariosPage() {
  const users = await listPharmacyUsersVM();

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
            {users.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-secondary">
                  Nenhum usuário vinculado a esta farmácia ainda.
                </td>
              </tr>
            )}
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
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-micro font-semibold ${STATUS_STYLE[u.status]}`}>
                    <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
                    {STATUS_LABEL[u.status]}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-secondary">{u.lastAccess}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
