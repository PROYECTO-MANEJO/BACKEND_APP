# Backend - App Eventos

Backend para la aplicación de gestión de eventos y cursos.

## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js 18 o superior
- Docker y Docker Compose
- npm o yarn

### 1️⃣ Levantar la Base de Datos (Postgres en Docker)

```bash
docker-compose up -d
```

Esto levantará un contenedor de PostgreSQL en el puerto 5432.

**Verificar que está corriendo:**
```bash
docker ps
```

Deberías ver un contenedor llamado `appeventos_postgres`.

### 2️⃣ Instalar Dependencias

```bash
npm install
```

### 3️⃣ Configurar Variables de Entorno

Copia el archivo `.env.example` a `.env` y ajusta los valores si es necesario:

```bash
cp .env.example .env
```

### 4️⃣ Generar el Cliente de Prisma

```bash
npm run prisma:generate
```

### 5️⃣ Ejecutar las Migraciones

```bash
npm run prisma:migrate
```

O si estás en desarrollo y quieres crear nuevas migraciones:

```bash
npm run prisma:migrate:dev
```

### 6️⃣ Iniciar el Servidor

**Modo desarrollo (con hot reload):**
```bash
npm run dev
```

**Modo producción:**
```bash
npm start
```

El servidor estará corriendo en `http://localhost:3000`

## 📦 Scripts Disponibles

| Script | Descripción |
|--------|-------------|
| `npm run dev` | Inicia el servidor en modo desarrollo con nodemon |
| `npm start` | Inicia el servidor en modo producción |
| `npm run prisma:generate` | Genera el cliente de Prisma |
| `npm run prisma:migrate` | Ejecuta las migraciones pendientes |
| `npm run prisma:migrate:dev` | Crea y ejecuta migraciones en desarrollo |
| `npm run prisma:studio` | Abre Prisma Studio para ver la base de datos |
| `npm run db:reset` | Resetea la base de datos (⚠️ CUIDADO: borra todos los datos) |

## 🐳 Comandos Docker Útiles

**Detener el contenedor:**
```bash
docker-compose down
```

**Detener y eliminar volúmenes (borra la BD):**
```bash
docker-compose down -v
```

**Ver logs del contenedor:**
```bash
docker-compose logs -f postgres
```

**Conectarse a la base de datos:**
```bash
docker exec -it appeventos_postgres psql -U postgres -d appeventos_db
```

## 🗄️ Base de Datos

La base de datos se maneja con Prisma ORM. El esquema está definido en `prisma/schema.prisma`.

**Ver la base de datos con interfaz gráfica:**
```bash
npm run prisma:studio
```

## 🔧 Troubleshooting

### El backend no conecta a la base de datos

1. Verifica que el contenedor de Docker está corriendo: `docker ps`
2. Verifica que el `DATABASE_URL` en `.env` es correcto
3. Verifica que el puerto 5432 no esté siendo usado por otra aplicación

### Error "Prisma Client has not been generated"

Ejecuta:
```bash
npm run prisma:generate
```

### Quiero empezar de cero con la base de datos

```bash
npm run db:reset
```

⚠️ **Advertencia:** Esto borrará TODOS los datos.

## 📝 Estructura del Proyecto

```
BACKEND_APP/
├── config/          # Configuraciones
├── controllers/     # Controladores
├── database/        # Configuración de BD
├── helpers/         # Funciones auxiliares
├── middlewares/     # Middlewares de Express
├── prisma/          # Esquema y migraciones de Prisma
├── routes/          # Rutas de la API
├── scripts/         # Scripts utilitarios
├── services/        # Lógica de negocio
├── index.js         # Punto de entrada
└── docker-compose.yml  # Configuración de Docker
```

## 🌐 Variables de Entorno

Ver `.env.example` para la lista completa de variables requeridas.

Las más importantes:
- `DATABASE_URL`: URL de conexión a PostgreSQL
- `PORT`: Puerto del servidor (default: 3000)
- `SECRET_KEY`: Clave secreta para JWT
- `FRONTEND_URL`: URL del frontend para CORS