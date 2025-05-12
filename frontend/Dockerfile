FROM oven/bun:latest AS builder
WORKDIR /app
COPY . .
RUN bun install --force
EXPOSE 5173
CMD ["bun", "run", "dev", "--host", "0.0.0.0"]
