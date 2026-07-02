import { redirect } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import { BottomTabs } from "@/components/bottom-tabs";
import { CommandPalette } from "@/components/layout/command-palette";
import { requireSession } from "@/server/auth/dal";
import { exitImpersonationAction } from "@/server/auth/impersonation";
import { db } from "@/server/db";
import { can } from "@/modules/tenancy/authz";
import { countUnreadConversations } from "@/modules/conversations/queries";
import { initials } from "@/lib/format";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  // Defesa em profundidade: além do proxy, valida sessão (assinatura + revogação) no servidor.
  const session = await requireSession();

  // AppLayout é EXCLUSIVO de usuários de farmácia (tenant). Identidade de plataforma
  // (sem pharmacyId) não pertence ao app do tenant → vai para a área /admin.
  if (!session.pharmacyId) redirect("/admin");

  const [user, pharmacy, unreadConversations] = await Promise.all([
    db.user.findUnique({ where: { id: session.userId }, select: { name: true, email: true } }),
    session.pharmacyId
      ? db.pharmacy.findUnique({ where: { id: session.pharmacyId }, select: { tradeName: true } })
      : Promise.resolve(null),
    countUnreadConversations(),
  ]);

  const ROLE_LABELS: Record<string, string> = {
    OWNER: "Proprietária",
    MANAGER: "Gerente",
    VIEWER: "Visualização",
    PLATFORM_ADMIN: "Admin Recepta",
    PLATFORM_SUPPORT: "Suporte Recepta",
  };

  const sidebarUser = {
    name: user?.name ?? "—",
    email: user?.email ?? "",
    pharmacyName: pharmacy?.tradeName ?? "Sem farmácia",
    initials: initials(user?.name ?? pharmacy?.tradeName ?? "?"),
    canAdmin: can("access_admin", session.role),
    roleLabel: ROLE_LABELS[session.role] ?? session.role,
    unreadConversations,
  };

  return (
    <>
      {session.impersonating ? (
        <div className="sticky top-0 z-50 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 border-b border-warning-text/20 bg-warning-bg px-4 py-2 text-small font-medium text-warning-text">
          <span>
            Você está acessando <strong>{pharmacy?.tradeName ?? "esta conta"}</strong> como suporte Recepta —
            todas as ações ficam registradas em seu nome.
          </span>
          <form action={exitImpersonationAction}>
            <button
              type="submit"
              className="rounded-md border border-warning-text/40 bg-white/50 px-3 py-0.5 font-semibold transition-colors hover:bg-white/80"
            >
              Sair da conta
            </button>
          </form>
        </div>
      ) : null}
      <div className="relative flex flex-1">
        <div className="atmosphere" aria-hidden>
        <span className="orb" />
        <span className="mesh" />
      </div>
        <Sidebar user={sidebarUser} />
        <main className="relative z-10 flex-1 min-w-0 p-4 pb-24 md:p-6 md:pb-6 xl:p-8">{children}</main>
        <BottomTabs />
        <CommandPalette />
      </div>
    </>
  );
}
