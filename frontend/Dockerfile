# frontend/Dockerfile
# 1. Base Node image
FROM node:20-bookworm-slim AS base
# bookworm-slim already uses glibc, so no need for libc6-compat

# 2. Build the source code
FROM base AS builder
WORKDIR /app

# Copy ALL dependency files
COPY package.json package-lock.json ./
# Remove the Windows-generated lockfile to force NPM to fetch Linux optional dependencies (like lightningcss and swc)
RUN rm package-lock.json && npm install

# Copy application files
COPY next.config.js tsconfig.json postcss.config.mjs tailwind.config.js ./
COPY public ./public
COPY src ./src

# Declare build-time environment variables
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Build Next.js app
RUN npm run build

# 3. Production runner
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy only what's needed to run the app
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/drizzle ./drizzle
COPY --from=builder /app/drizzle.config.ts ./drizzle.config.ts
COPY --from=builder /app/src/lib/schema.ts ./src/lib/schema.ts

USER nextjs

EXPOSE 3000

CMD ["npx", "next", "start"]
