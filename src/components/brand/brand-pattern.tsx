import { cn } from "@/lib/utils";

/**
 * BrandPattern — pattern oficial derivado do "R" (perna) e do "t" (cruz).
 * Uso extremamente sutil (opacity 3–8%). Nunca sobre áreas de dados operacionais.
 * Aplicações: login, onboarding, empty states, banners institucionais, hero.
 */
export function BrandPattern({
  variant = "t",
  opacity = 0.05,
  className,
}: {
  variant?: "t" | "R" | "grid";
  opacity?: number;
  className?: string;
}) {
  const id = `bp-${variant}`;
  return (
    <svg
      className={cn("pointer-events-none absolute inset-0 h-full w-full", className)}
      aria-hidden
      style={{ opacity }}
    >
      <defs>
        {variant === "t" && (
          <pattern id={id} width="64" height="64" patternUnits="userSpaceOnUse" patternTransform="rotate(12)">
            {/* cruz do "t" repetida — ritmo modular */}
            <path d="M28 14h8v10h10v8H36v14h-8V32H18v-8h10V14Z" fill="currentColor" />
          </pattern>
        )}
        {variant === "R" && (
          <pattern id={id} width="72" height="72" patternUnits="userSpaceOnUse" patternTransform="rotate(-18)">
            {/* perna do "R" — diagonal arredondada, movimento */}
            <path d="M20 16c0 14 8 20 22 26" stroke="currentColor" strokeWidth="6" strokeLinecap="round" fill="none" />
          </pattern>
        )}
        {variant === "grid" && (
          <pattern id={id} width="120" height="120" patternUnits="userSpaceOnUse">
            {/* grids curvados do manual */}
            <path d="M-20 40 Q 60 -10 140 50" stroke="currentColor" strokeWidth="1.5" fill="none" />
            <path d="M-20 90 Q 60 40 140 100" stroke="currentColor" strokeWidth="1.5" fill="none" />
          </pattern>
        )}
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}
