# 🚀 GUÍA COMPLETA PARA IMPLEMENTAR ROL DESARROLLADOR

## 📋 **RESUMEN EJECUTIVO**
Esta guía proporciona instrucciones **SÚPER ESPECÍFICAS** para implementar el rol DESARROLLADOR usando **MÁXIMA REUTILIZACIÓN** del código existente y siguiendo la **MISMA ESTRATEGIA** exitosa usada para ESTUDIANTE.

---

## 🎯 **FUNCIONALIDADES ESPECÍFICAS DEL DESARROLLADOR (ANÁLISIS DEL CÓDIGO ORIGINAL)**

### 📊 **FUNCIONALIDADES IDENTIFICADAS EN EL CÓDIGO LEGACY:**

#### **🔍 1. GESTIÓN DE SOLICITUDES ASIGNADAS:**
- **Ver solicitudes asignadas** → Solo las que tiene asignadas el desarrollador
- **Ver detalle de solicitud específica** → Con toda la información técnica
- **Actualizar estado de solicitud** → APROBADA → EN_DESARROLLO → EN_TESTING
- **Agregar comentarios técnicos** → Con timestamp y identificación
- **Ver estadísticas personales** → Contadores por estado

#### **🔧 2. GESTIÓN DE PLANES TÉCNICOS:**
- **Actualizar plan de implementación** → Detalles técnicos de la solución
- **Actualizar plan de rollout** → Pasos de despliegue
- **Actualizar plan de backout** → Plan de reversión en caso de fallas
- **Actualizar plan de testing** → Estrategia de pruebas

#### **🌿 3. GESTIÓN DE RAMAS GITHUB:**
- **Crear rama específica** → Frontend o Backend por separado
- **Obtener ramas disponibles** → Del repositorio correspondiente
- **Obtener ramas de solicitud** → Listar ramas creadas para una solicitud

#### **🔀 4. GESTIÓN DE PULL REQUESTS:**
- **Crear PR específico** → Para rama de frontend o backend
- **Pasar a testing** → Cambio de estado sin validaciones complejas

#### **⚙️ 5. INTEGRACIÓN CON GITHUB:**
- **Token personalizado** → Cada desarrollador usa su propio token de GitHub
- **Repositorios múltiples** → Frontend y Backend por separado
- **Gestión de estados** → Sincronización entre GitHub y base de datos

---

## 📁 **ARCHIVOS A LEER Y ANALIZAR**

### 🔍 **CÓDIGO LEGACY (JavaScript) - OBLIGATORIO LEER:**

#### **📂 Backend Legacy:**
```
/controllers/desarrolladorController.js          ✅ LEER COMPLETO
/routes/desarrollador.js                         ✅ LEER COMPLETO  
/middlewares/validateJWT.js (líneas 165-205)    ✅ LEER validateDeveloper
/services/githubService.js                       ✅ LEER COMPLETO
```

#### **📂 Frontend Legacy:**
```
/src/services/desarrolladorService.js            ✅ LEER COMPLETO
/src/components/developer/DetalleSolicitudDesarrollador.jsx  ✅ LEER COMPLETO
/src/components/developer/GitHubManagement.jsx  ✅ LEER COMPLETO
/src/components/auth/DeveloperRoute.jsx          ✅ LEER COMPLETO
```

### 🔍 **CÓDIGO REFACTORIZADO (TypeScript) - REFERENCIA:**

#### **📂 Controllers Existentes:**
```
/src/presentation/controllers/DeveloperController.ts     ✅ YA EXISTE (INCOMPLETO)
/src/presentation/controllers/ReportsController.ts       ✅ LEER (tiene reportes por desarrollador)
```

#### **📂 Middlewares Existentes:**
```
/src/presentation/middleware/adminMiddleware.ts          ✅ LEER (como referencia)
/src/presentation/middleware/studentMiddleware.ts        ✅ LEER (como referencia)
```

---

## 🏗️ **ARQUITECTURA A IMPLEMENTAR**

