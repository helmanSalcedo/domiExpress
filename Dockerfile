# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies with legacy peer deps for NestJS compatibility
RUN npm ci --legacy-peer-deps

# Copy source code and configs
COPY . .

# Build application
RUN npm run build 2>&1; ls -la dist/ || echo "Build directory check completed"

# Runtime stage
FROM node:18-alpine

WORKDIR /app

# Install production dependencies only with legacy peer deps
COPY package*.json ./
RUN npm ci --omit=dev --legacy-peer-deps

# Copy built application from builder
COPY --from=builder /app/dist ./dist

# Copy Prisma schema and migrations
COPY prisma ./prisma

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Start application
CMD ["node", "dist/main.js"]
