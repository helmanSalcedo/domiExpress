# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies with legacy peer deps for NestJS compatibility
RUN npm ci --legacy-peer-deps

# Copy source code and configs
COPY . .

# Build application - must succeed to ensure path aliases are resolved
RUN npm run build

# Runtime stage
FROM node:18-alpine

WORKDIR /app

# Install dependencies with legacy peer deps (includes tsconfig-paths for path resolution)
COPY package*.json ./
RUN npm ci --legacy-peer-deps

# Copy built application from builder
COPY --from=builder /app/dist ./dist

# Copy Prisma schema and migrations
COPY prisma ./prisma

# Copy TypeScript config for tsconfig-paths runtime resolution
COPY tsconfig*.json ./

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Start application with tsconfig-paths for path alias resolution
CMD ["node", "-r", "tsconfig-paths/register", "dist/main.js"]