### 📊 **ESTRATEGIA DE REUTILIZACIÓN (IGUAL QUE ESTUDIANTE):**

```typescript
DESARROLLADOR = USUARIO_NORMAL + MIDDLEWARES_ESPECÍFICOS + FUNCIONALIDADES_GITHUB
```

### 🛠️ **CONTROLLERS A CREAR/COMPLETAR:**

#### **1. DeveloperController.ts (COMPLETAR EL EXISTENTE):**
```typescript
// YA EXISTE EN: /src/presentation/controllers/DeveloperController.ts
// ESTADO: INCOMPLETO - Solo tiene 2 métodos de 10+ requeridos

MÉTODOS A IMPLEMENTAR:
✅ getAssignedRequests()           // YA EXISTE
✅ updateRequestStatus()           // YA EXISTE  
❌ getSpecificRequest()            // FALTA - Basado en getSolicitudEspecifica()
❌ addTechnicalComment()           // FALTA - Basado en agregarComentarioDesarrollo()
❌ getDeveloperStatistics()        // FALTA - Basado en getEstadisticasDesarrollador()
❌ updateTechnicalPlans()          // FALTA - Basado en actualizarPlanesTecnicos()
❌ sendToTesting()                 // FALTA - Basado en enviarATestingSimple()
❌ createSpecificBranch()          // FALTA - Basado en crearRamaEspecifica()
❌ createSpecificPR()              // FALTA - Basado en crearPRSpecifico()
❌ getRequestBranches()            // FALTA - Basado en obtenerRamasSolicitud()
❌ getAvailableBranches()          // FALTA - Basado en obtenerRamasDisponibles()
```

#### **2. GitHubController.ts (NUEVO):**
```typescript
// CREAR NUEVO EN: /src/presentation/controllers/GitHubController.ts
// BASADO EN: /services/githubService.js

MÉTODOS A IMPLEMENTAR:
❌ createBranchSpecific()          // Basado en githubService.crearBranchEspecifico()
❌ createPullRequestSpecific()     // Basado en githubService.crearPullRequestEspecifico()
❌ getBranchesAvailable()          // Basado en githubService.obtenerBranchesDisponibles()
❌ getPRInformation()              // Basado en githubService.obtenerInformacionPR()
❌ getCommitsFromBranch()          // Basado en githubService.obtenerCommitsDeBranch()
❌ getCommitsFromPR()              // Basado en githubService.obtenerCommitsDelPR()
```

### 🛡️ **MIDDLEWARES A CREAR:**

#### **1. developerMiddleware.ts (NUEVO):**
```typescript
// CREAR EN: /src/presentation/middleware/developerMiddleware.ts
// BASADO EN: /middlewares/validateJWT.js (validateDeveloper)

MIDDLEWARES A IMPLEMENTAR:
❌ requireDeveloper()              // Solo rol DESARROLLADOR o MASTER
❌ requireAssignedRequest()        // Solo solicitudes asignadas al desarrollador
❌ requireGitHubToken()            // Verificar que tiene token de GitHub configurado
❌ requireValidRequestState()      // Estados válidos para desarrolladores
```

---

## 🔧 **IMPLEMENTACIÓN PASO A PASO**

### 📋 **PASO 1: COMPLETAR DeveloperController.ts**

#### **🔍 Análisis Requerido:**
1. **Leer completamente** `/controllers/desarrolladorController.js`
2. **Identificar cada función** y su lógica específica
3. **Mapear parámetros** de entrada y salida
4. **Identificar validaciones** específicas para desarrolladores

#### **📝 Métodos Específicos a Implementar:**

