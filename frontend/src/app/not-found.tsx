import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-3 p-6 text-center">
      <p className="font-display text-display-lg font-bold text-ink">404</p>
      <p className="text-body text-secondary">Página não encontrada.</p>
      <Link href="/dashboard" className="mt-2 text-small text-brand-500 hover:underline">
        Voltar ao início
      </Link>
    </main>
  );
}
