# Multi-stage build for apps/api
FROM oven/bun:1 as base
WORKDIR /app

# Copy root package files for workspace resolution
COPY package.json bun.lock .npmrc ./

# Copy all workspace packages that api depends on
COPY packages/ ./packages/
COPY apps/api/ ./apps/api/

# Install all dependencies (including workspace deps)
RUN bun install

# Build stage
FROM oven/bun:1 as builder
WORKDIR /app
COPY --from=base /app ./

# Build the API (if you add a build step)
WORKDIR /app/apps/api
RUN bun run build || echo "No build script found"

# Production stage
FROM oven/bun:1-slim as production
WORKDIR /app

# Install curl for health checks
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Copy built application and dependencies
COPY --from=builder /app/apps/api ./
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/node_modules ./node_modules

# Expose port (standard for web servers)
EXPOSE 3222

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3222/health || exit 1

# Run the server
CMD ["bun", "run", "src/index.ts"]