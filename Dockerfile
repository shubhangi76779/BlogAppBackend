# syntax=docker/dockerfile:1

# ---------- BASE IMAGE ----------
ARG NODE_VERSION=18.18.0
FROM node:${NODE_VERSION}-slim as base

LABEL fly_launch_runtime="Node.js/Prisma"

WORKDIR /app

ENV NODE_ENV="production"

# ---------- BUILD IMAGE ----------
FROM base as build

# Install dependencies needed to build Prisma client & native modules
RUN apt-get update -qq && \
    apt-get install -y build-essential openssl pkg-config python-is-python3

# Copy package files & install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy Prisma schema & generate client
COPY backend/prisma ./prisma
RUN npx prisma generate

# Copy the rest of the application code
COPY . .

# ---------- FINAL IMAGE ----------
FROM base

# Install runtime dependencies
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y openssl && \
    rm -rf /var/lib/apt/lists /var/cache/apt/archives

# Copy app from build stage
COPY --from=build /app /app

# Expose server port
EXPOSE 3000

# Start the server