```typescript
// BASADO EN: getSolicitudEspecifica() líneas 118-230
public async getSpecificRequest(req: AuthenticatedRequest, res: Response): Promise<void> {
  // LÓGICA A IMPLEMENTAR:
  // 1. Obtener solicitud con TODAS las relaciones (usuario, admin, desarrollador, ramas)
  // 2. Verificar que está asignada al desarrollador (req.usuario?.id_usu)
  // 3. Formatear respuesta con nombres completos y datos seguros
  // 4. Incluir información de ramas y PRs si existen
}

// BASADO EN: agregarComentarioDesarrollo() líneas 374-424
public async addTechnicalComment(req: AuthenticatedRequest, res: Response): Promise<void> {
  // LÓGICA A IMPLEMENTAR:
  // 1. Verificar que la solicitud está asignada al desarrollador
  // 2. Agregar timestamp y identificación "[Desarrollador]" al comentario
  // 3. Concatenar con comentarios existentes
  // 4. Actualizar fecha de última actualización
}

// BASADO EN: getEstadisticasDesarrollador() líneas 427-485
public async getDeveloperStatistics(req: AuthenticatedRequest, res: Response): Promise<void> {
  // LÓGICA A IMPLEMENTAR:
  // 1. Usar groupBy para contar por estado_sol
  // 2. Filtrar por id_desarrollador_asignado = userId
  // 3. Formatear contadores (total, aprobadas, en_desarrollo, etc.)
}

// BASADO EN: actualizarPlanesTecnicos() líneas 488-549
public async updateTechnicalPlans(req: AuthenticatedRequest, res: Response): Promise<void> {
  // LÓGICA A IMPLEMENTAR:
  // 1. Extraer planes del body: plan_implementacion_sol, plan_rollout_sol, plan_backout_sol, plan_testing_sol
  // 2. Verificar que la solicitud está asignada al desarrollador
  // 3. Verificar estados permitidos: ['APROBADA', 'EN_DESARROLLO', 'EN_TESTING']
  // 4. Actualizar todos los planes en una sola operación
}

// BASADO EN: enviarATestingSimple() líneas 1121-1191
public async sendToTesting(req: AuthenticatedRequest, res: Response): Promise<void> {
  // LÓGICA A IMPLEMENTAR:
  // 1. Verificar estado actual = 'EN_DESARROLLO'
  // 2. Cambiar estado a 'EN_TESTING'
  // 3. Actualizar ramas RECHAZADAS a IN_REVIEW
  // 4. NO validar PRs (versión simplificada)
}
```

### 📋 **PASO 2: CREAR GitHubController.ts**

#### **🔍 Análisis Requerido:**
1. **Leer completamente** `/services/githubService.js`
2. **Identificar configuraciones** de GitHub (repos, tokens)
3. **Mapear APIs de GitHub** utilizadas
4. **Entender flujo** de ramas y PRs

#### **📝 Métodos Específicos a Implementar:**

```typescript
// BASADO EN: crearRamaEspecifica() líneas 768-874
public async createSpecificBranch(req: AuthenticatedRequest, res: Response): Promise<void> {
  // LÓGICA A IMPLEMENTAR:
  // 1. Validar repository_type: ['FRONTEND', 'BACKEND']
  // 2. Obtener token de GitHub del desarrollador (github_token del usuario)
  // 3. Verificar que no existe rama del mismo tipo para la solicitud
  // 4. Generar nombre: feature/SC-{id_sol}-{f|b}
  // 5. Crear rama en GitHub usando GitHubService
  // 6. Guardar en tabla solicitudRama
  // 7. Actualizar estado de solicitud si es necesario
}

// BASADO EN: crearPRSpecifico() líneas 877-989
public async createSpecificPR(req: AuthenticatedRequest, res: Response): Promise<void> {
  // LÓGICA A IMPLEMENTAR:
  // 1. Verificar que existe la rama del tipo especificado
  // 2. Verificar que no existe PR para esa rama
  // 3. Crear PR en GitHub con título y descripción automáticos
  // 4. Actualizar tabla solicitudRama con datos del PR
  // 5. Actualizar estado de solicitud basado en ramas
}
```

### 📋 **PASO 3: CREAR developerMiddleware.ts**

