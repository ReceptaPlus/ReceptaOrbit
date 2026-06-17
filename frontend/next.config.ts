import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pacotes server-side com binários nativos / engine — não empacotar no bundle.
  serverExternalPackages: ["@prisma/client", "@node-rs/argon2"],
};

export default nextConfig;
