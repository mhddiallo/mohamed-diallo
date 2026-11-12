# Image de production du site (Next.js « standalone » + Payload CMS)

FROM node:22-alpine AS base

# --- Dépendances ---
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json .npmrc ./
RUN npm ci

# --- Build ---
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
# Valeurs factices : la base de données n'est pas nécessaire pendant le build
ENV PAYLOAD_SECRET=build-only \
    DATABASE_URL=postgres://build:build@localhost:5432/build
ARG NEXT_PUBLIC_SERVER_URL=https://mohamed-diallo.com
ENV NEXT_PUBLIC_SERVER_URL=$NEXT_PUBLIC_SERVER_URL
RUN npm run build

# --- Exécution ---
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0 \
    MEDIA_DIR=/app/media

RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Dossier des images envoyées depuis l'administration (monté en volume)
RUN mkdir -p /app/media && chown nextjs:nodejs /app/media

USER nextjs
EXPOSE 3000

# Les migrations de la base s'exécutent automatiquement au démarrage
CMD ["node", "server.js"]