#### **🔍 Análisis Requerido:**
1. **Leer** `/middlewares/validateJWT.js` líneas 165-205
2. **Estudiar** `/src/presentation/middleware/studentMiddleware.ts` como referencia
3. **Identificar validaciones** específicas para desarrolladores

#### **📝 Middlewares Específicos a Implementar:**

```typescript
// BASADO EN: validateDeveloper líneas 165-205
export const requireDeveloper = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  // LÓGICA A IMPLEMENTAR:
  // 1. Verificar que req.usuario existe (viene de validateJWT)
  // 2. Verificar que cuentas[0].rol_cue === 'DESARROLLADOR' || 'MASTER'
  // 3. Agregar req.userId = req.uid para compatibilidad
}

// NUEVO - BASADO EN LÓGICA DE CONTROLLERS
export const requireAssignedRequest = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  // LÓGICA A IMPLEMENTAR:
  // 1. Obtener requestId de req.params
  // 2. Verificar que solicitud.id_desarrollador_asignado === req.usuario.id_usu
  // 3. Bloquear acceso si no está asignada
}

// NUEVO - BASADO EN obtenerTokenGitHubDesarrollador líneas 233-259
export const requireGitHubToken = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  // LÓGICA A IMPLEMENTAR:
  // 1. Verificar que usuario.github_token no es null
  // 2. Bloquear acceso si no tiene token configurado
}
```

### 📋 **PASO 4: CONFIGURAR RUTAS EN Server.ts**

#### **🔍 Análisis Requerido:**
1. **Leer** `/routes/desarrollador.js` para entender rutas originales
2. **Estudiar** `setupStudentRoutes()` como referencia de organización

#### **📝 Método a Implementar:**

```typescript
// AGREGAR A Server.ts
private setupDeveloperRoutes(): void {
  // CONFIGURACIÓN DE MULTER PARA GITHUB (si es necesario)
  
  // RUTAS NUEVAS (Clean Architecture)
  this.app.get("/api/developer/requests/assigned", validateJWT, requireDeveloper, this.developerController.getAssignedRequests.bind(this.developerController));
  this.app.get("/api/developer/requests/:requestId", validateJWT, requireDeveloper, requireAssignedRequest, this.developerController.getSpecificRequest.bind(this.developerController));
  this.app.put("/api/developer/requests/:requestId/status", validateJWT, requireDeveloper, requireAssignedRequest, this.developerController.updateRequestStatus.bind(this.developerController));
  this.app.post("/api/developer/requests/:requestId/comment", validateJWT, requireDeveloper, requireAssignedRequest, this.developerController.addTechnicalComment.bind(this.developerController));
  this.app.get("/api/developer/statistics", validateJWT, requireDeveloper, this.developerController.getDeveloperStatistics.bind(this.developerController));
  this.app.put("/api/developer/requests/:requestId/plans", validateJWT, requireDeveloper, requireAssignedRequest, this.developerController.updateTechnicalPlans.bind(this.developerController));
  this.app.post("/api/developer/requests/:requestId/send-to-testing", validateJWT, requireDeveloper, requireAssignedRequest, this.developerController.sendToTesting.bind(this.developerController));
  
  // RUTAS DE GITHUB
  this.app.post("/api/developer/github/branch", validateJWT, requireDeveloper, requireGitHubToken, this.gitHubController.createSpecificBranch.bind(this.gitHubController));
  this.app.post("/api/developer/github/pr", validateJWT, requireDeveloper, requireGitHubToken, this.gitHubController.createSpecificPR.bind(this.gitHubController));
  this.app.get("/api/developer/github/branches/:repository_type", validateJWT, requireDeveloper, requireGitHubToken, this.gitHubController.getAvailableBranches.bind(this.gitHubController));
  this.app.get("/api/developer/requests/:requestId/branches", validateJWT, requireDeveloper, this.gitHubController.getRequestBranches.bind(this.gitHubController));

  // RUTAS LEGACY (Compatibilidad con frontend existente)
  this.app.get("/api/desarrollador/solicitudes/:desarrolladorId", validateJWT, requireDeveloper, this.developerController.getAssignedRequests.bind(this.developerController));
  this.app.get("/api/desarrollador/solicitud/:id", validateJWT, requireDeveloper, this.developerController.getSpecificRequest.bind(this.developerController));
  this.app.put("/api/desarrollador/solicitud/:id/estado", validateJWT, requireDeveloper, this.developerController.updateRequestStatus.bind(this.developerController));
  this.app.post("/api/desarrollador/solicitud/:id/comentario", validateJWT, requireDeveloper, this.developerController.addTechnicalComment.bind(this.developerController));
  this.app.get("/api/desarrollador/estadisticas/:desarrolladorId", validateJWT, requireDeveloper, this.developerController.getDeveloperStatistics.bind(this.developerController));
  this.app.put("/api/desarrollador/solicitud/:id/planes", validateJWT, requireDeveloper, this.developerController.updateTechnicalPlans.bind(this.developerController));
  this.app.post("/api/desarrollador/solicitud/:id/testing", validateJWT, requireDeveloper, this.developerController.sendToTesting.bind(this.developerController));
  
  // RUTAS LEGACY DE GITHUB
  this.app.post("/api/github/dev/solicitud/:id/crear-rama", validateJWT, requireDeveloper, this.gitHubController.createSpecificBranch.bind(this.gitHubController));
  this.app.post("/api/github/dev/solicitud/:id/crear-pr", validateJWT, requireDeveloper, this.gitHubController.createSpecificPR.bind(this.gitHubController));
  this.app.get("/api/github/branches/:repository_type", validateJWT, requireDeveloper, this.gitHubController.getAvailableBranches.bind(this.gitHubController));
  this.app.get("/api/github/solicitud/:id/ramas", validateJWT, requireDeveloper, this.gitHubController.getRequestBranches.bind(this.gitHubController));
}
```

