# 1. Base image
FROM oven/bun:1 AS base
WORKDIR /app

# 2. Install dependencies
FROM base AS install
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# 3. Build SvelteKit
FROM install AS build
COPY . .
RUN bun run build

# 4. Production image
FROM oven/bun:1 AS release
WORKDIR /app

# Copy production node_modules
COPY --from=install /app/node_modules ./node_modules

# Copy built SvelteKit output
COPY --from=build /app/build ./build
COPY --from=build /app/.svelte-kit ./.svelte-kit
# COPY --from=build /app/.output ./.output
COPY package.json .

ENV NODE_ENV=production
EXPOSE 3000

# SvelteKit Bun adapter entrypoint
CMD ["bun", "build/index.js"]