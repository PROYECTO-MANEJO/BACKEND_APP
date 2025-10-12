# 🐘 Base de Datos con Docker

Esta guía te ayudará a configurar y manejar la base de datos PostgreSQL usando Docker Compose.

## 🚀 Inicio Rápido

### 1. Levantar la base de datos

```bash
npm run db:start
```

O usando el script directamente:

```bash
./scripts/db.sh start
```

### 2. Verificar que esté funcionando

```bash
npm run db:status
```

### 3. Ver logs en tiempo real

```bash
npm run db:logs
```

## 📊 Servicios Incluidos

### PostgreSQL

- **Puerto:** 5432
- **Usuario:** postgres
- **Contraseña:** password
- **Base de datos:** backend_db
- **Conexión:** `postgresql://postgres:password@localhost:5432/backend_db`

### pgAdmin (Interfaz Web)

- **URL:** http://localhost:8080
- **Email:** admin@backend.com
- **Contraseña:** admin123

### Redis (Caché)

- **Puerto:** 6379
- **Contraseña:** redis123
- **Conexión:** `redis://:redis123@localhost:6379`

## 🛠️ Comandos Disponibles

### Scripts NPM

```bash
npm run db:start     # Iniciar servicios
npm run db:stop      # Detener servicios
npm run db:restart   # Reiniciar servicios
npm run db:status    # Ver estado
npm run db:logs      # Ver logs
npm run db:connect   # Conectar a PostgreSQL
npm run db:backup    # Crear backup
npm run db:clean     # Limpiar TODO (¡cuidado!)
npm run db:help      # Ayuda
```

### Script directo

```bash
./scripts/db.sh start      # Iniciar servicios
./scripts/db.sh stop       # Detener servicios
./scripts/db.sh logs       # Ver logs
./scripts/db.sh connect    # Conectar vía psql
./scripts/db.sh backup     # Crear backup
./scripts/db.sh restore backup.sql  # Restaurar backup
```

## 🔧 Configuración

### Variables de entorno (.env)

```bash
# Base de datos
DATABASE_URL="postgresql://postgres:password@localhost:5432/backend_db"
DB_HOST=localhost
DB_PORT=5432
DB_NAME=backend_db
DB_USER=postgres
DB_PASSWORD=password

# Redis
REDIS_URL="redis://:redis123@localhost:6379"
```

## 📝 Uso con Prisma

### Generar cliente

```bash
npm run prisma:generate
```

### Aplicar migraciones

```bash
npm run migrate
```

### Abrir Prisma Studio

```bash
npm run prisma:studio
```

## 🔄 Backup y Restore

### Crear backup

```bash
npm run db:backup
```

### Restaurar backup

```bash
./scripts/db.sh restore backups/backup_20241011_120000.sql
```

## 🐛 Troubleshooting

### Puerto ya en uso

Si el puerto 5432 ya está en uso:

```bash
# Ver qué proceso usa el puerto
sudo lsof -i :5432

# O cambiar el puerto en docker-compose.db.yml
ports:
  - "5433:5432"  # Usar puerto 5433 local
```

### Problemas de permisos

```bash
# Dar permisos al script
chmod +x scripts/db.sh

# Verificar que Docker esté corriendo
docker info
```

### Limpiar todo y empezar de nuevo

```bash
npm run db:clean  # ¡CUIDADO! Elimina todos los datos
npm run db:start
```

## 📚 Recursos Adicionales

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [pgAdmin Documentation](https://www.pgadmin.org/docs/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Prisma Documentation](https://www.prisma.io/docs/)

## 🎯 Próximos Pasos

1. **Levantar la BD:** `npm run db:start`
2. **Configurar Prisma:** `npm run prisma:generate`
3. **Aplicar migraciones:** `npm run migrate`
4. **Iniciar tu app:** `npm run dev`

¡Listo para desarrollar! 🚀
