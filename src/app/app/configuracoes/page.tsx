import { users } from "@/lib/mock-data";

const ROLE_LABEL: Record<string, string> = {
  RECEPTA_ADMIN: "Admin Recepta",
  PHARMACY_MANAGER: "Gerente",
  PHARMACY_VIEWER: "Visualizador",
};

const ROLE_STYLE: Record<string, string> = {
  RECEPTA_ADMIN: "bg-primary-light text-primary",
  PHARMACY_MANAGER: "bg-success-bg text-success-text",
  PHARMACY_VIEWER: "bg-line-subtle text-secondary",
};

export default function ConfiguracoesPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold font-display">Configurações</h1>
        <p className="text-sm text-secondary mt-1">Usuários, integrações e dados da farmácia.</p>
      </header>

      {/* Usuários */}
      <section className="bg-card rounded-xl border border-line p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold font-display">Usuários</h2>
          <button className="rounded-lg bg-primary text-white px-4 py-2 text-sm font-medium hover:bg-primary-hover transition-colors">
            Convidar usuário
          </button>
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

      {/* Integrações */}
      <section className="bg-card rounded-xl border border-line p-5">
        <h2 className="font-semibold font-display mb-4">Integrações</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <IntegrationCard
            name="Evolution API (WhatsApp)"
            detail="Instância: drogaria-sp-01 · +55 11 4002-8922"
            connected
          />
          <IntegrationCard
            name="Meta Ads"
            detail="Conta: act_2231… · Sincronizado há 2h"
            connected
          />
          <IntegrationCard
            name="Google Ads"
            detail="Conecte para atribuição via GCLID"
          />
        </div>
      </section>

      {/* Farmácia */}
      <section className="bg-card rounded-xl border border-line p-5">
        <h2 className="font-semibold font-display mb-4">Dados da farmácia</h2>
        <form className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
          <Field label="Nome fantasia" defaultValue="Drogaria São Paulo — Jardim Europa" />
          <Field label="Razão social" defaultValue="DSP Farma Ltda." />
          <Field label="CNPJ" defaultValue="12.345.678/0001-90" />
          <Field label="Fuso horário" defaultValue="America/Sao_Paulo" />
          <div className="sm:col-span-2">
            <button
              type="button"
              className="rounded-lg bg-primary text-white px-5 py-2.5 text-sm font-medium hover:bg-primary-hover transition-colors"
            >
              Salvar alterações
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

function IntegrationCard({ name, detail, connected }: { name: string; detail: string; connected?: boolean }) {
  return (
    <div className="rounded-lg border border-line-subtle p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="font-medium text-sm">{name}</p>
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
          connected ? "bg-success-bg text-success-text" : "bg-line-subtle text-secondary"
        }`}>
          {connected ? "Conectado" : "Desconectado"}
        </span>
      </div>
      <p className="text-xs text-secondary mt-2">{detail}</p>
      <button className={`mt-3 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
        connected
          ? "border border-line text-secondary hover:border-danger-text hover:text-danger-text"
          : "bg-primary text-white hover:bg-primary-hover"
      }`}>
        {connected ? "Desconectar" : "Conectar"}
      </button>
    </div>
  );
}

function Field({ label, defaultValue }: { label: string; defaultValue: string }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1.5">{label}</label>
      <input
        type="text"
        defaultValue={defaultValue}
        className="w-full rounded-lg border border-line bg-subtle px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
      />
    </div>
  );
}
