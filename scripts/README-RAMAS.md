# 🌿 Manual de Gestión de Ramas para Desarrolladores

## 🎯 Objetivo
Este manual te ayudará a integrar tu trabajo ya desarrollado con el sistema de solicitudes de cambio de la app.

## 📋 Requisitos previos
- Tener una solicitud de cambio creada y asignada
- Tener tu trabajo terminado en una rama local
- Acceso al servidor backend para ejecutar scripts

---

## 🚀 Proceso paso a paso

### **Paso 1: Obtener información de tu solicitud**

```bash
# Ejecutar sin parámetros para ver solicitudes disponibles
node scripts/calcular-nombre-rama.js
```

Esto te mostrará:
- Lista de solicitudes disponibles
- IDs de solicitudes
- Estados actuales

### **Paso 2: Calcular el nombre correcto de la rama**

```bash
# Sintaxis: node scripts/calcular-nombre-rama.js [ID_SOLICITUD] [TIPO_REPO]
node scripts/calcular-nombre-rama.js a1b2c3d4-e5f6-7890-abcd-ef1234567890 frontend
```

**Tipos de repositorio disponibles:**
- `frontend` - Para cambios en el frontend
- `backend` - Para cambios en el backend

**El script te dará:**
- ✅ Nombre exacto de la rama
- ✅ Comandos Git listos para copiar/pegar
- ✅ Comando para registrar en BD

### **Paso 3: Renombrar y subir tu rama**

```bash
# Renombrar tu rama local (usar el nombre que te dio el script)
git branch -m mi-rama-actual feature/SOL-12345678_frontend_20250629154530

# Subir la rama a GitHub
git push origin feature/SOL-12345678_frontend_20250629154530

# Configurar tracking
git branch --set-upstream-to=origin/feature/SOL-12345678_frontend_20250629154530
```

### **Paso 4: Registrar la rama en la base de datos**

```bash
# Sintaxis: node scripts/registrar-rama-bd.js [ID_SOLICITUD] [TIPO_REPO] "NOMBRE_RAMA"
node scripts/registrar-rama-bd.js a1b2c3d4-e5f6-7890-abcd-ef1234567890 frontend "feature/SOL-12345678_frontend_20250629154530"
```

**⚠️ Importante:** El nombre de la rama debe ir entre comillas

### **Paso 5: Continuar con el flujo normal**

Una vez registrada la rama:
1. Ve a la app web
2. Entra a tu solicitud de cambio
3. La rama aparecerá en la sección "Gestión de Ramas"
4. Crea el Pull Request desde la app
5. Envía a testing cuando esté listo

---

## 📝 Ejemplos prácticos

### **Ejemplo 1: Trabajo de Frontend**
```bash
# 1. Ver solicitudes
node scripts/calcular-nombre-rama.js

# 2. Calcular nombre (ejemplo con ID real)
node scripts/calcular-nombre-rama.js 7818a35f-03be-431c-a588-f57af97b682c frontend

# 3. Resultado esperado:
# feature/SOL-97b682c_frontend_20250629154530

# 4. Renombrar rama local
git branch -m mi-desarrollo-frontend feature/SOL-97b682c_frontend_20250629154530

# 5. Subir a GitHub
git push origin feature/SOL-97b682c_frontend_20250629154530

# 6. Registrar en BD
node scripts/registrar-rama-bd.js 7818a35f-03be-431c-a588-f57af97b682c frontend "feature/SOL-97b682c_frontend_20250629154530"
```

### **Ejemplo 2: Trabajo de Backend**
```bash
# 1. Calcular nombre para backend
node scripts/calcular-nombre-rama.js 7818a35f-03be-431c-a588-f57af97b682c backend

# 2. Resultado esperado:
# feature/SOL-97b682c_backend_20250629154530

# 3. Renombrar y subir
git branch -m mi-api-changes feature/SOL-97b682c_backend_20250629154530
git push origin feature/SOL-97b682c_backend_20250629154530

# 4. Registrar en BD
node scripts/registrar-rama-bd.js 7818a35f-03be-431c-a588-f57af97b682c backend "feature/SOL-97b682c_backend_20250629154530"
```

---

## 🔧 Solución de problemas

### **Error: "Ya existe una rama para este repositorio"**
```bash
# El script te preguntará si quieres reemplazarla
# Responde 's' para continuar o 'n' para cancelar
```

### **Error: "Solicitud no encontrada"**
```bash
# Verifica el ID de la solicitud
node scripts/calcular-nombre-rama.js
# Usa uno de los IDs mostrados en la lista
```

### **Error: "Tipo de repositorio inválido"**
```bash
# Solo usa: frontend o backend (en minúsculas)
node scripts/calcular-nombre-rama.js [ID] frontend
node scripts/calcular-nombre-rama.js [ID] backend
```

### **Error: "La rama ya existe en GitHub"**
```bash
# Si ya subiste una rama con ese nombre, puedes:
# 1. Eliminarla: git push origin --delete nombre-rama
# 2. O usar --force: git push origin nombre-rama --force
```

---

## 📊 Verificar estado

### **Ver ramas registradas de una solicitud**
```bash
# Usar el script con el ID de solicitud
node scripts/registrar-rama-bd.js [ID_SOLICITUD]
# Te mostrará todas las ramas registradas
```

---

## 🎯 Flujo completo resumido

1. **Preparar**: `node scripts/calcular-nombre-rama.js [ID] [tipo]`
2. **Renombrar**: `git branch -m mi-rama nueva-rama`
3. **Subir**: `git push origin nueva-rama`
4. **Registrar**: `node scripts/registrar-rama-bd.js [ID] [tipo] "nueva-rama"`
5. **Continuar**: Crear PR desde la app web

---

## 💡 Tips importantes

- ✅ **Siempre usa el nombre exacto** que te da el script
- ✅ **Pon comillas** alrededor del nombre de rama al registrar
- ✅ **Verifica el ID** de tu solicitud antes de empezar
- ✅ **Haz backup** de tu rama antes de renombrar
- ✅ **Sube cambios** antes de renombrar la rama

---

## 🆘 Ayuda

Si tienes problemas:
1. Verifica que tienes acceso al servidor backend
2. Asegúrate de que tu solicitud esté en estado correcto
3. Contacta al administrador del sistema
4. Revisa los logs de error en la consola

¡Listo! Con estos pasos tu trabajo se integrará perfectamente con el sistema de la app. 🚀 