# ==================================================================
#  RAVENHUB — MULTI-STAGE PRODUCTION BUILD
#  Node pinned to 20.20.2-alpine to match the bytenode (.jsc V8
#  bytecode) compilation environment exactly. Final image < 100 MB.
# ==================================================================

# ---------- Stage 1: dependencies ----------------------------------
FROM node:20.20.2-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev || npm install --omit=dev

# ---------- Stage 2: build ------------------------------------------
FROM node:20.20.2-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
# Build-time env placeholders (not baked into the image):
ENV DATABASE_URL=postgresql://placeholder:placeholder@localhost:5432/placeholder
RUN npm run build

# ---------- Stage 3: runtime (slim, non-root) -----------------------
FROM node:20.20.2-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    HOSTNAME=0.0.0.0
# Bind dynamically to the platform's port (Render/Railway health checks)
ENV PORT=3000

RUN addgroup -S ravenhub && adduser -S ravenhub -G ravenhub
COPY --from=builder --chown=ravenhub:ravenhub /app/.next/standalone ./
COPY --from=builder --chown=ravenhub:ravenhub /app/.next/static ./.next/static
COPY --from=builder --chown=ravenhub:ravenhub /app/public ./public

USER ravenhub
EXPOSE 3000
CMD ["node", "server.js"]
