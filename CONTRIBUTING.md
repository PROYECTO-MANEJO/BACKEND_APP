# 🤝 Guía de Contribución - Backend

¡Gracias por tu interés en contribuir al Backend del Sistema de Gestión de Eventos Académicos de la UTA! Esta guía te ayudará a entender cómo puedes colaborar de manera efectiva en el desarrollo del API.

## 📋 Tabla de Contenidos

- [🚀 Cómo Empezar](#-cómo-empezar)
- [🔄 Flujo de Trabajo](#-flujo-de-trabajo)
- [💻 Configuración del Entorno](#-configuración-del-entorno)
- [📝 Estándares de Código](#-estándares-de-código)
- [🧪 Testing](#-testing)
- [📖 Documentación](#-documentación)
- [🐛 Reportar Bugs](#-reportar-bugs)
- [✨ Solicitar Features](#-solicitar-features)
- [📋 Pull Requests](#-pull-requests)
- [🏷️ Convenciones](#️-convenciones)
- [🚢 Releases](#-releases)
- [❓ FAQ](#-faq)

## 🚀 Cómo Empezar

### 1. Explora el Proyecto

Antes de contribuir, familiarízate con:
- [README.md](README.md) - Documentación principal del backend
- [Issues](https://github.com/tu-usuario/backend-uta-eventos/issues) - Problemas conocidos
- [API Documentation](docs/API.md) - Documentación de endpoints
- [Database Schema](docs/DATABASE.md) - Esquema de base de datos

### 2. Busca tu Primera Contribución

Etiquetas ideales para principiantes:
- `good first issue` - Problemas perfectos para comenzar
- `help wanted` - Necesitamos ayuda con estos issues
- `documentation` - Mejoras en documentación
- `bug` - Errores que necesitan arreglo
- `api` - Mejoras en endpoints
- `database` - Optimizaciones de base de datos


## 🔄 Flujo de Trabajo

Seguimos **Git Flow** para el desarrollo del backend:

### Ramas Principales

```
main                    # Código en producción
├── develop             # Desarrollo principal
    ├── feature/*       # Nuevas funcionalidades
    ├── bugfix/*        # Corrección de bugs
    ├── hotfix/*        # Correcciones urgentes
    └── release/*       # Preparación de releases
```

### Proceso de Contribución

1. **Fork** del repositorio
2. **Clone** tu fork localmente
3. **Crear rama** desde `develop`
4. **Configurar entorno** local
5. **Desarrollar** tu contribución
6. **Testing** completo
7. **Commit** siguiendo convenciones
8. **Push** a tu fork
9. **Pull Request** a `develop`

## 💻 Configuración del Entorno

### Prerequisitos

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- **PostgreSQL** >= 14.0
- **Git** >= 2.34.0
- **Editor**: VS Code (recomendado)

### Setup Inicial

```bash
# 1. Fork y clone
git clone https://github.com/TU-USUARIO/backend-uta-eventos.git
cd backend-uta-eventos

# 2. Configurar remotes
git remote add upstream https://github.com/ORIGINAL-USUARIO/backend-uta-eventos.git

# 3. Instalar dependencias
npm install

# 4. Configurar base de datos PostgreSQL
createdb Cursos_Fisei

# 5. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus configuraciones

# 6. Ejecutar migraciones
npm run migrate

# 7. Iniciar servidor de desarrollo
npm run dev
```

### Variables de Entorno de Desarrollo

```env
# Base de datos local
DATABASE_URL="postgresql://usuario:contraseña@localhost:5432/Cursos_Fisei"
DB_USER=usuario
DB_PASSWORD=contraseña
DB_HOST=localhost
DB_PORT=5432
DB_NAME=Cursos_Fisei

# Seguridad (usar valores de desarrollo)
SECRET_KEY="dev-secret-key"
SECRET_JWT_SEED="dev-jwt-secret"

# SMTP (opcional para desarrollo)
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=tu_usuario_mailtrap
SMTP_PASS=tu_password_mailtrap

# URLs
FRONTEND_URL=http://localhost:5173
PORT=3000
```

### Extensiones de VS Code Recomendadas

```json
{
  "recommendations": [
    "ms-vscode.vscode-json",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-typescript-next",
    "christian-kohler.path-intellisense",
    "ms-vscode.vscode-json",
    "formulahendry.auto-rename-tag",
    "Prisma.prisma",
    "ms-vscode.vscode-eslint",
    "esbenp.prettier-vscode"
  ]
}
```

## 📝 Estándares de Código

### ESLint y Prettier

```bash
# Verificar código
npm run lint

# Corregir automáticamente
npm run lint:fix

# Formatear código
npm run format
```

### Estructura de Archivos

```javascript
// ✅ Correcto - Estructura de controlador
controllers/
├── auth.js              # Autenticación
├── users.js             # Gestión de usuarios
├── eventos.js           # Gestión de eventos
└── solicitudes.js       # Gestión de solicitudes

routes/
├── auth.js              # Rutas de autenticación
├── users.js             # Rutas de usuarios
├── eventos.js           # Rutas de eventos
└── solicitudes.js       # Rutas de solicitudes

middlewares/
├── validateFields.js    # Validación de campos
├── validateJWT.js       # Validación JWT
└── checkRole.js         # Verificación de roles
```

### Convenciones de Naming

```javascript
// ✅ Variables y funciones - camelCase
const getUserById = async (id) => {}
const userProfile = {};

// ✅ Constantes - UPPER_SNAKE_CASE
const API_BASE_URL = '/api';
const JWT_EXPIRATION = '24h';

// ✅ Archivos - kebab-case
user-controller.js
email-service.js
validate-fields.js

// ✅ Rutas - kebab-case
/api/auth/forgot-password
/api/users/upload-documents
/api/solicitudes/change-status
```

### Estructura de Controladores

```javascript
// ✅ Estructura recomendada para controladores
const { response } = require('express');
const { PrismaClient } = require('@prisma/client');
const { generateJWT } = require('../helpers/jwt');

const prisma = new PrismaClient();

/**
 * Obtener perfil del usuario
 * @route GET /api/users/profile
 * @access Private
 */
const getUserProfile = async (req, res = response) => {
  try {
    const { uid } = req;
    
    // Validaciones
    if (!uid) {
      return res.status(400).json({
        success: false,
        message: 'ID de usuario requerido'
      });
    }
    
    // Lógica principal
    const user = await prisma.usuarios.findUnique({
      where: { id_usu: uid },
      select: {
        id_usu: true,
        ced_usu: true,
        nom_usu1: true,
        ape_usu1: true,
        ema_usu: true,
        rol_usu: true
      }
    });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }
    
    // Respuesta exitosa
    res.json({
      success: true,
      data: user
    });
    
  } catch (error) {
    console.error('Error en getUserProfile:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

module.exports = {
  getUserProfile
};
```

### Estructura de Rutas

```javascript
// ✅ Estructura recomendada para rutas
const { Router } = require('express');
const { check } = require('express-validator');

// Middlewares
const { validateFields } = require('../middlewares/validateFields');
const { validateJWT } = require('../middlewares/validateJWT');
const { requireRole } = require('../middlewares/checkRole');

// Controladores
const {
  getUserProfile,
  updateUserProfile,
  getUserDashboard
} = require('../controllers/users');

const router = Router();

// GET /api/users/profile - Obtener perfil
router.get('/profile', [
  validateJWT
], getUserProfile);

// PUT /api/users/profile - Actualizar perfil
router.put('/profile', [
  validateJWT,
  check('nom_usu1', 'El primer nombre es obligatorio').notEmpty(),
  check('ape_usu1', 'El primer apellido es obligatorio').notEmpty(),
  validateFields
], updateUserProfile);

// GET /api/users/dashboard - Dashboard del usuario
router.get('/dashboard', [
  validateJWT
], getUserDashboard);

module.exports = router;
```

### Manejo de Errores

```javascript
// ✅ Manejo consistente de errores
const handleDatabaseError = (error, res) => {
  console.error('Database error:', error);
  
  if (error.code === 'P2002') {
    return res.status(400).json({
      success: false,
      message: 'El registro ya existe',
      error: 'DUPLICATE_ENTRY'
    });
  }
  
  if (error.code === 'P2025') {
    return res.status(404).json({
      success: false,
      message: 'Registro no encontrado',
      error: 'NOT_FOUND'
    });
  }
  
  return res.status(500).json({
    success: false,
    message: 'Error interno del servidor',
    error: 'INTERNAL_SERVER_ERROR'
  });
};
```

## 🧪 Testing

### Estrategia de Testing

1. **Unit Tests** - Funciones individuales
2. **Integration Tests** - Endpoints completos
3. **Database Tests** - Operaciones de base de datos
4. **Authentication Tests** - Flujos de autenticación

### Comandos de Testing

```bash
# Ejecutar todos los tests
npm test

# Tests en modo watch
npm run test:watch

# Tests con coverage
npm run test:coverage

# Tests específicos
npm test -- --grep "auth"
npm test -- controllers/auth.test.js
```

### Estructura de Tests

```javascript
// tests/controllers/auth.test.js
const request = require('supertest');
const app = require('../../index');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

describe('Auth Controller', () => {
  beforeAll(async () => {
    // Setup inicial
    await prisma.$connect();
  });
  
  afterAll(async () => {
    // Cleanup
    await prisma.$disconnect();
  });
  
  beforeEach(async () => {
    // Reset database state
    await prisma.usuarios.deleteMany();
  });
  
  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        ced_usu: '1234567890',
        nom_usu1: 'Juan',
        ape_usu1: 'Pérez',
        ema_usu: 'juan@uta.edu.ec',
        pas_usu: 'password123'
      };
      
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);
      
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.token).toBeDefined();
      expect(response.body.user.ema_usu).toBe(userData.ema_usu);
    });
    
    it('should return error for duplicate email', async () => {
      // Pre-create user
      await prisma.usuarios.create({
        data: {
          ced_usu: '1234567890',
          nom_usu1: 'Juan',
          ape_usu1: 'Pérez',
          ema_usu: 'juan@uta.edu.ec',
          pas_usu: 'hashedpassword'
        }
      });
      
      const userData = {
        ced_usu: '0987654321',
        nom_usu1: 'María',
        ape_usu1: 'García',
        ema_usu: 'juan@uta.edu.ec', // Same email
        pas_usu: 'password123'
      };
      
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('ya existe');
    });
  });
});
```

### Coverage Mínimo

- **Statements**: 85%
- **Branches**: 80%
- **Functions**: 85%
- **Lines**: 85%

## 📖 Documentación

### JSDoc para Funciones

```javascript
/**
 * Crea un nuevo evento académico
 * @param {Object} eventData - Datos del evento
 * @param {string} eventData.nom_eve - Nombre del evento
 * @param {string} eventData.des_eve - Descripción del evento
 * @param {Date} eventData.fec_ini_eve - Fecha de inicio
 * @param {string} eventData.ced_org_eve - Cédula del organizador
 * @returns {Promise<Object>} Evento creado
 * @throws {Error} Si faltan datos requeridos
 * @example
 * const evento = await createEvento({
 *   nom_eve: 'Congreso de IA',
 *   des_eve: 'Evento sobre inteligencia artificial',
 *   fec_ini_eve: '2024-07-15',
 *   ced_org_eve: '1234567890'
 * });
 */
const createEvento = async (eventData) => {
  // Implementación
};
```

### Documentación de API

```markdown
# POST /api/auth/login

Autentica un usuario y devuelve un token JWT.

## Parámetros

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| ema_usu | string | ✅ | Email del usuario |
| pas_usu | string | ✅ | Contraseña del usuario |

## Respuesta Exitosa (200)

```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id_usu": "uuid",
    "ema_usu": "user@uta.edu.ec",
    "rol_usu": "USUARIO"
  }
}
```

## Errores

| Código | Descripción |
|--------|-------------|
| 400 | Credenciales inválidas |
| 401 | Usuario no autorizado |
| 500 | Error interno del servidor |
```

## 🐛 Reportar Bugs

### Antes de Reportar

1. ✅ Busca en [issues existentes](https://github.com/tu-usuario/backend-uta-eventos/issues)
2. ✅ Verifica que sea un bug del backend y no del frontend
3. ✅ Asegúrate de usar la última versión
4. ✅ Revisa los logs del servidor

### Template para Bug Reports

```markdown
**Descripción del Bug**
Descripción clara y concisa del problema.

**Endpoint/Funcionalidad Afectada**
¿Qué endpoint o funcionalidad está fallando?

**Pasos para Reproducir**
1. Realizar petición POST a '/api/auth/login'
2. Con los datos: { "ema_usu": "test@uta.edu.ec", "pas_usu": "wrong" }
3. Ver error

**Comportamiento Esperado**
Lo que debería pasar.

**Comportamiento Actual**
Lo que está pasando realmente.

**Request/Response**
```json
// Request
{
  "ema_usu": "test@uta.edu.ec",
  "pas_usu": "wrongpassword"
}

// Response
{
  "success": false,
  "message": "Internal server error"
}
```

**Logs del Servidor**
```
Error: Cannot read property 'ema_usu' of undefined
    at authController.js:45:12
```

**Entorno**
- OS: [e.g. Ubuntu 22.04]
- Node.js: [e.g. 18.0.0]
- PostgreSQL: [e.g. 14.5]
- Base de datos: [e.g. local/producción]

**Información Adicional**
Cualquier contexto adicional.
```

## ✨ Solicitar Features

### Template para Feature Requests

```markdown
**¿Tu solicitud está relacionada con un problema?**
Descripción clara del problema. Ej: "Me frustra que no pueda..."

**Describe la solución que te gustaría**
Descripción clara de lo que quieres que pase.

**Endpoint propuesto**
```
POST /api/nueva-funcionalidad
GET /api/recurso/:id/nueva-accion
```

**Esquema de request/response**
```json
// Request
{
  "campo1": "valor",
  "campo2": 123
}

// Response
{
  "success": true,
  "data": {
    "resultado": "valor"
  }
}
```

**Describe alternativas consideradas**
Descripción de soluciones alternativas.

**Información Adicional**
Cualquier contexto o mockups adicionales.
```

## 📋 Pull Requests

### Checklist Antes del PR

- [ ] Código sigue los estándares del proyecto
- [ ] Tests añadidos/actualizados y pasando
- [ ] Migraciones de base de datos incluidas (si aplica)
- [ ] Documentación de API actualizada
- [ ] Variables de entorno documentadas
- [ ] Sin warnings de linter
- [ ] PR description completa

### Template para PR

```markdown
## Descripción
Breve descripción de los cambios realizados.

## Tipo de Cambio
- [ ] Bug fix (cambio que arregla un issue)
- [ ] Nueva feature (cambio que añade funcionalidad)
- [ ] Breaking change (cambio que afectaría funcionalidad existente)
- [ ] Documentación
- [ ] Migración de base de datos

## Endpoints Afectados
- `POST /api/auth/new-endpoint`
- `PUT /api/users/:id/update-field`

## Cambios en Base de Datos
- [ ] Nueva tabla creada
- [ ] Columnas añadidas/modificadas
- [ ] Índices añadidos
- [ ] Migration file incluida

## Testing
- [ ] Tests unitarios añadidos/actualizados
- [ ] Tests de integración añadidos/actualizados
- [ ] Tests manuales realizados
- [ ] Todos los tests pasan

## Documentación
- [ ] README actualizado
- [ ] API documentation actualizada
- [ ] Comentarios en código añadidos
- [ ] Variables de entorno documentadas

## Checklist
- [ ] Mi código sigue los estándares del proyecto
- [ ] He realizado un self-review de mi código
- [ ] He comentado mi código, particularmente en áreas difíciles de entender
- [ ] He hecho cambios correspondientes a la documentación
- [ ] Mis cambios no generan nuevos warnings
- [ ] He añadido tests que prueban que mi arreglo es efectivo o que mi feature funciona
- [ ] Tests nuevos y existentes pasan localmente con mis cambios
- [ ] He verificado que no hay breaking changes no documentados
```

### Proceso de Review

1. **Automated Checks** - Linting, testing, build
2. **Code Review** - Revisión por maintainers
3. **Database Review** - Revisión de migraciones y cambios de schema
4. **Security Review** - Revisión de seguridad
5. **Testing** - Testing manual si es necesario
6. **Approval** - Aprobación final
7. **Merge** - Merge a develop

## 🏷️ Convenciones

### Commits (Conventional Commits)

```bash
# Estructura
type(scope): description

# Tipos específicos para backend
feat:     # Nueva funcionalidad
fix:      # Corrección de bug
docs:     # Cambios en documentación
style:    # Cambios de formato (no afectan lógica)
refactor: # Refactoring de código
test:     # Añadir o corregir tests
chore:    # Cambios en build process, herramientas auxiliares
perf:     # Mejoras de rendimiento
security: # Correcciones de seguridad
database: # Cambios en base de datos

# Ejemplos específicos de backend
feat(auth): add password reset functionality
fix(api): correct validation in user registration
docs(api): update endpoint documentation
refactor(database): optimize user queries
test(auth): add integration tests for login
chore(deps): update express to v5.1.0
perf(query): optimize event listing query
security(jwt): improve token validation
database(migration): add index to usuarios table
```

### Branches

```bash
# Feature branches
feature/auth-password-reset
feature/event-management-api
feature/document-upload-endpoint

# Bug fixes
bugfix/login-validation-error
bugfix/email-service-timeout

# Hotfixes
hotfix/security-jwt-vulnerability
hotfix/database-connection-leak

# Database changes
database/add-solicitudes-table
database/optimize-user-indexes

# Releases
release/v1.0.0
release/v1.1.0
```

### Base de Datos

```sql
-- Convenciones de naming para base de datos

-- Tablas: UPPER_CASE con prefijo descriptivo
USUARIOS
EVENTOS
SOLICITUDES_CAMBIO
CATEGORIAS_EVENTOS

-- Columnas: snake_case con prefijo de tabla
id_usu, ced_usu, nom_usu1, ema_usu
id_eve, nom_eve, des_eve, fec_ini_eve

-- Índices: idx_tabla_columna
idx_usuarios_email
idx_eventos_fecha_inicio
idx_solicitudes_estado

-- Foreign Keys: fk_tabla_origen_tabla_destino
fk_eventos_organizadores
fk_solicitudes_usuarios
```

## 🚢 Releases

### Versionado Semántico

```
MAJOR.MINOR.PATCH
1.0.0
```

- **MAJOR** - Cambios incompatibles en API
- **MINOR** - Nueva funcionalidad compatible
- **PATCH** - Correcciones de bugs

### Proceso de Release

1. **Feature Freeze** - No nuevas features
2. **Testing** - Testing completo de API
3. **Database Migration** - Verificar migraciones
4. **Documentation** - Docs actualizadas
5. **Release Branch** - Crear rama release
6. **Final Testing** - Testing en release branch
7. **Tagging** - Crear tag de versión
8. **Deploy** - Deploy a producción
9. **Merge** - Merge a main y develop

### Checklist de Release

- [ ] Todas las migraciones de base de datos probadas
- [ ] API endpoints documentados
- [ ] Variables de entorno actualizadas
- [ ] Tests pasando al 100%
- [ ] Performance testing realizado
- [ ] Security audit completado
- [ ] Backup de base de datos realizado

## ❓ FAQ

### ¿Cómo configuro la base de datos local?

```bash
# Instalar PostgreSQL
sudo apt install postgresql postgresql-contrib

# Crear usuario y base de datos
sudo -u postgres createuser --interactive
sudo -u postgres createdb Cursos_Fisei

# Configurar .env
DATABASE_URL="postgresql://usuario:contraseña@localhost:5432/Cursos_Fisei"
```

### ¿Qué pasa si mi migración falla?

```bash
# Revertir migración
npx prisma migrate reset

# Aplicar migración específica
npx prisma db push --skip-generate
```

### ¿Cómo debuggear problemas de JWT?

```javascript
// Agregar logs temporales
console.log('Token received:', token);
console.log('JWT Secret:', process.env.SECRET_JWT_SEED);
console.log('Decoded token:', jwt.decode(token));
```

### ¿Cómo testear endpoints protegidos?

```javascript
// En tests, generar token válido
const token = jwt.sign({ uid: testUserId }, process.env.SECRET_JWT_SEED);

const response = await request(app)
  .get('/api/users/profile')
  .set('x-token', token);
```

### ¿Cómo mantengo mi fork actualizado?

```bash
git fetch upstream
git checkout develop
git merge upstream/develop
git push origin develop
```

### ¿Dónde puedo pedir ayuda?

- [GitHub Discussions](https://github.com/tu-usuario/backend-uta-eventos/discussions)
- Email: dev-backend@uta.edu.ec
- Issues con label `question`
- Slack: #uta-backend-help

---

<div align="center">
  <p><strong>Happy Coding! 🚀</strong></p>
  <p>
    <a href="README.md">README</a> •
    <a href="https://github.com/tu-usuario/backend-uta-eventos/issues">Issues</a> •
    <a href="https://github.com/tu-usuario/backend-uta-eventos/discussions">Discussions</a>
  </p>
</div> 