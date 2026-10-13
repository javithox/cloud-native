FROM node:22-alpine AS build
WORKDIR /app

COPY package*.json ./

# Cache npm packages and disable heavy network checks/telemetry
RUN --mount=type=cache,target=/root/.npm \
    npm ci --prefer-offline --no-audit --no-fund

COPY . .

RUN npm run build -- --configuration production

FROM node:22-alpine
WORKDIR /app
ENV PORT=4200

COPY --from=build /app/dist/proyecto-angular/browser ./dist
COPY server.js ./server.js
COPY docker-entrypoint.sh ./docker-entrypoint.sh

RUN sed -i 's/\r$//' docker-entrypoint.sh && chmod +x docker-entrypoint.sh

EXPOSE 4200

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -q -O /dev/null http://${EC2_PUBLIC_HOST}:4200/ || exit 1

ENTRYPOINT ["/app/docker-entrypoint.sh"]