---

## 🔧 **SERVICIOS A MIGRAR**

### 📋 **GitHubService (JavaScript → TypeScript)**

#### **🔍 Análisis Requerido:**
1. **Leer completamente** `/services/githubService.js`
2. **Identificar configuraciones** de repositorios
3. **Mapear métodos** utilizados por el controller

#### **📝 Servicio a Crear:**

```typescript
// CREAR EN: /src/infrastructure/external/GitHubService.ts
// BASADO EN: /services/githubService.js

export class GitHubService {
  private readonly FRONTEND_REPO = 'tu-usuario/frontend-repo';
  private readonly BACKEND_REPO = 'tu-usuario/backend-repo';
  
  // MIGRAR TODOS LOS MÉTODOS:
  async createBranchSpecific(branchName: string, baseBranch: string, repoType: string, token: string): Promise<any>
  async createPullRequestSpecific(solicitud: any, branchName: string, targetBranch: string, repoType: string, token: string): Promise<any>
  async getBranchesAvailable(repoType: string, token: string): Promise<any[]>
  async getPRInformation(prNumber: number, repoType: string, token: string): Promise<any>
  async getCommitsFromBranch(branchName: string, repoType: string, token: string): Promise<any[]>
  async getCommitsFromPR(prNumber: number, repoType: string, token: string): Promise<any[]>
}
```

---

## 📊 **VALIDACIONES ESPECÍFICAS**

### 🔒 **Estados Permitidos para Desarrolladores:**

```typescript
// TRANSICIONES VÁLIDAS (BASADO EN CÓDIGO LEGACY):
const VALID_TRANSITIONS = {
  'APROBADA': ['EN_DESARROLLO'],           // Iniciar desarrollo
  'EN_DESARROLLO': ['EN_TESTING'],         // Enviar a testing
  'EN_TESTING': ['EN_DESARROLLO'],         // Regresar por bugs
  // NO PUEDE: COMPLETAR, CANCELAR, APROBAR
};

// ESTADOS DE RAMAS:
const BRANCH_STATES = {
  'PENDING': 'Sin PR creado',
  'OPEN': 'PR abierto',
  'IN_REVIEW': 'En revisión',
  'APPROVED': 'PR aprobado',
  'REJECTED': 'PR rechazado',
  'MERGED': 'PR mergeado'
};
```

