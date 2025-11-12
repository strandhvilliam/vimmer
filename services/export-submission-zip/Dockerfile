FROM oven/bun:1.1.35 as base
WORKDIR /app

# Install system dependencies for sharp
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

COPY package.json bun.lock ./

# Copy workspace packages
COPY packages/ ./packages/
COPY apps/api/ ./apps/api/
COPY services/export-submission-zip/ ./services/export-submission-zip/

# Set environment for sharp to use prebuilt binaries for Linux
ENV SHARP_IGNORE_GLOBAL_LIBVIPS=1

# Install dependencies with proper flags for workspace
RUN bun install --frozen-lockfile

# Build the app
WORKDIR /app/services/export-submission-zip
RUN bun run build

# Production stage
FROM oven/bun:1.1.35-slim as production
WORKDIR /app

# Install runtime dependencies for sharp
RUN apt-get update && apt-get install -y \
    libvips42 \
    && rm -rf /var/lib/apt/lists/*

# Copy built application
COPY --from=base /app/services/export-submission-zip/dist ./dist
COPY --from=base /app/node_modules ./node_modules

CMD ["bun", "run", "dist/index.js"]