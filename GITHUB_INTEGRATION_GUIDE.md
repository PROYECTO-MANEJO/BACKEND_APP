# 🚀 Guía de Integración GitHub - Backend

Esta guía te permitirá configurar y probar paso a paso la nueva implementación de GitHub para el sistema de solicitudes de cambio.

## 📋 Requisitos Previos

### 1. Token de GitHub
- Ir a GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
- Generar un nuevo token con los siguientes permisos:
  - `repo` (acceso completo a repositorios)
  - `workflow` (para GitHub Actions si es necesario)
  - `read:org` (leer información de la organización)

### 2. Repositorios de GitHub
- Tener al menos un repositorio donde crear ramas y PRs
- El repositorio debe tener una rama `main` o `master`
- Asegúrate de tener permisos de escritura en el repositorio

## ⚙️ Configuración

### 1. Variables de Entorno

Crear o actualizar el archivo `.env` en el directorio backend con:

```env
# Configuración existente de la base de datos
DATABASE_URL="postgresql://usuario:password@localhost:5432/nombre_bd"
JWT_SECRET="tu_jwt_secret_aqui"

# Nueva configuración de GitHub
GITHUB_TOKEN="ghp_tu_token_personal_aqui"
GITHUB_OWNER="tu-usuario-github"
GITHUB_REPO_FRONTEND="nombre-repo-frontend"
GITHUB_REPO_BACKEND="nombre-repo-backend"
GITHUB_BASE_URL="https://api.github.com"

# Configuración del servidor
PORT=3000
NODE_ENV=development
```

### 2. Verificar Dependencias

Asegúrate de que `axios` esté instalado:

```bash
npm install axios
```

### 3. Iniciar el Servidor

```bash
npm run dev
# o
nodemon index.js
```

## 🧪 Testing con Postman

### Configuración Inicial de Postman

1. **Crear una nueva colección** llamada "GitHub Integration API"

2. **Configurar variables de entorno en Postman:**
   - `base_url`: `http://localhost:3000`
   - `auth_token`: Token JWT de un usuario autenticado
   - `solicitud_id`: ID de una solicitud de cambio existente

3. **Headers globales para todas las peticiones:**
   ```
   Content-Type: application/json
   x-token: {{auth_token}}
   ```

### 🔐 Paso 1: Obtener Token de Autenticación

**POST** `{{base_url}}/api/auth/login`

Body (JSON):
```json
{
  "cor_cue": "admin@uta.edu.ec",
  "pas_usu": "tu_password"
}
```

