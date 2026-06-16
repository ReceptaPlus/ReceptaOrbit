import { Button } from "@/components/ui/button";
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
    <section className="bg-card rounded-xl border border-line p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold font-display">Usuários</h2>
        <Button size="sm">Convidar usuário</Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-secondary border-b border-line">
              <th className="px-3 py-2.5 font-medium">Nome</th>
              <th className="px-3 py-2.5 font-medium">E-mail</th>
              <th className="px-3 py-2.5 font-medium">Papel</th>
              <th className="px-3 py-2.5 font-medium">Status</th>
              <th className="px-3 py-2.5 font-medium">Último acesso</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line-subtle">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-subtle">
                <td className="px-3 py-3 font-medium">{u.name}</td>
                <td className="px-3 py-3 text-secondary">{u.email}</td>
                <td className="px-3 py-3">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${ROLE_STYLE[u.role]}`}>
                    {ROLE_LABEL[u.role]}
                  </span>
                </td>
                <td className="px-3 py-3">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    u.status === "ACTIVE" ? "bg-success-bg text-success-text" : "bg-line-subtle text-muted"
                  }`}>
                    {u.status === "ACTIVE" ? "Ativo" : "Suspenso"}
                  </span>
                </td>
                <td className="px-3 py-3 text-secondary">{u.lastLoginAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
