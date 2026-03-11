# Build stage
FROM oven/bun:latest AS builder

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    make \
    clang \
    lld \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /workspace

COPY package.json ./
RUN bun install

COPY . .
RUN bun run build

# Production stage
FROM nginx:alpine

COPY --from=builder /workspace/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]