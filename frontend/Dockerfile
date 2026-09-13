# syntax=docker/dockerfile:1

# The site, as a runnable image.
#
# Three stages so that the npm cache, the build and the runtime each have
# their own layer: editing a component re-runs only the build, and touching
# `package-lock.json` is the only thing that re-installs anything.
#
# The runtime stage carries Next's standalone output, which is the app plus
# exactly the dependencies it turned out to need — a couple of hundred
# megabytes against a gigabyte for a naive copy of the whole project.

FROM node:24-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci


FROM node:24-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Where the site is mounted on the host. This is baked in rather than passed
# at run time, and it has to be: `NEXT_PUBLIC_*` are compile-time constants
# that end up inside every asset URL in the bundle. An image is therefore tied
# to the path it was built for. Empty means the root of a domain.
ARG NEXT_PUBLIC_BASE_PATH=""
ENV NEXT_PUBLIC_BASE_PATH=$NEXT_PUBLIC_BASE_PATH

ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build


FROM node:24-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

RUN addgroup -g 1001 -S nodejs && adduser -S -u 1001 -G nodejs nextjs

# `public` and `.next/static` are served straight off disk and are not part of
# the traced output, so they are copied separately.
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Written to at run time by the image optimiser; owned up front so the
# unprivileged user can create it even without a volume mounted.
RUN mkdir -p .next/cache && chown -R nextjs:nodejs .next/cache

USER nextjs
EXPOSE 3000

CMD ["node", "server.js"]
