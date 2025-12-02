FROM oven/bun:1 as base
WORKDIR /app

RUN echo "Building zip-worker"

# Copy root package files for workspace resolution
COPY package.json bun.lock ./

# Copy workspace packages that zip-worker depends on
COPY packages/ ./packages/
COPY tasks/zip-worker/ ./tasks/zip-worker/

# Install dependencies (including workspace deps)
RUN bun install

# Production stage
FROM oven/bun:1-slim as production
WORKDIR /app

RUN echo "Copying application and dependencies"

# Copy root package files
COPY package.json bun.lock ./

# Copy workspace packages
COPY packages/ ./packages/

# Copy zip-worker task
COPY tasks/zip-worker/ ./tasks/zip-worker/

# Copy node_modules from build stage
COPY --from=base /app/node_modules ./node_modules

# Set working directory to zip-worker
WORKDIR /app/tasks/zip-worker

# Run the entry point
CMD ["bun", "run", "src/index.ts"]

