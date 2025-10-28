# Dockerfile para Next.js App
FROM node:20-alpine AS base

# Instalar dependencias necesarias
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copiar package files
COPY package*.json ./

# Instalar dependencias
FROM base AS deps
RUN npm ci

# Builder stage
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generar Prisma Client (set dummy DATABASE_URL for build)
ENV DATABASE_URL="postgresql://user:password@localhost:5432/db"
# Next.js build environment variables
ENV NEXT_PUBLIC_APP_NAME="MastIdea"
ENV NODE_ENV="production"
ENV NEXT_TELEMETRY_DISABLED=1
# Dummy values for build-time environment variables
ENV OPENROUTER_API_KEY="dummy"
ENV OPENAI_API_KEY="dummy"
ENV QDRANT_URL="http://dummy:6333"
ENV QDRANT_COLLECTION="dummy"
RUN npx prisma generate

# Build Next.js
RUN npm run build

# Production stage
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Crear usuario no-root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copiar archivos necesarios
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
# Copiar node_modules completos para tener todas las dependencias de socket.io
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
# Copiar server.js personalizado y lib DESPUÉS del standalone para sobrescribirlo
COPY --from=builder /app/server.js ./server.js
COPY --from=builder /app/lib ./lib

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
