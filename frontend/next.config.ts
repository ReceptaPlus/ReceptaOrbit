import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Build standalone p/ imagem Docker enxuta (Railway): server.js + deps traçadas.
  output: "standalone",
  // Pacotes server-side com binários nativos / engine — não empacotar no bundle.
  serverExternalPackages: ["@prisma/client", "@node-rs/argon2", "pg"],
};

export default nextConfig;
