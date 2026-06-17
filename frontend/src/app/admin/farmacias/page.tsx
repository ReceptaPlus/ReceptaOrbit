import { db } from "@/server/db";
import { CreatePharmacyForm } from "./create-pharmacy-form";

export default async function AdminFarmaciasPage() {
  const pharmacies = await db.pharmacy.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, tradeName: true, cnpj: true, plan: true, status: true },
  });

  return (
    <div className="space-y-8">
      <h1 className="font-display text-display font-bold">Farmácias</h1>

      <CreatePharmacyForm />

      <div className="rounded-xl border border-line overflow-hidden">
        <table className="w-full text-small">
          <thead className="bg-muted text-left text-neutral-600">
            <tr>
              <th className="px-4 py-2 font-medium">Nome</th>
              <th className="px-4 py-2 font-medium">CNPJ</th>
              <th className="px-4 py-2 font-medium">Plano</th>
              <th className="px-4 py-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {pharmacies.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-neutral-500">
                  Nenhuma farmácia cadastrada.
                </td>
              </tr>
            ) : (
              pharmacies.map((p) => (
                <tr key={p.id} className="border-t border-line">
                  <td className="px-4 py-2">{p.tradeName}</td>
                  <td className="px-4 py-2 tabular-nums">{p.cnpj}</td>
                  <td className="px-4 py-2">{p.plan}</td>
                  <td className="px-4 py-2">{p.status}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
