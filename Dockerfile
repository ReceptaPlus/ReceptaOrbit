# App Next.js (Recepta Orbit) — build do contexto da RAIZ do repo (monorepo frontend+backend).
# O prebuild do frontend copia ../backend/prisma/schema.prisma; por isso o backend precisa
# estar no contexto. Saída standalone (next.config output:"standalone").
# Base debian-slim p/ casar binaryTargets do Prisma (debian-openssl-3.0.x) + @node-rs/argon2.

# ---- build ----
FROM node:20-bookworm-slim AS build
WORKDIR /repo
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates && rm -rf /var/lib/apt/lists/*

# Schema do backend (necessário p/ o postinstall/prebuild do frontend copiar + prisma generate).
COPY backend/prisma ./backend/prisma
# Deps do frontend (cache-friendly).
COPY frontend/package.json frontend/package-lock.json ./frontend/
WORKDIR /repo/frontend
RUN npm ci
# Código do frontend + build.
COPY frontend ./
RUN npm run build

# ---- runtime ----
FROM node:20-bookworm-slim AS runtime
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates && rm -rf /var/lib/apt/lists/*
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Saída standalone (server.js + node_modules traçados + .prisma client/engine).
COPY --from=build /repo/frontend/.next/standalone ./
COPY --from=build /repo/frontend/.next/static ./.next/static
COPY --from=build /repo/frontend/public ./public

EXPOSE 3000
CMD ["node", "server.js"]
