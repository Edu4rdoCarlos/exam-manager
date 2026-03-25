FROM node:20-alpine AS builder

WORKDIR /app

# Copy workspace manifests first for layer caching
COPY package.json package-lock.json ./
COPY monorepo/database/package.json ./monorepo/database/
COPY monorepo/backend/package.json ./monorepo/backend/

RUN npm ci

# Copy source
COPY monorepo/database ./monorepo/database
COPY monorepo/backend ./monorepo/backend

# Generate Prisma client (no DB connection needed)
RUN npm run generate --workspace=@exam-manager/database

# Compile NestJS
RUN npm run build --workspace=@exam-manager/backend

# ─── Production image ────────────────────────────────────────────────────────
FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./
COPY monorepo/database/package.json ./monorepo/database/
COPY monorepo/backend/package.json ./monorepo/backend/

RUN npm ci --omit=dev

# Generated Prisma client
COPY --from=builder /app/monorepo/database/src ./monorepo/database/src

# Prisma schema + migrations (needed for migrate deploy at runtime)
COPY --from=builder /app/monorepo/database/prisma ./monorepo/database/prisma

# Compiled backend
COPY --from=builder /app/monorepo/backend/dist ./monorepo/backend/dist

# prisma CLI is a devDep — keep it for the migrate step only
COPY --from=builder /app/node_modules/.bin/prisma ./node_modules/.bin/prisma
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma

EXPOSE 3001

CMD ["sh", "-c", "node_modules/.bin/prisma migrate deploy --schema=./monorepo/database/prisma/schema.prisma && node monorepo/backend/dist/main.js"]
