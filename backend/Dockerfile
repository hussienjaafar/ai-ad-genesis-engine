
# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production stage
FROM node:20-slim

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist

# Install MongoDB client for health checks
RUN apt-get update && apt-get install -y \
    mongodb-client \
    && rm -rf /var/lib/apt/lists/*

EXPOSE 4000

CMD ["node", "dist/server.js"]
