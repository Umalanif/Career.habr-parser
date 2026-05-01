FROM node:22-bookworm-slim

WORKDIR /app

ENV NODE_ENV=production
ENV DATABASE_URL=file:./data/dev.db

RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl \
  && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
RUN npm ci --include=dev

COPY tsconfig.json prisma.config.ts ./
COPY prisma ./prisma
COPY src ./src
COPY Response.json ./Response.json

RUN npx prisma generate
RUN npm run build
RUN mkdir -p /app/data

CMD ["sh", "-c", "npx prisma db push && node dist/index.js"]
