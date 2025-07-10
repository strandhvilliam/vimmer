FROM oven/bun:1 as base
WORKDIR /app

RUN echo "Building generate-participant-zip"

COPY package.json bun.lock ./

RUN echo "Copying workspace packages"
# Copy workspace packages
COPY packages/ ./packages/
COPY apps/api/ ./apps/api/
COPY services/generate-participant-zip/ ./services/generate-participant-zip/

RUN echo "Installing dependencies"

# Install dependencies
RUN bun install

RUN echo "Building the app"

# Build the app
WORKDIR /app/services/generate-participant-zip
RUN bun run build

# Production stage
FROM oven/bun:1-slim as production
WORKDIR /app

RUN echo "Copying built application"

# Copy built application
COPY --from=base /app/services/generate-participant-zip/dist ./dist
COPY --from=base /app/node_modules ./node_modules

CMD ["bun", "run", "dist/index.js"]