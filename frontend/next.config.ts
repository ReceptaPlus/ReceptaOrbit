import type { NextConfig } from "next";

// Cabeçalhos de segurança aplicados a todas as respostas. Sem CSP estrita aqui
// (risco de quebrar scripts inline do Next) — CSP entra depois, testada. Estes são
// seguros e cobrem clickjacking, MIME sniffing, vazamento de referrer e HSTS.
const SECURITY_HEADERS = [
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "X-DNS-Prefetch-Control", value: "off" },
];

const nextConfig: NextConfig = {
  // Build standalone p/ imagem Docker enxuta (Railway): server.js + deps traçadas.
  output: "standalone",
  // Pacotes server-side com binários nativos / engine — não empacotar no bundle.
  serverExternalPackages: ["@prisma/client", "@node-rs/argon2", "pg"],
  async headers() {
    return [{ source: "/:path*", headers: SECURITY_HEADERS }];
  },
};

export default nextConfig;
