# ==============================================
# Dockerfile - Backend Clean Architecture
# ==============================================

# Usar imagen base de Node.js LTS
FROM node:18-alpine AS base

# Instalar dependencias del sistema
RUN apk add --no-cache libc6-compat

# Establecer directorio de trabajo
WORKDIR /app

# ==============================================
# Etapa de dependencias
# ==============================================
FROM base AS deps

# Copiar archivos de configuración
COPY package.json package-lock.json* ./
COPY prisma ./prisma/

# Instalar dependencias
RUN npm ci --only=production && npm cache clean --force

# ==============================================
# Etapa de build
# ==============================================
FROM base AS builder

# Copiar archivos de configuración
COPY package.json package-lock.json* ./
COPY tsconfig.json ./
COPY prisma ./prisma/

# Instalar todas las dependencias (incluye devDependencies)
RUN npm ci

# Copiar código fuente
COPY src ./src/

# Generar cliente Prisma
RUN npm run prisma:generate

# Compilar aplicación
RUN npm run build

# ==============================================
# Etapa de producción
# ==============================================
FROM base AS runner

# Crear usuario no-root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodejs

# Establecer directorio de trabajo
WORKDIR /app

# Copiar dependencias de producción
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/prisma ./prisma

# Copiar aplicación compilada
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json

# Crear directorio de logs
RUN mkdir -p logs && chown nodejs:nodejs logs

# Cambiar a usuario no-root
USER nodejs

# Exponer puerto
EXPOSE 3000

# Variables de entorno por defecto
ENV NODE_ENV=production
ENV PORT=3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Comando de inicio
CMD ["node", "dist/main.js"]