import { db } from "@/server/db";
import { InviteUserForm } from "./invite-user-form";

const STATUS_LABEL: Record<string, string> = {
  INVITED: "Convidado",
  ACTIVE: "Ativo",
  SUSPENDED: "Suspenso",
  REVOKED: "Revogado",
};

export default async function AdminUsuariosPage() {
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

  return (
    <div className="space-y-8">
      <h1 className="font-display text-display font-bold">Usuários</h1>

      <InviteUserForm pharmacies={pharmacies} />

      <div className="rounded-xl border border-line overflow-hidden">
        <table className="w-full text-small">
          <thead className="bg-muted text-left text-neutral-600">
            <tr>
              <th className="px-4 py-2 font-medium">Nome</th>
              <th className="px-4 py-2 font-medium">E-mail</th>
              <th className="px-4 py-2 font-medium">Farmácia</th>
              <th className="px-4 py-2 font-medium">Papel</th>
              <th className="px-4 py-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {memberships.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-neutral-500">
                  Nenhum vínculo ainda.
                </td>
              </tr>
            ) : (
              memberships.map((m) => (
                <tr key={m.id} className="border-t border-line">
                  <td className="px-4 py-2">{m.user.name}</td>
                  <td className="px-4 py-2">{m.user.email}</td>
                  <td className="px-4 py-2">{m.pharmacy.tradeName}</td>
                  <td className="px-4 py-2">{m.role}</td>
                  <td className="px-4 py-2">{STATUS_LABEL[m.status] ?? m.status}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
