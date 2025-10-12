# Backend API - Clean Architecture

Backend refactorizado implementando **Clean Architecture** con TypeScript, Express.js y Prisma.

## 🏗️ Arquitectura

```
src/
├── 📁 presentation/           # Presentation Layer
│   ├── controllers/           # Controladores HTTP
│   ├── middleware/           # Middlewares (auth, validation, security)
│   ├── routes/               # Definición de rutas
│   └── dto/                  # Data Transfer Objects
├── 📁 application/           # Application Layer
│   └── use-cases/            # Casos de uso (lógica de aplicación)
├── 📁 domain/                # Domain Layer
│   ├── entities/             # Entidades del dominio
│   ├── repositories/         # Interfaces de repositorios
│   └── services/             # Servicios del dominio
├── 📁 infrastructure/        # Infrastructure Layer
│   ├── database/             # Configuración de BD y repositorios
│   ├── external/             # Servicios externos
│   └── config/               # Configuración e inyección de dependencias
├── 📁 config/                # Configuración de la aplicación
├── Server.ts                 # Configuración del servidor Express
└── main.ts                   # Punto de entrada principal
```

## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js >= 18
- PostgreSQL
- npm o yarn

### Instalación

1. **Clonar y configurar:**

```bash
git clone <repository-url>
cd BACKEND_APP
npm install
```

2. **Configurar variables de entorno:**

```bash
cp .env.example .env
# Editar .env con tus valores
```

3. **Configurar base de datos:**

```bash
npm run prisma:generate
npm run migrate
```

4. **Iniciar en desarrollo:**

```bash
npm run dev
```

## 📋 Scripts Disponibles

### Desarrollo

- `npm run dev` - Iniciar servidor en modo desarrollo
- `npm run dev:watch` - Desarrollo con auto-restart
- `npm run dev:legacy` - Ejecutar versión legacy

### Build y Producción

- `npm run build` - Compilar TypeScript
- `npm run start` - Ejecutar versión compilada
- `npm run build:prod` - Build completo con Prisma

### Testing

- `npm run test` - Ejecutar tests
- `npm run test:watch` - Tests en modo watch
- `npm run test:coverage` - Tests con coverage

### Base de Datos

- `npm run migrate` - Ejecutar migraciones
- `npm run migrate:deploy` - Deploy migraciones (producción)
- `npm run migrate:reset` - Reset base de datos
- `npm run prisma:studio` - Abrir Prisma Studio
- `npm run seed` - Poblar BD con datos de prueba

### Utilidades

- `npm run lint` - Verificar código con ESLint
- `npm run lint:fix` - Corregir problemas de linting
- `npm run type-check` - Verificar tipos TypeScript
- `npm run clean` - Limpiar archivos compilados

## 🔧 Configuración

### Variables de Entorno

Consulta `.env.example` para ver todas las variables disponibles:

- **DATABASE_URL**: Conexión PostgreSQL
- **JWT_SECRET**: Clave secreta para JWT
- **PORT**: Puerto del servidor (default: 3000)

### Estructura de la Base de Datos

El proyecto usa Prisma como ORM. El schema se encuentra en `prisma/schema.prisma`.

## 📡 API Endpoints

### Autenticación

- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/logout` - Cerrar sesión
- `GET /api/auth/profile` - Obtener perfil
- `POST /api/auth/refresh-token` - Refrescar token

### Usuarios

- `GET /api/users` - Listar usuarios
- `GET /api/users/:id` - Obtener usuario
- `PUT /api/users/:id` - Actualizar usuario
- `DELETE /api/users/:id` - Eliminar usuario

### Cursos

- `GET /api/courses` - Listar cursos
- `POST /api/courses` - Crear curso
- `GET /api/courses/:id` - Obtener curso
- `PUT /api/courses/:id` - Actualizar curso
- `DELETE /api/courses/:id` - Eliminar curso
- `POST /api/courses/:id/enroll` - Inscribirse

### Eventos

- `GET /api/events` - Listar eventos
- `POST /api/events` - Crear evento
- `GET /api/events/:id` - Obtener evento
- `PUT /api/events/:id` - Actualizar evento
- `DELETE /api/events/:id` - Eliminar evento

### Certificados

- `GET /api/certificates` - Listar certificados
- `POST /api/certificates/generate` - Generar certificado
- `GET /api/certificates/:id/download` - Descargar PDF

### Health Check

- `GET /health` - Estado del servidor
- `GET /api/health` - Health check de la API

## 🛡️ Seguridad

El sistema implementa múltiples capas de seguridad:

- **Autenticación JWT** con tokens de acceso y refresh
- **Rate Limiting** configurable por endpoint
- **Headers de seguridad** (CSP, XSS Protection, etc.)
- **Validación de inputs** con sanitización
- **Middlewares anti-CSRF**
- **Logging de requests** y monitoreo

## 🧪 Testing

```bash
# Ejecutar todos los tests
npm run test

# Tests en modo watch
npm run test:watch

# Coverage report
npm run test:coverage
```

## 📈 Monitoreo y Logging

- Logs estructurados con niveles configurables
- Request/response logging automático
- Health checks integrados
- Métricas de rendimiento

## 🔄 Migración desde Sistema Legacy

El proyecto incluye una migración gradual del sistema legacy:

1. **Presentation Layer** ✅ - Completamente refactorizado
2. **Application Layer** 🔄 - Casos de uso con implementación mock
3. **Domain Layer** 🔄 - Entidades y servicios parcialmente implementados
4. **Infrastructure Layer** 🔄 - Repositorios en desarrollo

### Ejecutar Ambas Versiones

- Legacy: `npm run start:legacy`
- Refactorizada: `npm run start`

## 🤝 Contribución

1. Fork del repositorio
2. Crear feature branch: `git checkout -b feature/nueva-funcionalidad`
3. Commit cambios: `git commit -am 'Agregar nueva funcionalidad'`
4. Push branch: `git push origin feature/nueva-funcionalidad`
5. Crear Pull Request

## 📝 Notas de Desarrollo

### Principios Implementados

- **Clean Architecture** - Separación clara de responsabilidades
- **SOLID Principles** - Código mantenible y extensible
- **Dependency Injection** - Bajo acoplamiento
- **Repository Pattern** - Abstracción de datos
- **DTO Pattern** - Transferencia segura de datos

### Próximas Funcionalidades

- [ ] Implementación completa del Domain Layer
- [ ] Sistema de notificaciones en tiempo real
- [ ] API de reportes avanzados
- [ ] Integración con servicios externos
- [ ] Sistema de caché distribuido

## 📄 Licencia

Este proyecto está bajo la licencia MIT. Ver `LICENSE` para más detalles.

## 📞 Soporte

Para soporte técnico o preguntas:

- 📧 Email: soporte@app.com
- 🐛 Issues: [GitHub Issues](link-to-issues)
- 📚 Documentación: [Wiki](link-to-wiki)
