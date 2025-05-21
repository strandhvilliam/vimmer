FROM oven/bun:1.1-slim

WORKDIR /app

# Copy package.json and install dependencies
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile

# Copy the application code
COPY . .

# Build the application
RUN bun run build

# Run the application
CMD ["bun", "run", "start"] 