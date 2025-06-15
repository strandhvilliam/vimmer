FROM oven/bun:1 as base
WORKDIR /app

COPY package.json bun.lock ./

# Copy workspace packages
COPY packages/ ./packages/
COPY services/export-submission-zip/ ./services/export-submission-zip/

# Install dependencies
RUN bun install

# Build the app
WORKDIR /app/services/export-submission-zip
RUN bun run build

# Production stage
FROM oven/bun:1-slim as production
WORKDIR /app

# Copy built application
COPY --from=base /app/services/export-submission-zip/dist ./dist
COPY --from=base /app/node_modules ./node_modules

CMD ["bun", "run", "dist/index.js"]