**Respuesta esperada:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id_usu": "uuid-del-usuario",
    "rol": "MASTER"
  }
}
```

**Acción:** Copiar el `token` y guardarlo en la variable `auth_token` de Postman.

### 📊 Paso 2: Verificar Información del Repositorio

**GET** `{{base_url}}/api/github/repository/frontend`

**Respuesta esperada:**
```json
{
  "success": true,
  "data": {
    "name": "nombre-repo-frontend",
    "full_name": "tu-usuario/nombre-repo-frontend",
    "private": false,
    "html_url": "https://github.com/tu-usuario/nombre-repo-frontend",
    "default_branch": "main",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-15T00:00:00Z"
  }
}
```

### 📈 Paso 3: Obtener Estadísticas del Repositorio

**GET** `{{base_url}}/api/github/repository/frontend/stats`

**Respuesta esperada:**
```json
{
  "success": true,
  "data": {
    "repository": "nombre-repo-frontend",
    "branches_count": 5,
    "open_prs_count": 2,
    "recent_closed_prs_count": 10,
    "branches": ["main", "develop", "feature/login"],
    "open_prs": [
      {
        "number": 15,
        "title": "Solicitud #12345678: Mejora en el login",
        "branch": "SOL-12345678-mejora-en-el-login"
      }
    ]
  }
}
```

### 🌿 Paso 4: Crear una Rama para una Solicitud

**POST** `{{base_url}}/api/github/solicitud/{{solicitud_id}}/branch`

Body (JSON):
```json
{
  "repoType": "frontend",
  "baseBranch": "main"
}
```

**Respuesta esperada:**
```json
{
  "success": true,
  "message": "Rama creada exitosamente",
  "data": {
    "branch_name": "SOL-12345678-titulo-de-la-solicitud",
    "sha": "abc123def456...",
    "url": "https://github.com/tu-usuario/repo/tree/SOL-12345678-titulo",
    "repository": "nombre-repo-frontend",
    "base_branch": "main"
  }
}
```

### 🔄 Paso 5: Crear un Pull Request

**POST** `{{base_url}}/api/github/solicitud/{{solicitud_id}}/pull-request`

Body (JSON):
```json
{
  "baseBranch": "main"
}
```

**Respuesta esperada:**
```json
{
  "success": true,
  "message": "Pull Request creado exitosamente",
  "data": {
    "pr_number": 42,
    "pr_title": "Solicitud #12345678: Título de la solicitud",
    "pr_url": "https://github.com/tu-usuario/repo/pull/42",
    "pr_state": "open",
    "branch_name": "SOL-12345678-titulo-de-la-solicitud",
    "base_branch": "main",
    "repository": "nombre-repo-frontend",
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

### 📋 Paso 6: Obtener Información del Pull Request

**GET** `{{base_url}}/api/github/solicitud/{{solicitud_id}}/pull-request`

**Respuesta esperada:**
```json
{
  "success": true,
  "data": {
    "pr_number": 42,
    "pr_title": "Solicitud #12345678: Título de la solicitud",
    "pr_url": "https://github.com/tu-usuario/repo/pull/42",
    "pr_state": "open",
    "branch_name": "SOL-12345678-titulo-de-la-solicitud",
    "base_branch": "main",
    "repository": "nombre-repo-frontend",
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z",
    "merged_at": null,
    "mergeable": true,
    "mergeable_state": "clean"
  }
}
```

### 📝 Paso 7: Obtener Commits de la Rama

**GET** `{{base_url}}/api/github/solicitud/{{solicitud_id}}/branch/commits`

**Respuesta esperada:**
```json
{
  "success": true,
  "data": {
    "branch_name": "SOL-12345678-titulo-de-la-solicitud",
    "repository": "nombre-repo-frontend",
    "commits": [
      {
        "sha": "abc123def456789...",
        "short_sha": "abc123d",
        "message": "Initial commit for solicitud changes",
        "author": "Tu Nombre",
        "author_email": "tu-email@example.com",
        "date": "2024-01-15T10:30:00Z",
        "url": "https://github.com/tu-usuario/repo/commit/abc123def456789"
      }
    ]
  }
}
```

### 📝 Paso 8: Obtener Commits del Pull Request

**GET** `{{base_url}}/api/github/solicitud/{{solicitud_id}}/pull-request/commits`

**Respuesta esperada:**
```json
{
  "success": true,
  "data": {
    "pr_number": 42,
    "repository": "nombre-repo-frontend",
    "commits": [
      {
        "sha": "abc123def456789...",
        "short_sha": "abc123d",
        "message": "Implement new feature for solicitud",
        "author": "Desarrollador",
        "author_email": "dev@example.com",
        "date": "2024-01-15T11:00:00Z",
        "url": "https://github.com/tu-usuario/repo/commit/abc123def456789"
      }
    ]
  }
}
```

### 🔄 Paso 9: Hacer Merge del Pull Request

**PUT** `{{base_url}}/api/github/solicitud/{{solicitud_id}}/pull-request/merge`

Body (JSON):
```json
{
  "mergeMethod": "merge"
}
```

**Respuesta esperada:**
```json
{
  "success": true,
  "message": "Pull Request mergeado exitosamente",
  "data": {
    "merged": true,
    "sha": "def456abc123...",
    "message": "Merge pull request #42 from SOL-12345678-titulo",
    "pr_number": 42,
    "repository": "nombre-repo-frontend"
  }
}
```

### 📊 Paso 10: Obtener Información Completa de GitHub

**GET** `{{base_url}}/api/github/solicitud/{{solicitud_id}}/info`

**Respuesta esperada:**
```json
{
  "success": true,
  "data": {
    "solicitud_id": "12345678-1234-1234-1234-123456789012",
    "has_branch": true,
    "has_pr": true,
    "branch_name": "SOL-12345678-titulo-de-la-solicitud",
    "repository": "nombre-repo-frontend",
    "repo_url": "https://github.com/tu-usuario/repo/tree/SOL-12345678-titulo",
    "pr_number": 42,
    "pr_url": "https://github.com/tu-usuario/repo/pull/42",
    "pr_state": "merged",
    "base_branch": "main",
    "last_sync": "2024-01-15T12:00:00Z",
    "pr_info": {
      "pr_number": 42,
      "pr_title": "Solicitud #12345678: Título de la solicitud",
      "pr_state": "merged",
      "merged_at": "2024-01-15T12:00:00Z",
      "mergeable": null,
      "mergeable_state": "clean"
    }
  }
}
```

### 🔄 Paso 11: Sincronizar Información de GitHub

**POST** `{{base_url}}/api/github/solicitud/{{solicitud_id}}/sync`

**Respuesta esperada:**
```json
{
  "success": true,
  "message": "Información sincronizada exitosamente",
  "data": {
    "github_last_sync": "2024-01-15T12:30:00Z",
    "github_pr_state": "merged",
    "github_merged_at": "2024-01-15T12:00:00Z"
  }
}
```

## 🚨 Casos de Error Comunes

### Error 400: Token Inválido
```json
{
  "success": false,
  "message": "GITHUB_TOKEN no está configurado"
}
```
**Solución:** Verificar que el token esté configurado correctamente en las variables de entorno.

### Error 400: Repositorio No Encontrado
```json
{
  "success": false,
  "message": "Repositorio frontend no configurado"
}
```
**Solución:** Verificar que `GITHUB_REPO_FRONTEND` esté configurado en las variables de entorno.

### Error 400: Rama Ya Existe
```json
{
  "success": false,
  "message": "La rama ya existe"
}
```
**Solución:** La solicitud ya tiene una rama asociada. Usar la rama existente o eliminarla desde GitHub.

### Error 400: PR Ya Existe
```json
{
  "success": false,
  "message": "La solicitud ya tiene un Pull Request asociado",
  "data": {
    "existing_pr": 42,
    "pr_url": "https://github.com/tu-usuario/repo/pull/42"
  }
}
```
**Solución:** La solicitud ya tiene un PR. Usar el PR existente.

### Error 404: Solicitud No Encontrada
```json
{
  "success": false,
  "message": "Solicitud no encontrada"
}
```
**Solución:** Verificar que el ID de la solicitud sea correcto y que exista en la base de datos.

## 🔧 Troubleshooting

### 1. Verificar Configuración
```bash
# Verificar variables de entorno
echo $GITHUB_TOKEN
echo $GITHUB_OWNER
echo $GITHUB_REPO_FRONTEND
```

### 2. Verificar Permisos del Token
- El token debe tener permisos de `repo`
- El usuario debe tener acceso de escritura al repositorio

### 3. Verificar Estado de la Base de Datos
```sql
-- Verificar campos de GitHub en una solicitud
SELECT 
  id_sol,
  titulo_sol,
  github_branch_name,
  github_repository,
  github_pr_number,
  github_pr_state,
  github_last_sync
FROM solicitudes_cambio 
WHERE id_sol = 'tu-solicitud-id';
```

### 4. Logs del Servidor
Revisar los logs del servidor para errores específicos:
```bash
tail -f logs/server.log
```

## 📚 Flujo Completo de Trabajo

1. **Crear Solicitud** → Estado: `APROBADA`
2. **Crear Rama** → Asocia rama a la solicitud
3. **Desarrollar** → Hacer commits en la rama
4. **Crear PR** → Asocia PR a la solicitud
5. **Revisar** → Estado: `EN_TESTING`
6. **Aprobar y Mergear** → Estado: `COMPLETADA`

## 🎯 Próximos Pasos

Una vez que todas las pruebas en Postman funcionen correctamente:

1. ✅ Backend completamente funcional
2. 🔄 Implementar frontend (siguiente fase)
3. 🔗 Integrar con el flujo de solicitudes existente
4. 🧪 Pruebas de integración completas
5. 🚀 Despliegue en producción

## 📞 Soporte

Si encuentras algún problema durante las pruebas:

1. Verificar logs del servidor
2. Confirmar configuración de variables de entorno
3. Validar permisos del token de GitHub
4. Revisar estado de la base de datos

---

**¡La implementación del backend está completa y lista para pruebas!** 🎉 