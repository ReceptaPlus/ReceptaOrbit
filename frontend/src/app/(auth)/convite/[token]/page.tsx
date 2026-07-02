import Link from "next/link";
import { db } from "@/server/db";
import { hashToken } from "@/server/auth/tokens";
import { InviteForm } from "./invite-form";

export default async function ConvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params; // Next 16: params é Promise

  const invite = await db.userInvitation.findFirst({
    where: { tokenHash: hashToken(token), usedAt: null, expiresAt: { gt: new Date() } },
    include: {
      user: {
        select: {
          name: true,
          memberships: {
            where: { status: "INVITED" },
            select: { pharmacy: { select: { tradeName: true } } },
          },
        },
      },
    },
  });
  const valid = invite !== null;
  const name = invite?.user.name ?? "";
  const pharmacyNames = invite?.user.memberships.map((m) => m.pharmacy.tradeName) ?? [];

  return (
    <main className="relative grid min-h-screen flex-1 overflow-hidden lg:grid-cols-2">
      {/* Hero da marca */}
      <section className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-brand-500 via-brand-500 to-brand-400 p-12 text-white lg:flex">
        <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.18]" viewBox="0 0 600 800" fill="none" aria-hidden>
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <path key={i} d={`M-50 ${120 + i * 120} Q 300 ${40 + i * 120} 650 ${150 + i * 120}`} stroke="white" strokeWidth="1.5" />
          ))}
        </svg>
        <span className="pointer-events-none absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-white/10 blur-3xl" />

        <div className="relative flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/mark-white.svg" alt="Recepta" className="h-10 w-10" />
          <span className="font-display text-title font-semibold">Recepta <span className="font-normal text-white/70">Orbit</span></span>
        </div>

        <div className="relative max-w-md">
          <h2 className="font-display text-display-lg font-bold leading-tight">Primeiro acesso</h2>
          <p className="mt-4 text-subtitle leading-relaxed text-white/85">
            Defina sua senha e ative seu acesso à plataforma da sua farmácia. Leva menos de um minuto.
          </p>
        </div>

        <p className="relative text-caption text-white/70">Crescimento previsível para farmácias · Recepta</p>
      </section>

      {/* Conteúdo */}
      <section className="relative flex items-center justify-center p-6">
        <div className="atmosphere lg:hidden" aria-hidden>
          <span className="orb" />
          <span className="mesh" />
        </div>
        <div className="relative z-10 w-full max-w-sm animate-fade-in-up">
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/mark-gradient.svg" alt="Recepta" className="h-9 w-9" />
            <span className="font-display text-title font-semibold tracking-tight text-ink">
              Recepta <span className="font-normal text-secondary">Orbit</span>
            </span>
          </div>

          {valid ? (
            <InviteForm token={token} name={name} pharmacyNames={pharmacyNames} />
          ) : (
            <div>
              <h1 className="font-display text-display font-bold text-ink">Convite inválido</h1>
              <p className="mt-1.5 text-body text-neutral-600">
                Este link de primeiro acesso é inválido, já foi usado ou expirou. Peça um novo à equipe Recepta.
              </p>
              <Link href="/login" className="mt-6 inline-block text-small text-brand-500 hover:underline">
                Ir para o login
              </Link>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
