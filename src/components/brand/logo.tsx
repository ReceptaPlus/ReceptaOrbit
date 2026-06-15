import { cn } from "@/lib/utils";

/**
 * Logo oficial Recepta.
 * - variant="mark": monograma "Rt" (R com t integrado) — favicon, sidebar colapsada, mobile.
 * - variant="wordmark": marca + wordmark "Recepta".
 * Cor herda de currentColor — usar creme (#FFF5D9) sobre fundo escuro (versão negativa).
 * Proibido pelo manual: sombra, gradiente, recolorir, deformar. Aqui: forma pura, monocromática.
 */

function Mark({ size = 28, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      className={className}
      role="img"
      aria-label="Recepta"
    >
      {/* "R" — haste + bojo + perna (geometria do manual) */}
      <path
        d="M8 6h13.5c5.4 0 9.5 3.9 9.5 9.2 0 4-2.4 7.2-6 8.5L33 42h-7.6l-7-16.4H15V42H8V6Zm7 6.2v7.4h6.1c2.3 0 3.9-1.5 3.9-3.7s-1.6-3.7-3.9-3.7H15Z"
        fill="currentColor"
      />
      {/* "t" integrado — haste + cruz (motivo farmacêutico) */}
      <path
        d="M37 14h5v5h4v5h-4v9.5c0 1.4.7 2 2 2h2v5h-3.4c-3.9 0-6.6-2.4-6.6-6.6V24h-3v-5h3v-5Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function Logo({
  variant = "wordmark",
  size = 28,
  className,
}: {
  variant?: "mark" | "wordmark";
  size?: number;
  className?: string;
}) {
  if (variant === "mark") return <Mark size={size} className={className} />;

  return (
    <span className={cn("inline-flex items-center gap-2.5 text-ink", className)}>
      <Mark size={size} />
      <span className="font-display font-bold tracking-tight leading-none" style={{ fontSize: size * 0.72 }}>
        Recepta
      </span>
    </span>
  );
}
