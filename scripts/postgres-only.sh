#!/bin/bash

# Script simple para PostgreSQL únicamente

echo "🐘 Iniciando PostgreSQL..."

# Limpiar cualquier contenedor existente
docker rm -f backend_postgres 2>/dev/null || true

# Crear volumen si no existe
docker volume create postgres_data 2>/dev/null || true

# Iniciar PostgreSQL
docker run -d \
  --name backend_postgres \
  -e POSTGRES_DB=backend_app \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=password \
  -p 5432:5432 \
  -v postgres_data:/var/lib/postgresql/data \
  --restart unless-stopped \
  postgres:15-alpine

echo "✅ PostgreSQL iniciado correctamente"
echo "📊 Conexión: postgresql://postgres:password@localhost:5432/backend_app"
echo "🔍 Estado: docker ps"
echo "📝 Logs: docker logs backend_postgres"
echo "🔌 Conectar: docker exec -it backend_postgres psql -U postgres -d backend_app"