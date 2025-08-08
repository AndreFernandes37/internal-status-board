# syntax=docker/dockerfile:1

# ---------- Build UI ----------
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY bun.lockb* ./ 2>/dev/null || true
RUN npm ci --no-audit --no-fund
COPY . .
RUN npm run build

# ---------- Runtime ----------
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Create non-root user
RUN addgroup -S app && adduser -S app -G app

# Copy only what we need
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server ./server
COPY --from=builder /app/config ./config
COPY package*.json ./
RUN npm pkg delete scripts && npm pkg set scripts.start="node server/index.js"
RUN npm ci --omit=dev --no-audit --no-fund

USER app
EXPOSE 8080
CMD ["npm","start"]
