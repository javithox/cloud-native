# Stage 1: Build
FROM node:22-alpine AS builder

WORKDIR /build

# Copiar package files
COPY package*.json ./

# Instalar dependencias
RUN npm ci

# Copiar código fuente
COPY . .

# Build
RUN npm run build

# Stage 2: Runtime - Servidor Node
FROM node:22-alpine

WORKDIR /app

# Copiar package files
COPY package*.json ./

# Instalar solo dependencias de producción
RUN npm ci --only=production && \
    npm install -g express

# Copiar build del stage anterior
COPY --from=builder /build/dist ./dist

# Crear archivo server.js simple para servir la app
RUN echo 'const express = require("express"); \
const app = express(); \
const PORT = process.env.PORT || 4200; \
app.use(express.static("dist/proyecto-angular/browser")); \
app.get("/*", (req, res) => { res.sendFile("dist/proyecto-angular/browser/index.html", { root: __dirname }); }); \
app.listen(PORT, () => console.log(`Servidor escuchando en puerto ${PORT}`));' > server.js

EXPOSE 4200

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:4200', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

CMD ["node", "server.js"]
