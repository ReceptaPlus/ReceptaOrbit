import { db } from "@/server/db";
import { requireCan } from "@/server/auth/dal";
import { CreatePharmacyForm } from "./create-pharmacy-form";

export default async function AdminFarmaciasPage() {
  await requireCan("access_admin"); // defesa em profundidade (além do AdminLayout)
  const pharmacies = await db.pharmacy.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, tradeName: true, cnpj: true, plan: true, status: true },
  });

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-display-lg font-bold tracking-tight text-ink">Farmácias</h1>
        <p className="mt-1 text-body text-secondary">{pharmacies.length} farmácia{pharmacies.length === 1 ? "" : "s"} na plataforma.</p>
      </header>

      <CreatePharmacyForm />

      <div className="card-premium overflow-x-auto p-0">
        <table className="row-stagger w-full text-small">
          <thead>
            <tr className="border-b border-line text-left text-caption font-semibold uppercase tracking-wide text-muted">
              <th className="px-5 py-3.5">Nome</th>
              <th className="px-5 py-3.5">CNPJ</th>
              <th className="px-5 py-3.5">Plano</th>
              <th className="px-5 py-3.5">Status</th>
            </tr>
          </thead>
          <tbody>
            {pharmacies.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-5 py-8 text-center text-secondary">Nenhuma farmácia cadastrada.</td>
              </tr>
            ) : (
              pharmacies.map((p) => (
                <tr key={p.id} className="border-b border-line-subtle transition-colors last:border-0 hover:bg-cream-alt/40">
                  <td className="px-5 py-3.5 font-medium text-ink">{p.tradeName}</td>
                  <td className="px-5 py-3.5 text-secondary" data-numeric>{p.cnpj}</td>
                  <td className="px-5 py-3.5">
                    <span className="inline-flex rounded-md bg-info-bg px-2 py-0.5 text-micro font-semibold text-info-text">{p.plan}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-micro font-semibold ${
                      p.status === "ACTIVE" ? "bg-success-bg text-success-text" : "bg-cream-alt text-muted"
                    }`}>
                      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
                      {p.status === "ACTIVE" ? "Ativa" : p.status}
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