### 🛡️ **Validaciones de Seguridad:**

```typescript
// VERIFICACIONES OBLIGATORIAS:
1. Solo desarrollador asignado puede modificar solicitud
2. Solo DESARROLLADOR o MASTER pueden acceder
3. Token de GitHub requerido para operaciones de Git
4. Estados válidos según flujo de desarrollo
5. Ramas únicas por tipo de repositorio
6. PRs únicos por rama
```

---

## 🎯 **DIFERENCIACIÓN CON OTROS ROLES**

### 🆚 **DESARROLLADOR vs OTROS ROLES:**

| Funcionalidad | USUARIO | ESTUDIANTE | ADMIN | **DESARROLLADOR** |
|---------------|---------|------------|-------|**---------------**|
| **Ver solicitudes** | Solo propias | Solo propias | Todas | **Solo asignadas** |
| **Cambiar estados** | No | No | Sí (todas) | **Sí (solo asignadas)** |
| **GitHub** | No | No | No | **Sí (completo)** |
| **Planes técnicos** | No | No | Ver | **Editar completo** |
| **Comentarios** | Básicos | Básicos | Administrativos | **Técnicos** |

---

## ⚠️ **ADVERTENCIAS CRÍTICAS**

### 🚨 **NO AGREGAR FUNCIONALIDADES EXTRA:**
- **NO** crear sistema de notificaciones avanzado
- **NO** agregar métricas complejas de GitHub
- **NO** implementar integración con otros servicios
- **NO** crear dashboards visuales complejos
- **SOLO** implementar lo que ya existe en el código legacy

### 🔒 **SEGURIDAD CRÍTICA:**
- **Token de GitHub** es personal de cada desarrollador
- **Validar siempre** que la solicitud está asignada al desarrollador
- **NO exponer** tokens en logs o respuestas
- **Validar permisos** en cada operación

### 📊 **COMPATIBILIDAD OBLIGATORIA:**
- **Mantener** todas las rutas legacy existentes
- **Respetar** formatos de respuesta del frontend
- **No romper** integración con GitHub existente

---

## 🎊 **RESULTADO ESPERADO**

### ✅ **AL COMPLETAR ESTA GUÍA:**
1. **DeveloperController.ts** completo con 11+ métodos
2. **GitHubController.ts** nuevo con 6+ métodos  
3. **developerMiddleware.ts** con 4 middlewares
4. **GitHubService.ts** migrado completamente
5. **22+ rutas nuevas** (11 clean + 11 legacy)
6. **100% compatibilidad** con frontend existente
7. **0% funcionalidades extra** no originales

### 🎯 **FÓRMULA FINAL:**
```typescript
DESARROLLADOR = USUARIO_NORMAL + SOLICITUDES_ASIGNADAS + GITHUB_INTEGRATION + PLANES_TÉCNICOS
```

---

## 🚀 **ORDEN DE IMPLEMENTACIÓN RECOMENDADO**

### 📋 **SECUENCIA ÓPTIMA:**
1. **Crear developerMiddleware.ts** (base para todo)
2. **Completar DeveloperController.ts** (funcionalidad core)
3. **Migrar GitHubService.ts** (servicio externo)
4. **Crear GitHubController.ts** (funcionalidad GitHub)
5. **Configurar rutas en Server.ts** (exposición)
6. **Testing y verificación** (validación)

### ⏱️ **TIEMPO ESTIMADO:**
- **Total**: 6-8 horas de desarrollo
- **Por archivo**: 1-1.5 horas cada uno
- **Testing**: 1 hora adicional

**¡ESTA GUÍA GARANTIZA UNA IMPLEMENTACIÓN EXITOSA DEL ROL DESARROLLADOR!** 🎯✨

