#!/bin/bash

# ==============================================
# Script para manejo de Base de Datos con Docker
# ==============================================

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funciones de utilidad
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

# Función para verificar si Docker está corriendo
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker no está corriendo. Por favor inicia Docker primero."
        exit 1
    fi
}

# Función para levantar la base de datos
start_db() {
    print_info "Iniciando servicios de base de datos..."
    
    check_docker
    
    # Crear archivo .env si no existe
    if [ ! -f .env ]; then
        print_warning "No se encontró archivo .env, copiando desde .env.example"
        cp .env.example .env
    fi
    
    # Levantar servicios
    docker-compose -f docker-compose.db.yml up -d
    
    print_success "Servicios iniciados!"
    print_info "PostgreSQL: localhost:5432"
    print_info "pgAdmin: http://localhost:8080 (admin@backend.com / admin123)"
    print_info "Redis: localhost:6379"
    
    # Esperar a que PostgreSQL esté listo
    print_info "Esperando a que PostgreSQL esté listo..."
    sleep 5
    
    # Verificar conexión
    if docker exec backend_postgres pg_isready -U postgres -d backend_db > /dev/null 2>&1; then
        print_success "PostgreSQL está listo para recibir conexiones!"
    else
        print_warning "PostgreSQL puede tardar un poco más en estar listo..."
    fi
}

# Función para detener la base de datos
stop_db() {
    print_info "Deteniendo servicios de base de datos..."
    docker-compose -f docker-compose.db.yml down
    print_success "Servicios detenidos!"
}

# Función para ver logs
logs_db() {
    print_info "Mostrando logs de la base de datos..."
    docker-compose -f docker-compose.db.yml logs -f
}

# Función para reiniciar la base de datos
restart_db() {
    print_info "Reiniciando servicios de base de datos..."
    stop_db
    start_db
}

# Función para limpiar todo (¡CUIDADO! Elimina todos los datos)
clean_db() {
    print_warning "¡ATENCIÓN! Esto eliminará TODOS los datos de la base de datos."
    read -p "¿Estás seguro? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_info "Eliminando contenedores y volúmenes..."
        docker-compose -f docker-compose.db.yml down -v
        docker volume prune -f
        print_success "Base de datos limpiada!"
    else
        print_info "Operación cancelada."
    fi
}

# Función para hacer backup de la base de datos
backup_db() {
    print_info "Creando backup de la base de datos..."
    
    BACKUP_FILE="backup_$(date +%Y%m%d_%H%M%S).sql"
    
    docker exec backend_postgres pg_dump -U postgres -d backend_db > "backups/$BACKUP_FILE"
    
    print_success "Backup creado: backups/$BACKUP_FILE"
}

# Función para restaurar backup
restore_db() {
    if [ -z "$1" ]; then
        print_error "Uso: $0 restore <archivo_backup.sql>"
        exit 1
    fi
    
    BACKUP_FILE="$1"
    
    if [ ! -f "$BACKUP_FILE" ]; then
        print_error "El archivo de backup $BACKUP_FILE no existe."
        exit 1
    fi
    
    print_info "Restaurando backup: $BACKUP_FILE"
    
    docker exec -i backend_postgres psql -U postgres -d backend_db < "$BACKUP_FILE"
    
    print_success "Backup restaurado exitosamente!"
}

# Función para conectarse a PostgreSQL
connect_db() {
    print_info "Conectándose a PostgreSQL..."
    docker exec -it backend_postgres psql -U postgres -d backend_db
}

# Función para mostrar estado
status_db() {
    print_info "Estado de los servicios:"
    docker-compose -f docker-compose.db.yml ps
}

# Función de ayuda
show_help() {
    echo "Script para manejo de Base de Datos con Docker"
    echo ""
    echo "Uso: $0 [COMANDO]"
    echo ""
    echo "Comandos disponibles:"
    echo "  start     - Iniciar servicios de BD (PostgreSQL, pgAdmin, Redis)"
    echo "  stop      - Detener servicios de BD"
    echo "  restart   - Reiniciar servicios de BD"
    echo "  logs      - Ver logs de los servicios"
    echo "  status    - Ver estado de los servicios"
    echo "  connect   - Conectar a PostgreSQL via psql"
    echo "  backup    - Crear backup de la base de datos"
    echo "  restore   - Restaurar backup (uso: $0 restore backup.sql)"
    echo "  clean     - Limpiar TODO (¡elimina datos!)"
    echo "  help      - Mostrar esta ayuda"
    echo ""
    echo "Ejemplos:"
    echo "  $0 start"
    echo "  $0 logs"
    echo "  $0 backup"
    echo "  $0 restore backups/backup_20241011_120000.sql"
}

# Crear directorio de backups si no existe
mkdir -p backups

# Procesar argumentos
case "${1:-help}" in
    start)
        start_db
        ;;
    stop)
        stop_db
        ;;
    restart)
        restart_db
        ;;
    logs)
        logs_db
        ;;
    status)
        status_db
        ;;
    connect)
        connect_db
        ;;
    backup)
        backup_db
        ;;
    restore)
        restore_db "$2"
        ;;
    clean)
        clean_db
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