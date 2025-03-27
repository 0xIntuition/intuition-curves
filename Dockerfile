FROM oven/bun:1 as builder

# Install dependencies
RUN apt-get update && apt-get install -y curl git

# Install Foundry
RUN curl -L https://foundry.paradigm.xyz | bash && \
    export PATH="$PATH:/root/.foundry/bin" && \
    foundryup

# Set up the app
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install
COPY . .

# Build the optimized binary
RUN bun build \
    --compile \
    --minify-whitespace \
    --minify-syntax \
    --target bun \
    --outfile server \
    ./src/index.ts

# Production stage
FROM oven/bun:1-slim

# Install dependencies
RUN apt-get update && apt-get install -y curl git

# Install Foundry
RUN curl -L https://foundry.paradigm.xyz | bash && \
    export PATH="$PATH:/root/.foundry/bin" && \
    foundryup

WORKDIR /app
COPY --from=builder /app/server ./server
COPY --from=builder /app/package.json ./
COPY --from=builder /app/bun.lock ./
COPY --from=builder /app/scripts ./scripts

RUN bun install --production

ENV PATH="$PATH:/root/.foundry/bin"
ENV PORT=3000

EXPOSE 3000

# Create a startup script
COPY start.sh .
RUN chmod +x start.sh

CMD ["./start.sh"] 