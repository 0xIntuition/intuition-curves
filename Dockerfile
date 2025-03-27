FROM oven/bun:1 as builder

# Install Foundry
RUN curl -L https://foundry.paradigm.xyz | bash
RUN /root/.foundry/bin/foundryup

# Set up the app
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install
COPY . .

# Build the app
RUN bun build ./src/index.ts --outdir ./dist

# Production stage
FROM oven/bun:1-slim

# Install Foundry
RUN curl -L https://foundry.paradigm.xyz | bash
RUN /root/.foundry/bin/foundryup

WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./
COPY --from=builder /app/bun.lock ./
RUN bun install --production

ENV PORT=3000
EXPOSE 3000

CMD ["bun", "run", "dist/index.js"] 