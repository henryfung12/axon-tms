# ── Stage 1: Build ──
FROM node:18-alpine AS builder
RUN npm i -g pnpm

WORKDIR /app
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/web/package.json apps/web/
COPY apps/driver/package.json apps/driver/
RUN pnpm install --frozen-lockfile

COPY . .
RUN cd apps/web && pnpm build

# ── Stage 2: Serve ──
FROM nginx:alpine
COPY --from=builder /app/apps/web/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
