# ── Stage 1: Build ──
FROM node:20-alpine AS build

# Install pnpm globally
RUN npm install -g pnpm

WORKDIR /app

# Copy package files first for better Docker layer caching
COPY package.json pnpm-lock.yaml ./

# Install all dependencies (including devDependencies needed for build)
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build the application for production
RUN pnpm build

# ── Stage 2: Production ──
FROM node:20-alpine AS production

RUN npm install -g pnpm

WORKDIR /app

# Copy only package files and install production dependencies
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod

# Copy only the built output from the build stage
COPY --from=build /app/dist ./dist

# Expose port 4000 (default for Angular SSR)
EXPOSE 4000

# Set production environment
ENV NODE_ENV=production

# Start the SSR server
CMD ["node", "dist/pwa-angular21/server/server.mjs"]
