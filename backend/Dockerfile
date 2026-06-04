# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY tsconfig.json ./
COPY src ./src

RUN npm run build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production

COPY --from=builder /app/dist ./dist

ENV PORT=3001
ENV NODE_ENV=production

EXPOSE 3001

CMD ["node", "dist/index.js"]
