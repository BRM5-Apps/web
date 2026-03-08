# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Build Next.js
RUN npm run build

# Runtime stage
FROM node:20-alpine

RUN apk add --no-cache tini

WORKDIR /app

# Copy built application and node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/public ./public

# Use tini to handle signals properly
ENTRYPOINT ["/sbin/tini", "--"]

EXPOSE 3000

CMD ["npm", "start"]
