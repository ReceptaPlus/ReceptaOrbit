import { redirect } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import { BottomTabs } from "@/components/bottom-tabs";
import { CommandPalette } from "@/components/layout/command-palette";
import { requireSession } from "@/server/auth/dal";
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
  );
}
