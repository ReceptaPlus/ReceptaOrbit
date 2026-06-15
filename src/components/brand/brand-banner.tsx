import Image from "next/image";
import { cn } from "@/lib/utils";
import { BrandPattern } from "./brand-pattern";

/**
 * BrandBanner — banner institucional da marca.
 * Imagem oficial (farmácia moderna) + overlay escuro (leitura) + pattern sutil + slogan.
 * Fotos em /public/brand (extraídas do Manual da Marca).
 * Aplicações: login, onboarding, empty states, dashboard vazio.
 */

const IMAGES = {
  pharmacist: "/brand/pharmacist.jpg",
  office: "/brand/office.jpg",
  person: "/brand/person.jpg",
  mark: "/brand/mark-hero.jpg",
} as const;

export function BrandBanner({
  image = "pharmacist",
  title = "A receita certa para farmácias.",
  subtitle,
  className,
  pattern = "grid",
  children,
}: {
  image?: keyof typeof IMAGES;
  title?: string;
  subtitle?: string;
  className?: string;
  pattern?: "t" | "R" | "grid";
  children?: React.ReactNode;
}) {
  return (
    <div className={cn("relative overflow-hidden rounded-xl", className)}>
      <Image
        src={IMAGES[image]}
        alt=""
        fill
        priority
        sizes="(max-width: 1024px) 100vw, 50vw"
        className="object-cover"
      />
      {/* overlay escuro — leitura + estética dark premium (degradê ink, não colorido) */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0A0D0C] via-[#0A0D0C]/70 to-[#0A0D0C]/30" />
      {/* pattern da marca, sutil, em creme */}
      <div className="text-[#FFF5D9]">
        <BrandPattern variant={pattern} opacity={0.06} />
      </div>
      {/* glow laranja leve (apoio do manual) */}
      <div
        className="absolute -bottom-24 -left-16 h-64 w-64 rounded-full blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(212,67,44,.35), transparent 70%)" }}
        aria-hidden
      />
      <div className="relative flex h-full flex-col justify-end p-8">
        {children}
        <h2 className="font-display font-bold text-display-lg leading-tight text-[#FFF5D9] max-w-md">
          {title}
        </h2>
        {subtitle && <p className="mt-3 text-subtitle text-[#FFF5D9]/80 leading-relaxed max-w-md">{subtitle}</p>}
      </div>
    </div>
  );
}
