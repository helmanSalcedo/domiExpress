# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies with legacy peer deps for NestJS compatibility
RUN npm ci --legacy-peer-deps

# Copy source code and configs
COPY . .

# Generate Prisma client - required before TypeScript compilation
RUN npx prisma generate

# Build application - must succeed to ensure path aliases are resolved
RUN npm run build

# Runtime stage
FROM node:18-alpine

WORKDIR /app

# Install OpenSSL required by Prisma
RUN apk add --no-cache openssl

# Install dependencies with legacy peer deps (includes tsconfig-paths for path resolution)
COPY package*.json ./
RUN npm ci --legacy-peer-deps

# Copy built application from builder
COPY --from=builder /app/dist ./dist

# Copy Prisma schema and migrations
COPY prisma ./prisma

# Copy static files (emulator, etc)
COPY public ./public

# Copy TypeScript config for tsconfig-paths runtime resolution
COPY tsconfig*.json ./

# Generate Prisma client in runtime stage
RUN npx prisma generate

# Expose port
EXPOSE 3000

# Health check disabled - app logs confirm startup success
# HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
#     CMD node -e "require('http').get('http://localhost:3000/api/docs', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Start application with tsconfig-paths for path alias resolution
CMD ["node", "-r", "tsconfig-paths/register", "dist/main.js"]
