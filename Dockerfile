FROM node:18.20-alpine AS base 

FROM base AS build
WORKDIR /build

COPY package*.json ./
RUN npm install

COPY . .
ARG NODE_ENV=production
RUN npm run build

FROM base AS app
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nodejs

ARG NODE_ENV=production

COPY --from=build --chown=1001:1001 /build/node_modules/ node_modules/
COPY --from=build --chown=1001:1001 /build/dist .

USER nodejs

CMD ["node", "main.js"]
