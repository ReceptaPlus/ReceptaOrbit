import { Sidebar } from "@/components/sidebar";
import { BottomTabs } from "@/components/bottom-tabs";
import { CommandPalette } from "@/components/layout/command-palette";
import { requireSession } from "@/server/auth/dal";
import { db } from "@/server/db";
import { can } from "@/modules/tenancy/authz";
import { initials } from "@/lib/format";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  // Defesa em profundidade: além do proxy, valida sessão (assinatura + revogação) no servidor.
  const session = await requireSession();

  const [user, pharmacy] = await Promise.all([
    db.user.findUnique({ where: { id: session.userId }, select: { name: true, email: true } }),
    session.pharmacyId
      ? db.pharmacy.findUnique({ where: { id: session.pharmacyId }, select: { tradeName: true } })
      : Promise.resolve(null),
  ]);

  const sidebarUser = {
    name: user?.name ?? "—",
    email: user?.email ?? "",
    pharmacyName: pharmacy?.tradeName ?? "Sem farmácia",
    initials: initials(pharmacy?.tradeName ?? user?.name ?? "?"),
    canAdmin: can("access_admin", session.role),
  };

  return (
    <div className="flex flex-1">
      <Sidebar user={sidebarUser} />
      <main className="flex-1 min-w-0 p-4 pb-24 md:p-6 md:pb-6 xl:p-8">{children}</main>
      <BottomTabs />
      <CommandPalette />
    </div>
  );
}
