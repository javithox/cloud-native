FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build -- --configuration production

FROM node:22-alpine
WORKDIR /app
ENV PORT=4200
COPY --from=build /app/dist/proyecto-angular/browser ./dist
COPY server.js ./server.js
COPY docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x docker-entrypoint.sh
EXPOSE 4200
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 CMD wget -q -O /dev/null http://127.0.0.1:4200/ || exit 1
ENTRYPOINT ["/app/docker-entrypoint.sh"]
