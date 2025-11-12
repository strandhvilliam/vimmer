FROM oven/bun:1.1.35 as base
WORKDIR /app

RUN echo "Building generate-participant-zip"

# Install system dependencies for sharp
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

COPY package.json bun.lock ./

RUN echo "Copying workspace packages"
# Copy workspace packages
COPY packages/ ./packages/
COPY apps/api/ ./apps/api/
COPY services/generate-participant-zip/ ./services/generate-participant-zip/

RUN echo "Installing dependencies"

# Set environment for sharp to use prebuilt binaries for Linux
ENV SHARP_IGNORE_GLOBAL_LIBVIPS=1

# Install dependencies with proper flags for workspace
RUN bun install --frozen-lockfile

RUN echo "Building the app"

# Build the app
WORKDIR /app/services/generate-participant-zip
RUN bun run build

# Production stage
FROM oven/bun:1.1.35-slim as production
WORKDIR /app

# Install runtime dependencies for sharp
RUN apt-get update && apt-get install -y \
    libvips42 \
    && rm -rf /var/lib/apt/lists/*

RUN echo "Copying built application"

# Copy built application
COPY --from=base /app/services/generate-participant-zip/dist ./dist
COPY --from=base /app/node_modules ./node_modules

CMD ["bun", "run", "dist/index.js"]