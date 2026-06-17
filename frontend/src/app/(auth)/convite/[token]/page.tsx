import { db } from "@/server/db";
import { hashToken } from "@/server/auth/tokens";
import { InviteForm } from "./invite-form";

export default async function ConvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params; // Next 16: params é Promise
  // Expiração/uso filtrados no WHERE (sem Date.now() no render); a action re-valida no submit.
  const invite = await db.userInvitation.findFirst({
    where: { tokenHash: hashToken(token), usedAt: null, expiresAt: { gt: new Date() } },
    include: { user: { select: { name: true } } },
  });
  const valid = invite !== null;

  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2.5 mb-8">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-brand-500 to-brand-400 flex items-center justify-center">
            <span className="text-white font-display font-bold">R</span>
          </div>
          <span className="font-display font-semibold text-title tracking-tight">Recepta Orbit</span>
        </div>

        {valid ? (
          <InviteForm token={token} name={invite.user.name} />
        ) : (
          <div>
            <h1 className="font-display text-display font-bold">Convite inválido</h1>
            <p className="text-body text-neutral-600 mt-1.5">
              Este link de primeiro acesso é inválido, já foi usado ou expirou. Peça um novo à equipe Recepta.
            </p>
            <a href="/login" className="inline-block mt-6 text-small text-brand-500 hover:underline">
              Ir para o login
            </a>
          </div>
        )}
      </div>
    </main>
  );
}
