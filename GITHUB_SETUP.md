# 🔧 Configuración de GitHub para Solicitudes de Cambio

## ❌ Error Actual
Si ves errores 403 (Forbidden) en el frontend, es porque GitHub no está configurado correctamente.

## ✅ Solución: Configurar Variables de Entorno

### 1. Crear archivo `.env` en la carpeta `BACKEND_APP`

Crea un archivo llamado `.env` en la raíz del backend con el siguiente contenido:

```bash
# ============================================
# CONFIGURACIÓN DE GITHUB (REQUERIDA)
# ============================================

# Token personal de GitHub con permisos repo
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Tu nombre de usuario en GitHub
GITHUB_DEFAULT_OWNER=tu_usuario_github

# Nombres de los repositorios (sin el prefijo usuario/)
GITHUB_REPO_FRONTEND=FRONTEND_APP
GITHUB_REPO_BACKEND=BACKEND_APP

# ============================================
# OTRAS CONFIGURACIONES
# ============================================

DATABASE_URL="postgresql://usuario:password@localhost:5432/tu_base_datos?schema=public"
JWT_SECRET=tu_jwt_secret_muy_seguro_aqui
NODE_ENV=development
PORT=3001
```

### 2. Obtener Token de GitHub

1. Ve a [GitHub Settings > Tokens](https://github.com/settings/tokens)
2. Clic en "Generate new token (classic)"
3. Selecciona los siguientes permisos:
   - ✅ **repo** (acceso completo a repositorios)
   - ✅ **workflow** (actualizar workflows)
   - ✅ **write:packages** (subir paquetes)
4. Copia el token generado (ghp_...)

### 3. Configurar Valores

Reemplaza en el archivo `.env`:

```bash
# Ejemplo real:
GITHUB_TOKEN=ghp_1234567890abcdef1234567890abcdef12345678
GITHUB_DEFAULT_OWNER=oarm8
GITHUB_REPO_FRONTEND=FRONTEND_APP
GITHUB_REPO_BACKEND=BACKEND_APP
```

### 4. Reiniciar el Servidor Backend

```bash
cd BACKEND_APP
npm restart
# o
node index.js
```

## 🧪 Verificar Configuración

1. Ve al **DetalleSolicitudDesarrollador**
2. Si GitHub está configurado correctamente:
   - ✅ No aparecerá el mensaje de "GitHub No Configurado"
   - ✅ Los botones "Crear Branch" y "Crear PR" funcionarán
   - ✅ Se cargarán los tipos GitFlow automáticamente

## 🔍 Solución de Problemas

### Error: "GitHub no está configurado en el servidor"
- Verifica que el archivo `.env` existe en `BACKEND_APP/`
- Revisa que `GITHUB_TOKEN` tiene el formato correcto (ghp_...)
- Reinicia el servidor backend

### Error 403: Forbidden
- El token puede estar expirado o ser inválido
- Genera un nuevo token en GitHub
- Verifica que tienes acceso a los repositorios especificados

### Error: Repository not found
- Verifica que `GITHUB_DEFAULT_OWNER` es tu usuario de GitHub
- Asegúrate que `GITHUB_REPO_FRONTEND` y `GITHUB_REPO_BACKEND` existen
- Los repositorios deben ser públicos o el token debe tener acceso

## 🚀 Después de la Configuración

Una vez configurado GitHub correctamente, podrás:

1. **Validar tu token personal** desde el perfil de usuario
2. **Crear branches automáticamente** con nomenclatura GitFlow
3. **Crear Pull Requests** desde la interfaz web
4. **Cambiar estados** automáticamente cuando los PRs se mergean
5. **Polling automático** cada 3 minutos para detectar cambios

## 📝 Nota Importante

El archivo `.env` contiene información sensible y no debe subirse a Git. Ya está en el `.gitignore`. 