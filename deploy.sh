#!/bin/bash

# ==============================================
# Script de Deployment - Backend Clean Architecture
# ==============================================

set -e  # Salir si cualquier comando falla

echo "🚀 ========================================"
echo "🚀 INICIANDO DEPLOYMENT"
echo "🚀 ========================================"

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para logging
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    log_error "No se encontró package.json. Ejecuta desde el directorio raíz del proyecto."
    exit 1
fi

# Verificar Node.js version
log_info "Verificando Node.js..."
NODE_VERSION=$(node --version)
log_success "Node.js version: $NODE_VERSION"

# Verificar npm version
log_info "Verificando npm..."
NPM_VERSION=$(npm --version)
log_success "npm version: $NPM_VERSION"

# Instalar dependencias
log_info "Instalando dependencias..."
npm ci
log_success "Dependencias instaladas"

# Verificar variables de entorno
log_info "Verificando configuración..."
if [ ! -f ".env" ]; then
    log_warning "Archivo .env no encontrado. Copiando desde .env.example..."
    cp .env.example .env
    log_warning "Por favor, configura las variables en .env antes de continuar"
    read -p "Presiona Enter cuando hayas configurado .env..."
fi

# Verificar DATABASE_URL
if ! grep -q "DATABASE_URL=" .env || grep -q "DATABASE_URL=\"postgresql://usuario:password@localhost:5432/database_name\"" .env; then
    log_error "Por favor configura DATABASE_URL en el archivo .env"
    exit 1
fi

# Verificar JWT_SECRET
if ! grep -q "JWT_SECRET=" .env || grep -q "JWT_SECRET=\"your-super-secret-jwt-key-change-in-production\"" .env; then
    log_error "Por favor configura JWT_SECRET en el archivo .env"
    exit 1
fi

log_success "Configuración validada"

# Generar cliente Prisma
log_info "Generando cliente Prisma..."
npm run prisma:generate
log_success "Cliente Prisma generado"

# Type check
log_info "Verificando tipos TypeScript..."
npm run type-check
log_success "Verificación de tipos completada"

# Build
log_info "Compilando aplicación..."
npm run build
log_success "Compilación completada"

# Ejecutar migraciones (solo si están disponibles)
if [ -d "prisma/migrations" ] && [ "$(ls -A prisma/migrations)" ]; then
    log_info "Ejecutando migraciones de base de datos..."
    npm run migrate:deploy
    log_success "Migraciones ejecutadas"
else
    log_warning "No se encontraron migraciones para ejecutar"
fi

# Test (opcional)
if [ "$1" = "--with-tests" ]; then
    log_info "Ejecutando tests..."
    npm run test
    log_success "Tests completados"
fi

# Verificar que el build funciona
log_info "Verificando build..."
if [ ! -f "dist/main.js" ]; then
    log_error "Build falló. No se encontró dist/main.js"
    exit 1
fi

log_success "Build verificado correctamente"

echo ""
echo "🎉 ========================================"
echo "🎉 DEPLOYMENT COMPLETADO EXITOSAMENTE"
echo "🎉 ========================================"
echo ""
echo "📋 Resumen:"
echo "   ✅ Dependencias instaladas"
echo "   ✅ Configuración validada"
echo "   ✅ Cliente Prisma generado"
echo "   ✅ Tipos TypeScript verificados"
echo "   ✅ Aplicación compilada"
echo "   ✅ Migraciones ejecutadas"
echo "   ✅ Build verificado"
echo ""
echo "🚀 Para iniciar la aplicación:"
echo "   npm run start"
echo ""
echo "🔧 Para desarrollo:"
echo "   npm run dev"
echo ""
echo "📊 Para monitoreo:"
echo "   Health Check: http://localhost:3000/health"
echo "   API: http://localhost:3000/api"
echo ""