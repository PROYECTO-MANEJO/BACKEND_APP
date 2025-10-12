#!/bin/bash

# ==============================================
# Script Simple para Base de Datos con Docker
# ==============================================

set -e

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Función para iniciar PostgreSQL
start_postgres() {
    print_info "Iniciando PostgreSQL..."
    
    # Limpiar contenedor existente si existe
    docker rm -f backend_postgres 2>/dev/null || true
    
    # Crear red si no existe
    docker network create backend_network 2>/dev/null || true
    
    # Iniciar PostgreSQL
    docker run -d \
        --name backend_postgres \
        --network backend_network \
        -e POSTGRES_DB=backend_db \
        -e POSTGRES_USER=postgres \
        -e POSTGRES_PASSWORD=password \
        -p 5432:5432 \
        -v postgres_data:/var/lib/postgresql/data \
        --restart unless-stopped \
        postgres:15-alpine
    
    print_success "PostgreSQL iniciado en puerto 5432"
}

# Función para iniciar Redis
start_redis() {
    print_info "Iniciando Redis..."
    
    # Limpiar contenedor existente si existe
    docker rm -f backend_redis 2>/dev/null || true
    
    # Iniciar Redis
    docker run -d \
        --name backend_redis \
        --network backend_network \
        -p 6379:6379 \
        -v redis_data:/data \
        --restart unless-stopped \
        redis:7-alpine redis-server --appendonly yes
    
    print_success "Redis iniciado en puerto 6379"
}

# Función para verificar estado
check_status() {
    print_info "Verificando estado de los servicios..."
    
    echo
    echo "PostgreSQL:"
    if docker ps | grep -q backend_postgres; then
        print_success "✓ PostgreSQL está corriendo"
        echo "  Conexión: postgresql://postgres:password@localhost:5432/backend_db"
    else
        print_error "✗ PostgreSQL no está corriendo"
    fi
    
    echo
    echo "Redis:"
    if docker ps | grep -q backend_redis; then
        print_success "✓ Redis está corriendo"
        echo "  Conexión: redis://localhost:6379"
    else
        print_error "✗ Redis no está corriendo"
    fi
    
    echo
    print_info "Contenedores activos:"
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep -E "(backend_postgres|backend_redis|NAMES)"
}

# Función para detener servicios
stop_services() {
    print_info "Deteniendo servicios..."
    
    docker stop backend_postgres backend_redis 2>/dev/null || true
    docker rm backend_postgres backend_redis 2>/dev/null || true
    
    print_success "Servicios detenidos"
}

# Función para ver logs
show_logs() {
    if [ "$1" = "postgres" ]; then
        docker logs -f backend_postgres
    elif [ "$1" = "redis" ]; then
        docker logs -f backend_redis
    else
        print_info "Logs de PostgreSQL:"
        docker logs --tail 20 backend_postgres
        echo
        print_info "Logs de Redis:"
        docker logs --tail 20 backend_redis
    fi
}

# Función para conectar a PostgreSQL
connect_postgres() {
    print_info "Conectando a PostgreSQL..."
    docker exec -it backend_postgres psql -U postgres -d backend_db
}

# Función principal para iniciar todo
start_all() {
    print_info "Iniciando todos los servicios de base de datos..."
    
    # Verificar que Docker esté corriendo
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker no está corriendo. Inicia Docker Desktop primero."
        exit 1
    fi
    
    start_postgres
    sleep 2
    start_redis
    sleep 2
    
    print_success "Todos los servicios iniciados correctamente!"
    echo
    check_status
}

# Función de ayuda
show_help() {
    echo "Script simple para manejo de Base de Datos con Docker"
    echo
    echo "Uso: $0 [COMANDO]"
    echo
    echo "Comandos:"
    echo "  start         - Iniciar PostgreSQL y Redis"
    echo "  stop          - Detener todos los servicios"
    echo "  status        - Ver estado de los servicios"
    echo "  logs [servicio] - Ver logs (postgres, redis, o ambos si no especifica)"
    echo "  connect       - Conectar a PostgreSQL"
    echo "  restart       - Reiniciar servicios"
    echo "  clean         - Limpiar todo"
    echo
    echo "Ejemplos:"
    echo "  $0 start"
    echo "  $0 logs postgres"
    echo "  $0 connect"
}

# Procesar comandos
case "${1:-help}" in
    start)
        start_all
        ;;
    stop)
        stop_services
        ;;
    status)
        check_status
        ;;
    logs)
        show_logs "$2"
        ;;
    connect)
        connect_postgres
        ;;
    restart)
        stop_services
        sleep 2
        start_all
        ;;
    clean)
        print_warning "Esto eliminará TODOS los datos. ¿Continuar? (y/N)"
        read -r response
        if [[ "$response" =~ ^[Yy]$ ]]; then
            docker stop backend_postgres backend_redis 2>/dev/null || true
            docker rm backend_postgres backend_redis 2>/dev/null || true
            docker volume rm postgres_data redis_data 2>/dev/null || true
            print_success "Todo limpiado"
        else
            print_info "Cancelado"
        fi
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        print_error "Comando desconocido: $1"
        show_help
        exit 1
        ;;
esac