FROM node:18-alpine AS base
WORKDIR /app

# Install dependencies
FROM base AS deps
COPY package.json package-lock.json* ./
COPY services/user-service/package.json ./services/user-service/
COPY packages/types/package.json ./packages/types/
COPY packages/utils/package.json ./packages/utils/

RUN npm ci

# Generate Prisma client
FROM deps AS prisma
COPY services/user-service/prisma ./services/user-service/prisma
RUN cd services/user-service && npx prisma generate

# Build packages and service
FROM base AS builder
COPY --from=prisma /app/node_modules ./node_modules
COPY . .

RUN npm run build

# Production image
FROM base AS runner
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodejs

COPY --from=builder /app/packages/types/dist ./packages/types/dist
COPY --from=builder /app/packages/utils/dist ./packages/utils/dist
COPY --from=builder /app/services/user-service/dist ./services/user-service/dist
COPY --from=builder /app/services/user-service/prisma ./services/user-service/prisma
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

USER nodejs
EXPOSE 3002

CMD ["sh", "-c", "cd services/user-service && npx prisma migrate deploy && node dist/index.js"]