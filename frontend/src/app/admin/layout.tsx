import Link from "next/link";
import { requireCan } from "@/server/auth/dal";
import { logoutAction } from "@/server/auth/login";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Área de plataforma — só PLATFORM_ADMIN/SUPPORT (requireCan redireciona os demais).
  await requireCan("access_admin");

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-line bg-card">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="font-display font-semibold">Recepta Orbit · Admin</span>
            <nav className="flex gap-4 text-small text-neutral-600">
              <Link href="/admin/farmacias" className="hover:text-brand-500">Farmácias</Link>
              <Link href="/admin/usuarios" className="hover:text-brand-500">Usuários</Link>
            </nav>
          </div>
          <form action={logoutAction}>
            <button type="submit" className="text-small text-neutral-600 hover:text-brand-500">
              Sair
            </button>
          </form>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-6 py-8">{children}</main>
    </div>
  );
}
