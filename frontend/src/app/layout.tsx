import type { Metadata } from "next";
import { Montserrat, Poppins } from "next/font/google";
import { Providers } from "@/providers";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

/* Nexa (manual da marca) só vem como Trial/Demo no Brand Kit — marca d'água nos
   números e sem "ç". Web usa Poppins como substituta oficial (display). */

export const metadata: Metadata = {
  title: "Recepta Orbit",
  description: "CRM e Analytics de conversas WhatsApp para farmácias",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${montserrat.variable} ${poppins.variable} h-full antialiased`}>
      {/* suppressHydrationWarning: extensões de navegador (ex.: ColorZilla → cz-shortcut-listen)
          injetam atributos no body antes da hidratação. Suprime só o atributo do próprio body. */}
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <Providers>
          {children}
          <Toaster position="bottom-right" />
        </Providers>
      </body>
    </html>
  );
}
